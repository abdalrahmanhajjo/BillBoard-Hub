/** The commercial profile attached to an advertiser account. */
export type Advertiser = {
  id: string;
  /** The user account that owns this profile. */
  userId: string;
  companyName: string;
  phone: string;
  address: string;
  createdAt: string | null;
  updatedAt: string | null;
};
