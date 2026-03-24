# Quick Start Guide - Using Form Components

## Import

```typescript
import { 
  FormInput, 
  FormSelect, 
  FormCheckbox, 
  FormTextarea, 
  FormRadio, 
  PhoneInput, 
  AddressForm, 
  PasswordStrength 
} from '@/components/forms';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validation';
```

---

## Basic Login Form Example

```typescript
export function LoginForm() {
  const { register, formState: { errors }, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur, not real-time
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Call your API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // Handle response
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <FormInput
        label="Email Address"
        type="email"
        placeholder="user@example.com"
        {...register('email')}
        error={errors.email?.message}
        hint="We'll never share your email"
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

## Full Registration Form Example

```typescript
import { registerSchema, type RegisterFormData } from '@/lib/validation';

export function RegisterForm() {
  const { register, formState: { errors }, watch, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    // Call registration API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          {...register('firstName')}
          error={errors.firstName?.message}
          required
        />
        <FormInput
          label="Last Name"
          {...register('lastName')}
          error={errors.lastName?.message}
          required
        />
      </div>

      <FormInput
        label="Company Name"
        {...register('company')}
        error={errors.company?.message}
        required
      />

      <FormInput
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        required
      />

      <div>
        <FormInput
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          required
        />
        <div className="mt-4">
          <PasswordStrength password={password} showCriteria={true} />
        </div>
      </div>

      <FormInput
        label="Confirm Password"
        type="password"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
        required
      />

      <FormCheckbox
        label="I agree to the Terms and Conditions"
        {...register('agreeToTerms')}
        error={errors.agreeToTerms?.message}
        required
      />

      <button type="submit" className="btn-primary w-full">
        Create Account
      </button>
    </form>
  );
}
```

---

## Form with Address (Composite Component)

```typescript
import { addressSchema, type AddressFormData } from '@/lib/validation';

export function CheckoutForm() {
  const [address, setAddress] = useState<Partial<AddressFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddressChange = (updatedAddress: Partial<AddressFormData>) => {
    setAddress(prev => ({ ...prev, ...updatedAddress }));
  };

  const onSubmit = async () => {
    try {
      const validatedAddress = addressSchema.parse(address);
      // Submit order with address
    } catch (error) {
      // Handle validation errors
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="heading-display text-2xl">Shipping Address</h2>
      
      <AddressForm
        values={address}
        errors={errors}
        onAddressChange={handleAddressChange}
      />

      <button onClick={onSubmit} className="btn-primary">
        Continue to Payment
      </button>
    </div>
  );
}
```

---

## Form with Radio Options

```typescript
export function ShippingForm() {
  const { register, formState: { errors }, handleSubmit } = useForm({
    defaultValues: { method: 'standard' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormRadio
        name="shippingMethod"
        label="Select Shipping Method"
        value={watch('method')}
        onChange={(e) => setValue('method', e.target.value)}
        options={[
          {
            value: 'standard',
            label: 'Standard Shipping',
            description: '5-7 business days • FREE'
          },
          {
            value: 'express',
            label: 'Express Shipping',
            description: '2-3 business days • $15.00'
          },
          {
            value: 'overnight',
            label: 'Overnight Shipping',
            description: 'Next business day • $50.00'
          },
        ]}
        error={errors.method?.message}
        required
      />

      <button type="submit" className="btn-primary w-full">
        Confirm Shipping
      </button>
    </form>
  );
}
```

---

## Loading & Error States

```typescript
export function FormExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Name"
        isLoading={isLoading}
        isSuccess={isSuccess}
        disabled={isLoading}
      />

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        className="btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

---

## Using Skeleton Loaders

```typescript
import { FormInputSkeleton, PageSectionSkeleton } from '@/components/Skeleton';

export function ProductList() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <PageSectionSkeleton />;
  }

  return <div>{/* Your content */}</div>;
}

export function FormWithLoading() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <>
          <FormInputSkeleton />
          <FormInputSkeleton />
        </>
      ) : (
        <>
          <FormInput label="Field 1" />
          <FormInput label="Field 2" />
        </>
      )}
    </div>
  );
}
```

---

## Error Handling

All forms are wrapped in `<ErrorBoundary>` in App.tsx.

For page-level errors, the `<NotFound />` component is automatically shown for 404s.

For runtime errors, `<ErrorPage />` is displayed with:
- Error ID for tracking
- Dev mode stack traces
- Retry button
- Support contact info

---

## Validation Best Practices

### 1. Use Correct Validation Mode
```typescript
// On blur (recommended for better UX)
useForm({ mode: 'onBlur' })

// On change (for real-time feedback)
useForm({ mode: 'onChange' })

// On submit only
useForm({ mode: 'onSubmit' })
```

### 2. Show Helpful Error Messages
```typescript
<FormInput
  error={errors.email?.message}
  hint="Format: user@example.com"
/>
```

### 3. Password Confirmation
```typescript
const password = watch('password');

<FormInput
  label="Confirm Password"
  type="password"
  {...register('confirmPassword')}
  error={errors.confirmPassword?.message}
  hint={password ? 'Must match password above' : ''}
/>
```

### 4. Async Validation
```typescript
const { register } = useForm({
  resolver: async (data) => {
    try {
      await mySchema.parseAsync(data);
      // Check email exists on server
      const exists = await checkEmailExists(data.email);
      if (exists) {
        throw new Error('Email already registered');
      }
      return { values: data, errors: {} };
    } catch (error) {
      // Handle errors
    }
  },
});
```

---

## Responsive Grid Examples

```typescript
// Two columns on tablet+
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <FormInput label="First Name" />
  <FormInput label="Last Name" />
</div>

// Three columns on desktop
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <FormInput label="Field 1" />
  <FormInput label="Field 2" />
  <FormInput label="Field 3" />
</div>
```

---

## Common Patterns

### Success Message After Submit
```typescript
const [successMessage, setSuccessMessage] = useState('');

const onSubmit = async (data) => {
  await submitForm(data);
  setSuccessMessage('Form submitted successfully!');
  setTimeout(() => setSuccessMessage(''), 5000);
};

{successMessage && (
  <motion.div
    className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {successMessage}
  </motion.div>
)}
```

### Disabled Fields Based on Other Values
```typescript
const watch = useWatch();
const isCompanyField = watch('userType') === 'business';

<FormInput
  label="Company Name"
  {...register('company')}
  disabled={!isCompanyField}
/>
```

---

## Accessibility Tips

✅ Always use `htmlFor` on labels
✅ Always provide `id` on inputs
✅ Always include error messages for failed validation
✅ Use `required` attribute for required fields
✅ Provide hints for complex fields
✅ Use semantic HTML
✅ Ensure color contrast 4.5:1+
✅ Test with keyboard navigation

---

## Component Props Summary

| Component | Key Props |
|-----------|-----------|
| FormInput | label, error, hint, type, isSuccess, isLoading |
| FormSelect | label, error, options, placeholder, isSuccess |
| FormCheckbox | label, error, description, hint |
| FormTextarea | label, error, hint, showCharCount, maxLength |
| FormRadio | label, error, options, hint |
| PhoneInput | label, error, hint, isSuccess, isLoading |
| AddressForm | onAddressChange, values, errors, disabled |
| PasswordStrength | password, showCriteria |

---

## Need Help?

See **FORM_COMPONENTS.md** for:
- Detailed component documentation
- All available props
- Advanced usage patterns
- Best practices
- Accessibility checklist
