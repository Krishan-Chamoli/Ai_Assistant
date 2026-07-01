'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/store/auth-context';
import { useRouter } from 'next/navigation';
import { Mail, User, AlertCircle, Lock, Sparkles } from 'lucide-react';

const authSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional().or(z.literal('')),
});

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = async (data) => {
    setError(null);
    setIsSubmitting(true);

    if (isSignUp && (!data.name || data.name.trim().length < 2)) {
      setError('Full Name is required for creating a new account.');
      setIsSubmitting(false);
      return;
    }

    try {
      await login(
        data.email, 
        data.password, 
        isSignUp ? data.name : undefined, 
        isSignUp
      );
    } catch (err) {
      setError(err);
      setIsSubmitting(false);
    }
  };

  const handleToggleMode = (mode) => {
    setIsSignUp(mode);
    setError(null);
    reset({
      email: '',
      password: '',
      name: '',
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in select-none">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/20">
            <Sparkles className="h-8 w-8 animate-pulse-subtle" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Nebuloid Tech Studio</h1>
          <p className="text-muted-foreground mt-2">Mini AI Content Assistant Dashboard</p>
        </div>

        {/* Auth form card */}
        <div className="glass rounded-2xl border border-border p-8 shadow-xl bg-card">
          
          {/* Sign In vs Sign Up Mode Tabs */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isSignUp 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isSignUp 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 leading-relaxed">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Conditional Full Name input (Sign Up Only) */}
            {isSignUp && (
              <div className="animate-fade-in">
                <label htmlFor="name" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60"
                    {...register('name')}
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-input text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 ${
                    errors.email ? 'border-destructive/50 focus:ring-destructive' : 'border-border'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground/60">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-input text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 ${
                    errors.password ? 'border-destructive/50 focus:ring-destructive' : 'border-border'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Security details disclosure */}
          <p className="text-center text-[10px] text-muted-foreground/50 mt-6 leading-relaxed">
            Passwords are encrypted using bcrypt. User sessions are verified via HTTP-only JSON Web Token cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
