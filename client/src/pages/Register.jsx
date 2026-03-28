import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

export default function Register() {
  const { register, socialLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      const res = await socialLogin(provider);
      if (res.success) {
        toast.success(`Account created successfully!`);
        navigate('/');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(`${provider} registration failed`);
    }
  };

  return (
    <div className="min-h-screen auth-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center flex-col items-center">
          <div className="mb-6 flex justify-center">
            <Logo className="scale-125 origin-center" />
          </div>
          <h2 className="text-center text-2xl font-semibold tracking-tight text-[var(--text-main)]">
            Create an account
          </h2>
          <p className="mt-2 text-center text-[13px] text-[var(--text-muted)]">
            Sprinto – Manage work at the speed of focus. <br className="hidden sm:block" />
            Already have an account? <Link to="/login" className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="glass-panel py-8 px-4 shadow sm:rounded-xl sm:px-10 relative overflow-hidden backdrop-blur-xl border border-[var(--border-subtle)]">
          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              id="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email address"
              id="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />

            <div className="pt-2">
              <Button type="submit" className="w-full" loading={loading} icon={UserPlus}>
                Create Account
              </Button>
            </div>
            
            <p className="text-xs text-center text-[var(--text-muted)] mt-4">
              By creating an account, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="mt-6 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-strong)]"></div></div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[var(--bg-surface)] px-2 text-[var(--text-muted)] text-xs uppercase tracking-wide">Or register with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button variant="secondary" className="w-full max-w-xs" type="button" onClick={() => handleSocialLogin('google')}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
