import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { Footer } from './_template/components/footer';

export default function Home() {
  return (
    <>
      <main className="bg-[#FAFAFA] min-h-screen flex flex-col relative">
        <div className="w-full bg-white max-w-300 mx-auto flex-1 flex flex-col border-l border-r border-[#F2F2F2] relative">
          <div className="flex-1 flex items-center justify-center p-10 relative z-10">
            <div className="w-full max-w-lg text-center space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-[#131316]">
                Welcome to Fractal Learning
              </h1>

              <p className="text-[#5E5F6E] text-[1.0625rem]">
                Start your learning journey today
              </p>

              <div className="flex flex-col items-center gap-4 pt-4">
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 rounded-full bg-[#131316] text-white text-sm font-semibold hover:bg-[#2a2a2a] active:bg-[#1a1a1a] active:scale-95 transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    Go to Dashboard
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignUpButton>
                    <button className="px-6 py-3 rounded-full bg-[#131316] text-white text-sm font-semibold hover:bg-[#2a2a2a] active:bg-[#1a1a1a] active:scale-95 transition-all duration-200 hover:scale-105 cursor-pointer">
                      Sign up
                    </button>
                  </SignUpButton>

                  <p className="text-[#5E5F6E] text-sm pt-2">
                    Already have an account?{' '}
                    <Link
                      href="/sign-in"
                      className="text-[#131316] font-semibold hover:underline active:text-[#2a2a2a] transition-colors cursor-pointer"
                    >
                      Sign in
                    </Link>
                  </p>
                </SignedOut>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute left-0 right-0 bottom-0 h-75 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </main>
      <Footer />
    </>
  );
}
