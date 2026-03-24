# Form Components & Standards Documentation

## Overview

This document outlines the professional form components, validation schemas, and standards implemented for CellTech's B2B wholesale platform.

## Design Standards

### Typography Hierarchy
- **Labels:** `text-sm font-medium text-ct-text`
- **Hints/Secondary text:** `text-xs text-ct-text-secondary`
- **Errors:** `text-xs text-red-500`

### Color Hierarchy
- **Primary accent (actions):** `text-ct-accent` (#00E5C0)
- **Primary text:** `text-ct-text` (#F2F5FA)
- **Secondary text:** `text-ct-text-secondary` (#A7B1C6)
- **Backgrounds:** `bg-ct-bg-secondary` (#111725)
- **Borders:** `border-white/10`
- **Errors:** `text-red-500`
- **Success:** `text-green-500`

### WCAG Compliance
All form components meet **WCAG AA (4.5:1)** contrast ratio minimum:
- Text on background: 4.5:1+ ✓
- UI components: 3:1+ ✓
- Focus states clearly visible

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Single column on mobile, multi-column on larger screens

### Animation & Motion (Framer Motion)
- **Entrance animations:** 300ms, easeOut
- **Feedback animations:** 200ms, smooth
- **Loading spinners:** 2s, infinite rotation
- **Micro-interactions:** Subtle scale/opacity on hover/focus
- No animations on disabled states

## Form Components

### 1. **FormInput**
A text input component with validation states, icons, and error messages.

**Props:**
```typescript
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;           // Field label
  error?: string;           // Error message
  hint?: string;           // Helper text
  isSuccess?: boolean;     // Show success state
  isLoading?: boolean;     // Show loading spinner
}
```

**Features:**
- Real-time validation feedback
- Success/error icons
- Loading spinner support
- Auto-focus ring on validation
- Disabled state styling

**Usage:**
```tsx
<FormInput
  id="email"
  label="Email Address"
  type="email"
  placeholder="user@example.com"
  error={errors.email}
  hint="We'll never share your email"
  required
/>
```

---

### 2. **FormSelect**
A select dropdown with validation states and custom styling.

**Props:**
```typescript
interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
  placeholder?: string;
  isSuccess?: boolean;
  isLoading?: boolean;
}
```

**Features:**
- Custom styled dropdown
- Disabled options support
- Placeholder text
- Validation feedback
- Chevron icon indicator

**Usage:**
```tsx
<FormSelect
  id="state"
  label="State"
  placeholder="Select a state"
  options={states}
  value={formData.state}
  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
  error={errors.state}
  required
/>
```

---

### 3. **FormCheckbox**
A custom checkbox with label, description, and validation.

**Props:**
```typescript
interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  description?: string;
}
```

**Features:**
- Custom checkbox styling
- Description text support
- Click-through on label
- Smooth animation on check
- Accessibility-first approach

**Usage:**
```tsx
<FormCheckbox
  id="terms"
  label="I agree to the Terms and Conditions"
  description="Read our terms before proceeding"
  error={errors.terms}
  required
/>
```

---

### 4. **FormTextarea**
A multi-line text input with character count and validation.

**Props:**
```typescript
interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  isSuccess?: boolean;
  isLoading?: boolean;
  showCharCount?: boolean;
}
```

**Features:**
- Character counter (optional)
- Max length validation
- Resizable prevention (UX friendly)
- Validation feedback
- Loading state

**Usage:**
```tsx
<FormTextarea
  id="notes"
  label="Additional Notes"
  placeholder="Tell us more..."
  maxLength={1000}
  showCharCount
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  error={errors.notes}
/>
```

---

### 5. **FormRadio**
A radio button group with descriptions and validation.

**Props:**
```typescript
interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface FormRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  options: RadioOption[];
  hint?: string;
}
```

**Features:**
- Custom radio styling
- Description text per option
- Disabled option support
- Staggered animation
- Click-through support

**Usage:**
```tsx
<FormRadio
  name="shippingMethod"
  label="Shipping Method"
  value={selectedMethod}
  onChange={(e) => setSelectedMethod(e.target.value)}
  options={[
    { value: 'standard', label: 'Standard Shipping', description: '5-7 business days' },
    { value: 'express', label: 'Express Shipping', description: '2-3 business days' },
  ]}
  error={errors.shippingMethod}
  required
/>
```

---

### 6. **PhoneInput**
A specialized text input for phone numbers with automatic formatting.

**Props:**
```typescript
interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  isSuccess?: boolean;
  isLoading?: boolean;
}
```

**Features:**
- Auto-formatting: `(123) 456-7890`
- Phone icon indicator
- International format support
- Validation feedback
- Keyboard friendly

**Usage:**
```tsx
<PhoneInput
  id="phone"
  label="Phone Number"
  placeholder="(123) 456-7890"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  error={errors.phone}
/>
```

---

### 7. **AddressForm**
A composite form component for full address entry.

**Props:**
```typescript
interface AddressFormProps {
  onAddressChange: (address: Partial<AddressFormData>) => void;
  errors?: Partial<Record<keyof AddressFormData, string>>;
  values?: Partial<AddressFormData>;
  disabled?: boolean;
}
```

**Features:**
- Street address input
- City, State, ZIP fields
- Country selection
- Pre-populated US states list
- Grid layout (responsive)
- Integrated validation

**Usage:**
```tsx
<AddressForm
  values={addressValues}
  errors={addressErrors}
  onAddressChange={(address) => setAddress(address)}
  disabled={isSubmitting}
/>
```

---

### 8. **PasswordStrength**
A visual password strength indicator with criteria checklist.

**Props:**
```typescript
interface PasswordStrengthProps {
  password: string;
  showCriteria?: boolean;
}
```

**Features:**
- Real-time strength calculation
- Animated strength meter
- Criteria checklist
- Color-coded feedback (red/amber/green)
- Smooth animations

**Usage:**
```tsx
<PasswordStrength
  password={password}
  showCriteria={true}
/>
```

---

## Validation Schemas

All validation is handled with **Zod** for type-safe schema validation.

### Schema Location
`src/lib/validation.ts`

### Available Schemas

#### emailSchema
```typescript
emailSchema: z.string().min(1).email()
```

#### passwordSchema
```typescript
passwordSchema: z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'One uppercase letter')
  .regex(/[0-9]/, 'One number')
  .regex(/[^A-Za-z0-9]/, 'One special character')
```

#### phoneSchema
```typescript
phoneSchema: z.string().min(10).max(20).regex(/international format/)
```

#### nameSchema
```typescript
nameSchema: z.string().min(2).max(50).regex(/^[a-zA-Z\s'-]+$/)
```

#### addressSchema
```typescript
addressSchema: z.object({
  street: z.string().min(5).max(100),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  country: z.string().min(2),
})
```

#### loginSchema
```typescript
loginSchema: z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})
```

#### registerSchema
```typescript
registerSchema: z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  company: companyNameSchema,
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
```

### Using Schemas with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validation';

export function RegisterForm() {
  const { register, formState: { errors }, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="Email"
        {...register('email')}
        error={errors.email?.message}
      />
      {/* More fields */}
    </form>
  );
}
```

---

## Utility Components

### Skeleton Loaders
Loading placeholders with subtle animations.

**Components:**
- `Skeleton` - Generic skeleton
- `FormInputSkeleton` - Form field placeholder
- `ProductCardSkeleton` - Product card placeholder
- `TableRowSkeleton` - Table row placeholder
- `PageSectionSkeleton` - Full section placeholder

**Usage:**
```tsx
import { FormInputSkeleton, PageSectionSkeleton } from '@/components/Skeleton';

{isLoading ? <FormInputSkeleton /> : <FormInput {...props} />}
```

---

### Error Boundary
Catches and displays runtime errors gracefully.

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
}
```

**Usage:**
```tsx
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

**Features:**
- Displays error page with header/footer
- Dev mode shows full error stack
- Reset functionality
- Professional error messaging

---

## Error & 404 Pages

### NotFound (404)
Route: `*` (catch-all)

**Features:**
- Large 404 heading with animation
- Helpful navigation links
- Professional styling
- Persistent header/footer

**Usage:**
```tsx
<Route path="*" element={<NotFound />} />
```

---

### ErrorPage
Displayed when JavaScript errors occur.

**Props:**
```typescript
interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}
```

**Features:**
- Error icon with animation
- User-friendly messaging
- Dev mode shows full error details
- Stack trace in dev mode
- Retry and home buttons

---

## Integration Examples

### Login Form
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validation';
import { FormInput } from '@/components/forms';

export function LoginForm() {
  const { register, formState: { errors }, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    // Call auth API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <FormInput
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
      />
      <button type="submit" className="btn-primary w-full">
        Sign In
      </button>
    </form>
  );
}
```

---

## Best Practices

1. **Always use Zod schemas** for validation consistency
2. **Validate on blur** for better UX (not real-time)
3. **Use React Hook Form** for efficient form state management
4. **Provide clear error messages** - be specific about what's wrong
5. **Use hints** to guide users (e.g., password requirements)
6. **Keep disabled states visible** but non-interactive
7. **Test on mobile** - ensure responsive layout
8. **Use semantic HTML** for accessibility
9. **Provide success feedback** when appropriate
10. **Never remove focus indicators** - they're essential for accessibility

---

## Accessibility Checklist

- ✅ All inputs have associated labels
- ✅ Error messages linked to fields
- ✅ Focus indicators clearly visible
- ✅ Color contrast meets WCAG AA (4.5:1)
- ✅ Keyboard navigation fully supported
- ✅ ARIA labels where needed
- ✅ Form validation feedback clear
- ✅ Disabled states properly styled
- ✅ Loading states indicated
- ✅ Required fields marked with asterisk

---

## Performance Considerations

- Framer Motion animations are GPU-accelerated
- Lazy load heavy components
- Use React.memo for expensive form inputs
- Debounce validation on real-time checks
- Cache validation schemas
- Minimize re-renders with proper memoization

---

## Future Enhancements

- [ ] File upload component (FormFileUpload)
- [ ] Date picker component (FormDatePicker)
- [ ] Multi-select component (FormMultiSelect)
- [ ] Autocomplete component (FormAutocomplete)
- [ ] Slider component (FormSlider)
- [ ] Integration with tRPC mutations
- [ ] Server-side validation feedback
- [ ] Optimistic updates
