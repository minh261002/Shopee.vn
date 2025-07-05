import z from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  slug: z
    .string()
    .min(1, "Slug là bắt buộc")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"
    ),
  image: z.string().optional(),
  featured: z.boolean(),
  parentId: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
