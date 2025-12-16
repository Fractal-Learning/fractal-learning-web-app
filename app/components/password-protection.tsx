'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { verifyPassword } from '../_actions';
import Image from 'next/image';

export function PasswordProtection() {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('password', password);

      const result = await verifyPassword(formData);

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || 'Incorrect password');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[#FAFAFA] min-h-screen flex flex-col relative">
      <div className="w-full bg-white max-w-300 mx-auto flex-1 flex flex-col border-l border-r border-[#F2F2F2] relative">
        <div className="flex-1 flex items-center justify-center p-10 relative z-10">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="flex justify-center mb-8">
              <Image
                src="/fractal_logo.png"
                alt="Fractal Learning Logo"
                width={120}
                height={120}
                priority
              />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-[#131316]">
              Password Required
            </h1>

            <p className="text-[#5E5F6E] text-[1.0625rem]">
              Please enter the password to access this site
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] text-[#131316] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6c47ff] focus:border-transparent"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !password}
                className="w-full px-6 py-3 rounded-full bg-[#6c47ff] text-white text-sm font-semibold hover:bg-[#5639cc] active:bg-[#4b32b2] active:scale-95 transition-all duration-200 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Verifying...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

