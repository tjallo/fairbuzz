import z from "zod";

export const personSchema = z.object({
  uuid: z.uuid(),
  name: z.string().trim().min(1, "Name is required"),
});

export type Person = z.infer<typeof personSchema>;
