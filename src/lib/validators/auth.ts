import { z } from "zod";

const currentYear = new Date().getFullYear();

const birthYearRequired = z
  .string()
  .regex(/^\d{4}$/, "Doğum yılı 4 haneli olmalı.")
  .transform((value) => Number(value))
  .pipe(
    z
      .number()
      .int()
      .min(1900, "Doğum yılı geçersiz.")
      .max(currentYear, "Doğum yılı gelecekte olamaz."),
  );

export const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta girin."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı."),
});

export const registerSchema = loginSchema.extend({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalı."),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalı."),
  birthYear: birthYearRequired,
});

export const profileSchema = z.object({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalı."),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalı."),
  birthYear: birthYearRequired,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
