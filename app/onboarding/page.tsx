'use client';

import * as React from 'react';
import { useUser, useSession } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from './_actions';

export default function OnboardingPage() {
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    console.log('Submitting form...');

    try {
      const formData = new FormData(event.currentTarget);

      console.log('Calling server action...');
      const res = await completeOnboarding(formData);
      console.log('Server action response:', res);

      if (res?.error) {
        console.error('Server action error:', res.error);
        setError(res.error);
        setIsSubmitting(false);
      } else {
        console.log('Server success. Reloading session...');

        // Force a session reload to update the token with new claims
        try {
          await session?.reload();
          console.log('Session reloaded successfully');
        } catch (e) {
          console.warn('Session reload failed', e);
        }

        console.log('Onboarding complete. Refreshing to trigger redirect...');
        // router.refresh() re-fetches server components.
        // The layout will then see the updated session claims and redirect the user.
        router.refresh();
      }
    } catch (e) {
      console.error('Unexpected client error:', e);
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete your profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tell us a bit about your teaching background
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="schoolName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              School Name
            </label>
            <input
              id="schoolName"
              name="schoolName"
              type="text"
              required
              className="block w-full rounded-lg border-none bg-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#6c47ff] sm:text-sm sm:leading-6"
              placeholder="Lincoln High School"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              State
            </label>
            <div className="relative">
              <select
                id="state"
                name="state"
                required
                className="block w-full rounded-lg border-none bg-gray-100 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-[#6c47ff] sm:text-sm sm:leading-6 appearance-none"
              >
                <option value="">Select a State</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="NY">New York</option>
                <option value="FL">Florida</option>
                <option value="IL">Illinois</option>
                {/* Add more states as needed */}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="yearsExperience"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Years of Experience
            </label>
            <input
              id="yearsExperience"
              name="yearsExperience"
              type="number"
              min="0"
              required
              className="block w-full rounded-lg border-none bg-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#6c47ff] sm:text-sm sm:leading-6"
              placeholder="5"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Grades Taught
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'K',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
              ].map((grade) => (
                <label
                  key={grade}
                  className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition-all overflow-hidden group has-[:checked]:bg-[#6c47ff] has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#6c47ff] has-[:focus-visible]:ring-offset-2"
                >
                  <input
                    type="checkbox"
                    name="grades"
                    value={grade}
                    className="sr-only peer"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.click();
                      }
                    }}
                  />
                  <span className="text-gray-900 text-sm font-medium peer-checked:text-white">
                    {grade}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#6c47ff] hover:bg-[#5639cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6c47ff] ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Completing Setup...' : 'Complete Setup'}
          </button>
        </div>
      </form>
    </div>
  );
}
