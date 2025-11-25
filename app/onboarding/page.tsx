"use client";

import * as React from "react";
import { useUser, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./_actions";

export default function OnboardingPage() {
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    console.log("Submitting form...");

    try {
      const formData = new FormData(event.currentTarget);
      
      console.log("Calling server action...");
      const res = await completeOnboarding(formData);
      console.log("Server action response:", res);
      
      if (res?.error) {
        console.error("Server action error:", res.error);
        setError(res.error);
        setIsSubmitting(false);
      } else {
        console.log("Server success. Reloading session...");
        
        // Force a session reload to update the token with new claims
        try {
            await session?.reload();
            console.log("Session reloaded successfully");
        } catch (e) {
            console.warn("Session reload failed", e);
        }
        
        console.log("Redirecting to /");
        router.push("/");
        
        // Fallback redirect if router.push is slow
        setTimeout(() => {
            window.location.href = "/";
        }, 1000);
      }
    } catch (e) {
      console.error("Unexpected client error:", e);
      setError("An unexpected error occurred");
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
        <div className="rounded-md shadow-sm -space-y-px">
          <div className="mb-4">
            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
              School Name
            </label>
            <input
              id="schoolName"
              name="schoolName"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Lincoln High School"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              id="state"
              name="state"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            >
              <option value="">Select a State</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="NY">New York</option>
              <option value="FL">Florida</option>
              <option value="IL">Illinois</option>
              {/* Add more states as needed */}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              id="yearsExperience"
              name="yearsExperience"
              type="number"
              min="0"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="5"
            />
          </div>

          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-1">Grades Taught</span>
            <div className="grid grid-cols-3 gap-2">
              {["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((grade) => (
                <label key={grade} className="inline-flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="grades"
                    value={grade}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700">{grade}</span>
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
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Completing Setup..." : "Complete Setup"}
          </button>
        </div>
      </form>
    </div>
  );
}
