export type Direction = "at-mn" | "mn-at";
export type ListingType = "trip" | "shipment";
export type ListingStatus = "active" | "closed";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  phone: string | null;
}

export interface Trip {
  id: number;
  user_id: number;
  direction: Direction;
  from_city: string | null;
  to_city: string | null;
  travel_date: string;
  available_kg: number;
  price_per_kg: number;
  notes: string | null;
  status: ListingStatus;
  created_at: string;
  user_name: string;
}

export interface Shipment {
  id: number;
  user_id: number;
  direction: Direction;
  from_city: string | null;
  to_city: string | null;
  weight_kg: number;
  ready_date: string | null;
  deadline_date: string | null;
  description: string;
  offer_price: number | null;
  status: ListingStatus;
  created_at: string;
  user_name: string;
}

export interface Conversation {
  id: number;
  listing_type: ListingType;
  listing_id: number;
  starter_id: number;
  owner_id: number;
  created_at: string;
}

export interface ConversationPreview extends Conversation {
  other_name: string;
  listing_title: string;
  last_body: string | null;
  last_at: string | null;
  unread: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  created_at: string;
  read_at: string | null;
  sender_name: string;
}

export interface Review {
  id: number;
  conversation_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
}

export interface UserRating {
  avg: number;
  count: number;
}

export interface UserProfile {
  id: number;
  name: string;
  created_at: string;
}

/** Server action-уудын useActionState-д зориулсан нийтлэг төлөв */
export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Алдаа гарахад формын утгыг хадгалж буцаана (React form reset хийдэг тул) */
  values?: Record<string, string>;
  success?: boolean;
}
