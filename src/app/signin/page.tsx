import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex h-[calc(100vh-200px)] w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Sign in</h3>
          <p className="text-sm text-muted-foreground">
            Use your email and password to sign in
          </p>
        </div>

        <div className="items-center w-full flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/dashboard">Continue With Google</Link>
          </Button>

          <Button className="w-full" asChild>
            <Link href="/dashboard">Continue With Github</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
