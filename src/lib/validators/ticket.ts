import { z } from "zod";

export const assignTicketSchema = z.object({
  partyId: z.uuid("Parti seçin."),
  userId: z.uuid("Kullanıcı seçin."),
  maxEntries: z.coerce.number().int().min(1, "En az 1 giriş hakkı olmalı."),
  note: z.string().optional(),
});

export const scanTicketSchema = z.object({
  token: z.string().min(16, "QR token geçersiz."),
  partyId: z.uuid("Parti seçimi gerekli."),
  requestedEntries: z.coerce.number().int().min(1).default(1),
});

export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type ScanTicketInput = z.infer<typeof scanTicketSchema>;
