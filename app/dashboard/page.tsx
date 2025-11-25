import { SignOutButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  // Middleware already handles authentication protection
  const user = await currentUser();
  const userName = user?.firstName || user?.username || 'there';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Fractal Learning
          {userName !== 'there' ? `, ${userName}` : ''}!
        </h1>

        <p className="text-lg text-gray-600">
          Your learning journey begins here.
        </p>

        <div className="pt-8">
          <SignOutButton>
            <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Logout
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
