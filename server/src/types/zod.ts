import z from "zod";
export const registerSchema = z
  .object({
    fName: z.string().min(1, "First name is required"),
    lName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Confirm password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    role: z.enum(["ADMIN", "USER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const resturantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  faceBookUrl: z
    .string()
    .url("Invalid Facebook URL")
    .optional()
    .or(z.literal("")),
  tikTokUrl: z.string().url("Invalid TikTok URL").optional().or(z.literal("")),
  instagramUrl: z
    .string()
    .url("Invalid Instagram URL")
    .optional()
    .or(z.literal("")),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().or(z.literal("")),
  price: z.number().min(0, "Price must be positive"),
  category: z.enum([
    "hot drink",
    "cold drink",
    "alcoholic drink",
    "vegan food",
    "chinese",
    "nepali",
    "thai",
    "continental",
  ]),
  quantityType: z.enum([
    "serving",
    "half serving",
    "full serving",
    "half plate",
    "full plate",
  ]),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  isAvailable: z.boolean().optional(),
});

export const menuItemUpdateSchema = menuItemSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
