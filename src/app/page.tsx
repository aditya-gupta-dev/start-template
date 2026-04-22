'use client'

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <SignedIn>
        <ModeToggle />
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button>
            <h1>Sign in</h1>
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
