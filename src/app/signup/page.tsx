import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-[calc(100vh-200px)] w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Create an account</h3>
          <p className="text-sm text-muted-foreground">
            Enter your details to create your account
          </p>
        </div>

        <div className="items-center w-full flex flex-col gap-4">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
