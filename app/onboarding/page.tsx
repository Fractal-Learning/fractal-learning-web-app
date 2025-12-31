'use client';

import * as React from 'react';
import { useSession } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from './_actions';
import { StateCombobox } from './state-combobox';

type DistrictOption = { leaid: string; leaName: string };
type SchoolOption = { ncessch: string; schoolName: string; leaid: string };

export default function OnboardingPage() {
  const [error, setError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [selectedState, setSelectedState] = React.useState<string>('');
  const [districts, setDistricts] = React.useState<DistrictOption[]>([]);
  const [selectedLeaid, setSelectedLeaid] = React.useState<string>('');
  const [schools, setSchools] = React.useState<SchoolOption[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>('');
  const [schoolName, setSchoolName] = React.useState<string>('');

  const districtsCacheRef = React.useRef<Map<string, DistrictOption[]>>(
    new Map()
  );
  const schoolsCacheRef = React.useRef<Map<string, SchoolOption[]>>(new Map());

  const { session } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!selectedState) {
        setDistricts([]);
        setSelectedLeaid('');
        setSchools([]);
        setSelectedSchoolId('');
        return;
      }

      const cached = districtsCacheRef.current.get(selectedState);
      if (cached) {
        setDistricts(cached);
        return;
      }

      try {
        const res = await fetch(`/api/geo/districts?state=${selectedState}`);
        if (!res.ok) throw new Error(`Failed to load districts (${res.status})`);
        const data = (await res.json()) as { districts: DistrictOption[] };
        const list = Array.isArray(data.districts) ? data.districts : [];
        districtsCacheRef.current.set(selectedState, list);
        if (!cancelled) setDistricts(list);
      } catch (e) {
        console.warn('[Onboarding] Failed to load districts', e);
        if (!cancelled) setDistricts([]);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedState]);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!selectedLeaid) {
        setSchools([]);
        setSelectedSchoolId('');
        return;
      }

      const cached = schoolsCacheRef.current.get(selectedLeaid);
      if (cached) {
        setSchools(cached);
        return;
      }

      try {
        const res = await fetch(`/api/geo/schools?leaid=${selectedLeaid}`);
        if (!res.ok) throw new Error(`Failed to load schools (${res.status})`);
        const data = (await res.json()) as { schools: SchoolOption[] };
        const list = Array.isArray(data.schools) ? data.schools : [];
        schoolsCacheRef.current.set(selectedLeaid, list);
        if (!cancelled) setSchools(list);
      } catch (e) {
        console.warn('[Onboarding] Failed to load schools', e);
        if (!cancelled) setSchools([]);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedLeaid]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      const formData = new FormData(event.currentTarget);
      // Hidden inputs don't participate in native "required" validation.
      // Ensure the user actually selected a state from the dropdown.
      const selectedState = formData.get('state');
      if (!selectedState) {
        setFieldErrors({ state: ['State is required.'] });
        setIsSubmitting(false);
        return;
      }

      const res = await completeOnboarding(formData);

      if (res?.error) {
        console.error('Server action error:', res.error);
        setError(res.error);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
        setIsSubmitting(false);
      } else {
        // Force a session reload to update the token with new claims
        try {
          await session?.reload();
        } catch (e) {
          console.warn('Session reload failed', e);
        }

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
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  District (optional)
                </label>
                <select
                  value={selectedLeaid}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSelectedLeaid(next);
                    setSelectedSchoolId('');
                  }}
                  disabled={!selectedState || districts.length === 0}
                  className="block w-full rounded-lg border-none bg-gray-100 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-[#6c47ff] sm:text-sm sm:leading-6"
                >
                  <option value="">
                    {!selectedState
                      ? 'Select a state first'
                      : districts.length
                        ? 'Select a district'
                        : 'No districts found'}
                  </option>
                  {districts.map((d) => (
                    <option key={d.leaid} value={d.leaid}>
                      {d.leaName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  School (optional)
                </label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => {
                    const ncessch = e.target.value;
                    setSelectedSchoolId(ncessch);
                    const s = schools.find((x) => x.ncessch === ncessch);
                    if (s) setSchoolName(s.schoolName);
                  }}
                  disabled={!selectedLeaid || schools.length === 0}
                  className="block w-full rounded-lg border-none bg-gray-100 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-[#6c47ff] sm:text-sm sm:leading-6"
                >
                  <option value="">
                    {!selectedLeaid
                      ? 'Select a district first'
                      : schools.length
                        ? 'Select a school'
                        : 'No schools found'}
                  </option>
                  {schools.map((s) => (
                    <option key={s.ncessch} value={s.ncessch}>
                      {s.schoolName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <input
              id="schoolName"
              name="schoolName"
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="block w-full rounded-lg border-none bg-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#6c47ff] sm:text-sm sm:leading-6"
              placeholder="Lincoln Middle School"
            />
            {fieldErrors.schoolName && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.schoolName[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              State
            </label>
            <StateCombobox
              name="state"
              inputId="state"
              onSelect={(s) => {
                setSelectedState(s?.code ?? '');
                // Reset downstream selections
                setSelectedLeaid('');
                setSchools([]);
                setSelectedSchoolId('');
              }}
            />
            {fieldErrors.state && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.state[0]}
              </p>
            )}
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
            {fieldErrors.yearsExperience && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.yearsExperience[0]}
              </p>
            )}
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
            {fieldErrors.grades && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.grades[0]}
              </p>
            )}
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
