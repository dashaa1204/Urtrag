export type ListingType = "trip" | "shipment";
export type ListingStatus = "active" | "closed";

/** Хэрэглэгчийн id нь Supabase Auth-ийн uuid. */
export type UserId = string;

export interface SessionUser {
  id: UserId;
  email: string;
  name: string;
  phone: string | null;
  /** Оршин суугаа улс — ISO 3166-1 alpha-2. */
  country: string | null;
  bio: string | null;
  /** avatars bucket доторх зам — lib/avatar.ts URL болгоно. */
  avatarPath: string | null;
  /** Имэйлийн холбоосоор баталгаажсан эсэх — тасалбарын тэмдэг үүнээс шалтгаална. */
  emailVerified: boolean;
  createdAt: Date;
}

export interface Trip {
  id: number;
  user_id: UserId;
  /** ISO 3166-1 alpha-2 — "AT", "MN" */
  from_country: string;
  to_country: string;
  from_city: string | null;
  to_city: string | null;
  travel_date: string;
  available_kg: number;
  price_per_kg: number;
  notes: string | null;
  status: ListingStatus;
  created_at: Date;
  user_name: string;
}

export interface Shipment {
  id: number;
  user_id: UserId;
  /** ISO 3166-1 alpha-2 — "AT", "MN" */
  from_country: string;
  to_country: string;
  from_city: string | null;
  to_city: string | null;
  weight_kg: number;
  ready_date: string | null;
  deadline_date: string | null;
  description: string;
  offer_price: number | null;
  status: ListingStatus;
  created_at: Date;
  user_name: string;
}

export interface Conversation {
  id: number;
  listing_type: ListingType;
  listing_id: number;
  starter_id: UserId;
  owner_id: UserId;
  created_at: Date;
}

export interface ConversationPreview extends Conversation {
  other_name: string;
  other_avatar: string | null;
  listing_title: string;
  last_body: string | null;
  last_at: Date | null;
  unread: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: UserId;
  body: string;
  created_at: Date;
  read_at: Date | null;
  sender_name: string;
}

export interface Review {
  id: number;
  conversation_id: number;
  reviewer_id: UserId;
  reviewee_id: UserId;
  rating: number;
  comment: string | null;
  created_at: Date;
  reviewer_name: string;
}

export interface UserRating {
  avg: number;
  count: number;
}

export type VerificationStatus = "pending" | "approved" | "rejected";

/** Хэрэглэгчид өөрт нь харагдах баталгаажуулалтын төлөв. */
export interface Verification {
  status: VerificationStatus;
  social_url: string | null;
  /** Татгалзсан шалтгаан. */
  note: string | null;
  submitted_at: Date;
  reviewed_at: Date | null;
}

/** Хянагчийн жагсаалтад — баримтын зам нь signed URL үүсгэхэд хэрэгтэй. */
export interface PendingVerification extends Verification {
  user_id: UserId;
  name: string;
  front_path: string | null;
  back_path: string | null;
}

export interface UserProfile {
  id: UserId;
  name: string;
  country: string | null;
  bio: string | null;
  avatar_path: string | null;
  created_at: Date;
}

/** Server action-уудын useActionState-д зориулсан нийтлэг төлөв */
export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Алдаа гарахад формын утгыг хадгалж буцаана (React form reset хийдэг тул) */
  values?: Record<string, string>;
  success?: boolean;
  /** Бүртгэлийн дараа имэйл баталгаажуулах шаардлагатайг мэдэгдэнэ */
  notice?: string;
}
