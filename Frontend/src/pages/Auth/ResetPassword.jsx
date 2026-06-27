import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button.jsx';
import Input from '@/components/common/Input.jsx';
import api from '@/services/api.js';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
const navigate = useNavigate();

const [showPassword, setShowPassword] = useState(false);

const [formData, setFormData] = useState({
password: '',
confirmPassword: '',
});

const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);

const handleChange = (e) => {
setFormData((prev) => ({
...prev,
[e.target.name]: e.target.value,
}));
};

const handleSubmit = async (e) => {
e.preventDefault();

```
if (formData.password.length < 8) {
  setError('Password must be at least 8 characters');
  return;
}

if (formData.password !== formData.confirmPassword) {
  setError('Passwords do not match');
  return;
}

setError('');
setIsLoading(true);

try {
  await api.post('/users/reset-password', {
    password: formData.password,
  });

  navigate('/login');
} catch (err) {
  setError(err.message || 'Unable to reset password');
} finally {
  setIsLoading(false);
}
```

};

return ( <div className="flex flex-col gap-6">

```
  <div>
    <h3 className="text-xl font-bold text-[var(--color-brand-text-primary)]">
      Reset Password
    </h3>

    <p className="text-xs text-[var(--color-brand-text-secondary)] mt-1">
      Create a strong new password
    </p>
  </div>

  {error && (
    <div className="flex items-center gap-2 p-3 rounded-xl border text-xs bg-red-50 border-red-200 text-red-500">
      <AlertCircle className="w-4 h-4" />
      {error}
    </div>
  )}

  <form onSubmit={handleSubmit} className="flex flex-col gap-4">

    <div className="relative">
      <Input
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        className="pl-10"
      />

      <Lock className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-500" />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3.5 bottom-3.5"
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>

    <Input
      label="Confirm Password"
      type={showPassword ? 'text' : 'password'}
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleChange}
    />

    <Button type="submit" isLoading={isLoading}>
      Reset Password
      <CheckCircle className="w-4 h-4 ml-2" />
    </Button>

  </form>
</div>


);
};

export default ResetPassword;
