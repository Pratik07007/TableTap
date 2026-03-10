import z from 'zod';

export const registerSchema = z
  .object({
    fName: z.string().min(1, 'First name is required'),
    lName: z.string().min(1, 'Last name is required'),
    email: z.email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long')
      .regex(/[a-z]/, 'Confirm password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Confirm password must contain at least one uppercase letter')
      .regex(/\d/, 'Confirm password must contain at least one number')
      .regex(/[@$!%*?&]/, 'Confirm password must contain at least one special character'),
    role: z.enum(['ADMIN', 'USER']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
});

export const resturantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.email('Invalid email address'),
  faceBookUrl: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  tikTokUrl: z.url('Invalid TikTok URL').optional().or(z.literal('')),
  instagramUrl: z.url('Invalid Instagram URL').optional().or(z.literal('')),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
  category: z.string(),
  units: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    },
    z.array(
      z.object({
        unit: z.string(),
        price: z.number().min(0, 'Price must be positive'),
      })
    )
  ),
  isAvailable: z.boolean().optional(),
});

export const updateMenuItemSchema = menuItemSchema.partial();

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[@$!%*?&]/, 'Password must contain at least one special character'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters long')
      .regex(/[a-z]/, 'Confirm password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Confirm password must contain at least one uppercase letter')
      .regex(/\d/, 'Confirm password must contain at least one number')
      .regex(/[@$!%*?&]/, 'Confirm password must contain at least one special character'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const updateResturantSchema = resturantSchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResturantInput = z.infer<typeof resturantSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type UpdateResturantInput = z.infer<typeof updateResturantSchema>;

export const generateBillSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

export const payBillSchema = z
  .object({
    billId: z.string().min(1, 'Bill ID is required'),
    paymentMethod: z.enum(['CASH', 'ONLINE']),
    amountTendered: z.number().nonnegative().optional(),
  })
  .refine((data) => {
    if (data.paymentMethod === 'CASH') {
      return typeof data.amountTendered === 'number';
    }
    return true;
  });

export type GenerateBillInput = z.infer<typeof generateBillSchema>;
export type PayBillInput = z.infer<typeof payBillSchema>;
