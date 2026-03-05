import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">
            Administration
          </h1>
          <p className="text-2xl font-bold text-slate-900">
            Les Gants Meleciens
          </p>
        </div>
        <SignIn afterSignInUrl="/admin/dashboard" />
      </div>
    </div>
  );
}
