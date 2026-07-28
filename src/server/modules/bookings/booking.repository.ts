import { connectToDatabase } from '@/server/db/mongoose';
import { BookingModel, type BookingDocument } from '@/server/modules/bookings/booking.model';
import type { BookingFilter, BookingRecord } from '@/server/modules/bookings/booking.types';
import type { BookingStatus, PaymentStatus } from '@/shared/types/booking';

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
};
