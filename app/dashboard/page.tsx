import { SignOutButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';

export default async function DashboardPage() {
  // Middleware already handles authentication protection
  const user = await currentUser();
  const userName = user?.firstName || user?.username || 'there';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#FAFAFA]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-8">
          <Image
            src="/fractal_logo.png"
            alt="Fractal Learning Logo"
            width={120}
            height={120}
            priority
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Fractal Learning
          {userName !== 'there' ? `, ${userName}` : ''}!
        </h1>

        <p className="text-lg text-gray-600">
          Your learning journey begins here.
        </p>

        <div className="pt-8">
          <SignOutButton>
            <button className="bg-[#6c47ff] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5639cc] transition-colors">
              Logout
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
