import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in — hardvanta Admin" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <LoginForm />
    </div>
  );
}
