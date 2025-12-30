'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">ResQ-Link</h1>
          <p className="text-muted-foreground">Sign in to your emergency response account</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-card border-white/10',
              headerTitle: 'text-white',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'bg-white/5 border-white/10 hover:bg-white/10 text-white',
              formButtonPrimary: 'bg-primary text-black hover:bg-primary/90',
              footerActionLink: 'text-primary hover:text-primary/80',
              formFieldInput: 'bg-white/5 border-white/10 text-white',
              formFieldLabel: 'text-white',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-primary',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
        />
      </div>
    </div>
  );
}
