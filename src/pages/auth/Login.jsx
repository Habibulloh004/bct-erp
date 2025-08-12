import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});


export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(s => s.login);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    await login(values);
    const to = location.state?.from?.pathname || '/app';
    navigate(to, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <div>
        <label className="text-sm">Email</label>
        <input className="w-full border rounded px-3 py-2" {...register('email')} />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label className="text-sm">Password</label>
        <input type="password" className="w-full border rounded px-3 py-2" {...register('password')} />
        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
      </div>
      <button disabled={isSubmitting} className="w-full bg-black text-white rounded py-2">
        {isSubmitting ? '...' : 'Login'}
      </button>
    </form>
  );
}
