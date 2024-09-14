import { z } from "zod";

export const gedcomNodeSchema: z.ZodSchema = z.object({
  level: z.number().nonnegative().int(),
  tag: z.string().nonempty({ message: "Tag is required." }),
  pointer: z.string().optional(),
  data: z.string().optional(),
  children: z.array(z.lazy(() => gedcomNodeSchema)).optional(),
});

export type GedcomNodeSchema = z.infer<typeof gedcomNodeSchema>;
