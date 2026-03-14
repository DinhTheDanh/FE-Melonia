// utils/registerSchema.ts
import * as z from "zod";

export const useRegisterSchema = (t: any) => {
  const step1 = z.object({
    email: z.string().email(t("auth.errors.email_invalid")),
  });

  const step2 = z.object({
    name: z.string().min(1, t("auth.errors.required")),
    password: z
      .string()
      .min(10, t("auth.validation.password_short", { min: 10 }))
      .regex(/[a-zA-Z]/, t("auth.register.criteria_letter"))
      .regex(/[\d\W_]/, t("auth.register.criteria_special")),
  });

  const step3 = z.object({
    agree_terms: z.literal(true, {
      message: t("auth.errors.required"),
    }),
  });

  return { step1, step2, step3 };
};
