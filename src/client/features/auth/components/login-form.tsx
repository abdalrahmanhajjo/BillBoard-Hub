"use client";


export function LoginForm() {
  return (
    <form className="w-full max-w-md space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        Sign in
      </button>
    </form>
  );
}
