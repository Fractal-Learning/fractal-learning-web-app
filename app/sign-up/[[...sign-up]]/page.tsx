import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex justify-center py-24">
      <SignUp
        routing="path"
        path="/sign-up"
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
