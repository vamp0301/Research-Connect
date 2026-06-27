import React, { useState } from 'react';
import { Mail, AlertCircle, Send } from 'lucide-react';
import Input from '@/components/common/Input.jsx';
import Button from '@/components/common/Button.jsx';
import api from '@/services/api.js';

const ForgotPassword = () => {
const [email, setEmail] = useState('');
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
e.preventDefault();

```
setError('');
setSuccess('');

if (!email) {
  setError('Email address is required');
  return;
}

setIsLoading(true);

try {
  await api.post('/users/forgot-password', { email });

  setSuccess(
    'Password reset instructions have been sent to your email.'
  );
} catch (err) {
  setError(err.message || 'Unable to process request');
} finally {
  setIsLoading(false);
}
```

};

return ( <div className="flex flex-col gap-6">

```
  <div>
    <h3 className="text-xl font-bold text-[var(--color-brand-text-primary)]">
      Forgot Password
    </h3>

    <p className="text-xs text-[var(--color-brand-text-secondary)] mt-1">
      Enter your registered email address
    </p>
  </div>

  {error && (
    <div className="p-3 rounded-xl text-xs bg-red-50 border border-red-200 text-red-500 flex gap-2">
      <AlertCircle className="w-4 h-4" />
      {error}
    </div>
  )}

  {success && (
    <div className="p-3 rounded-xl text-xs bg-green-50 border border-green-200 text-green-600">
      {success}
    </div>
  )}

  <form onSubmit={handleSubmit} className="flex flex-col gap-4">

    <div className="relative">
      <Input
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@institution.edu"
        className="pl-10"
      />

      <Mail className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-500" />
    </div>

    <Button type="submit" isLoading={isLoading}>
      Send Reset Link
      <Send className="w-4 h-4 ml-2" />
    </Button>

  </form>
</div>

);
};

export default ForgotPassword;
