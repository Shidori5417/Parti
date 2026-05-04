export type UserRole = "user" | "admin" | "scanner";
export type PartyStatus = "draft" | "published" | "cancelled";
export type TicketStatus = "active" | "used" | "revoked";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: number | null;
  email: string;
  role: UserRole;
};

export type Party = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  important_notes: string | null;
  location_name: string | null;
  address: string | null;
  starts_at: string;
  ends_at: string | null;
  price: number | null;
  currency: string;
  cover_image_url: string | null;
  status: PartyStatus;
};

export type Ticket = {
  id: string;
  party_id: string;
  user_id: string;
  holder_first_name: string;
  holder_last_name: string;
  max_entries: number;
  used_entries: number;
  status: TicketStatus;
  note: string | null;
  parties?: Pick<Party, "title" | "starts_at" | "location_name"> | null;
};
