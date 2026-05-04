import { z } from "zod";

export const partySchema = z.object({
  title: z.string().min(3, "Parti adı en az 3 karakter olmalı."),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug küçük harf, sayı ve tire içermeli."),
  description: z.string().optional(),
  importantNotes: z.string().optional(),
  locationName: z.string().min(2, "Mekan adı gerekli."),
  address: z.string().optional(),
  startsAt: z.string().min(1, "Başlangıç tarihi gerekli."),
  endsAt: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  currency: z.string().default("TRY"),
  coverImageUrl: z.url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "cancelled"]),
});

export type PartyInput = z.infer<typeof partySchema>;
