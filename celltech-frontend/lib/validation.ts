import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

// Password validation - at least 8 chars, 1 uppercase, 1 number, 1 special char
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Phone number validation (basic international format)
export const phoneSchema = z
  .string()
  .min(10, 'Please enter a valid phone number')
  .max(20, 'Phone number is too long')
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid phone number');

// Company name validation
export const companyNameSchema = z
  .string()
  .min(2, 'Company name must be at least 2 characters')
  .max(100, 'Company name must be less than 100 characters');

// First/Last name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Address validation
export const addressSchema = z.object({
  street: z
    .string()
    .min(5, 'Street address is required')
    .max(100, 'Street address is too long'),
  city: z
    .string()
    .min(2, 'City is required')
    .max(50, 'City is too long'),
  state: z
    .string()
    .min(2, 'State is required')
    .max(50, 'State is too long'),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'),
  country: z
    .string()
    .min(2, 'Country is required'),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register form validation
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  company: companyNameSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Quote request form validation
export const quoteRequestSchema = z.object({
  email: emailSchema,
  company: companyNameSchema,
  phone: phoneSchema.optional(),
  items: z.array(z.object({
    sku: z.string().min(1, 'SKU is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

// Password reset form validation
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Set new password validation
export const setNewPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SetNewPasswordFormData = z.infer<typeof setNewPasswordSchema>;

// Account settings form validation
export const accountSettingsSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: companyNameSchema,
});

export type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>;
