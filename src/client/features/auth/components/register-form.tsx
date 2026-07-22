"use client";

export function RegisterForm() {
  return (
    <form className="w-full max-w-md space-y-4">
      <div className="space-y-1">
        <label htmlFor="firstName" className="text-sm font-medium">
          First Name
        </label>
        <input
          id="firstName"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="lastName" className="text-sm font-medium">
          Last Name
        </label>
        <input
          id="lastName"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      </div>

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
          autoComplete="new-password"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-md border border-zinc-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        Create account
      </button>
    </form>
  );
}
