import { connectToDatabase } from '@/server/db/mongoose';
import { BookingModel, type BookingDocument } from '@/server/modules/bookings/booking.model';
import type {
  AdvertiserBookingActivityRow,
  BookingFilter,
  BookingRecord,
} from '@/server/modules/bookings/booking.types';
import { BOOKING_STATUSES, PAYMENT_STATUSES } from '@/shared/constants/booking';
import type { BookingStatus, PaymentStatus } from '@/shared/types/booking';

/** Statuses whose value counts as recognized revenue. */
const RECOGNIZED_STATUSES = [BOOKING_STATUSES.APPROVED, BOOKING_STATUSES.COMPLETED];
/** Statuses that void a reservation, so nothing on them is still owed. */
const VOID_STATUSES = [BOOKING_STATUSES.CANCELLED, BOOKING_STATUSES.REJECTED];
/** Payment states that still owe money. */
const OWING_PAYMENT_STATUSES = [
  PAYMENT_STATUSES.PENDING,
  PAYMENT_STATUSES.UNPAID,
  PAYMENT_STATUSES.PARTIALLY_PAID,
];

export const bookingRepository = {
  async create(record: BookingRecord): Promise<BookingDocument> {
    await connectToDatabase();
    const created = await BookingModel.create(record);
    return created.toObject() as BookingDocument;
  },

  async findById(bookingId: string): Promise<BookingDocument | null> {
    await connectToDatabase();
    return BookingModel.findById(bookingId).lean<BookingDocument>().exec();
  },

  async findMany(filter: BookingFilter = {}): Promise<BookingDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (filter.advertiserId) query.advertiserId = filter.advertiserId;
    if (filter.billboardId) query.billboardId = filter.billboardId;
    if (filter.status) query.status = filter.status;
    return BookingModel.find(query).sort({ createdAt: -1 }).lean<BookingDocument[]>().exec();
  },

  /**
   * Bookings on the same billboard, in a blocking status, whose inclusive date
   * window overlaps [startDate, endDate]. Two inclusive ranges overlap when
   * each starts on or before the other ends.
   */
  async findOverlapping(
    billboardId: string,
    startDate: Date,
    endDate: Date,
    statuses: readonly BookingStatus[],
    excludeId?: string,
  ): Promise<BookingDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      billboardId,
      status: { $in: [...statuses] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return BookingModel.find(query).lean<BookingDocument[]>().exec();
  },

  async updateStatus(bookingId: string, status: BookingStatus): Promise<BookingDocument | null> {
    await connectToDatabase();
    return BookingModel.findByIdAndUpdate(bookingId, { status }, { new: true })
      .lean<BookingDocument>()
      .exec();
  },

  async updatePaymentStatus(
    bookingId: string,
    paymentStatus: PaymentStatus,
  ): Promise<BookingDocument | null> {
    await connectToDatabase();
    return BookingModel.findByIdAndUpdate(bookingId, { paymentStatus }, { new: true })
      .lean<BookingDocument>()
      .exec();
  },

  /**
   * Per-advertiser reservation activity for the admin directory.
   *
   * Grouped twice on purpose: once per advertiser *and* currency so money is
   * never added across currencies, then once per advertiser to collapse the
   * counts. The leading sort makes `$first` mean "from the most recent
   * reservation", which is where the company and contact details come from.
   */
  async aggregateAdvertiserActivity(now = new Date()): Promise<AdvertiserBookingActivityRow[]> {
    await connectToDatabase();

    return BookingModel.aggregate<AdvertiserBookingActivityRow>([
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          bookingCurrency: {
            $ifNull: ['$invoice.currency', { $ifNull: ['$pricing.currency', 'USD'] }],
          },
          bookingTotal: { $ifNull: ['$pricing.total', 0] },
        },
      },
      {
        $group: {
          _id: { advertiserId: '$advertiserId', currency: '$bookingCurrency' },
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUSES.PENDING] }, 1, 0] },
          },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', BOOKING_STATUSES.APPROVED] },
                    { $gte: ['$endDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          spend: {
            $sum: {
              $cond: [{ $in: ['$status', RECOGNIZED_STATUSES] }, '$bookingTotal', 0],
            },
          },
          outstanding: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $not: [{ $in: ['$status', VOID_STATUSES] }] },
                    { $in: ['$paymentStatus', OWING_PAYMENT_STATUSES] },
                  ],
                },
                '$bookingTotal',
                0,
              ],
            },
          },
          lastBookingAt: { $max: '$createdAt' },
          companyName: { $first: '$company.name' },
          country: { $first: '$company.country' },
          phone: { $first: '$billing.phone' },
        },
      },
      { $sort: { lastBookingAt: -1 } },
      {
        $group: {
          _id: '$_id.advertiserId',
          total: { $sum: '$total' },
          pending: { $sum: '$pending' },
          active: { $sum: '$active' },
          lastBookingAt: { $max: '$lastBookingAt' },
          companyName: { $first: '$companyName' },
          country: { $first: '$country' },
          phone: { $first: '$phone' },
          spend: { $push: { currency: '$_id.currency', amount: '$spend' } },
          outstanding: { $push: { currency: '$_id.currency', amount: '$outstanding' } },
        },
      },
    ]).exec();
  },
};
