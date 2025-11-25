import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex justify-center py-24">
      <SignIn
        routing="path"
        path="/sign-in"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
          },
        }}
      />
    </div>
  );
}
