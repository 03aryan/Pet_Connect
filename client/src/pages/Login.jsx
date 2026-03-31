import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "../icons";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (submitError) setSubmitError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (error) {
      setSubmitError(
        error.message || "Unable to log in right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* ── Left: Illustration Panel ──────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/90 via-secondary/80 to-primary-dark/90 items-center justify-center auth-pattern">
        {/* Floating decorative shapes */}
        <div className="absolute top-16 left-12 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-20 right-16 w-40 h-40 rounded-full bg-white/8 blur-2xl" />
        <div className="absolute top-1/3 right-12 w-24 h-24 rounded-full bg-beige-light/10 blur-xl" />

        <div className="relative z-10 max-w-md text-center px-8">
          {/* Decorative paw cluster */}
          <div className="relative mx-auto w-48 h-48 mb-8">
            <PawIcon className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 text-white/25 rotate-[-15deg]" />
            <PawIcon className="absolute top-10 left-6 w-10 h-10 text-white/15 rotate-[20deg]" />
            <PawIcon className="absolute top-12 right-6 w-12 h-12 text-white/20 rotate-[-30deg]" />
            <PawIcon className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 text-white/30" />
            <PawIcon className="absolute bottom-0 left-10 w-8 h-8 text-white/10 rotate-[45deg]" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">Welcome Back!</h2>
          <p className="text-white/75 text-base leading-relaxed">
            Your furry friends are waiting. Log in to reconnect with the Pet
            Connect community.
          </p>

          {/* Floating stats */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { count: "10k+", label: "Pets Adopted" },
              { count: "5k+", label: "Happy Owners" },
              { count: "200+", label: "Verified Vets" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl py-3 px-2"
              >
                <p className="text-xl font-bold text-white">{s.count}</p>
                <p className="text-[11px] text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 mb-10 group">
            <PawIcon className="w-8 h-8 text-primary group-hover:text-primary-dark transition-colors" />
            <span className="text-2xl font-bold text-primary-dark">
              Pet Connect
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Log In</h1>
          <p className="text-gray-500 mb-8">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Sign Up
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-beige-darker" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.email ? "border-red-400" : "border-beige-dark/50"}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-beige-darker" />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-11 py-3 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.password ? "border-red-400" : "border-beige-dark/50"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-beige-darker hover:text-primary-dark transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <EyeOffIcon className="w-[18px] h-[18px]" />
                  ) : (
                    <EyeIcon className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-beige-dark/50 text-primary accent-primary"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {submitError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:from-primary-dark hover:to-primary-deeper transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Logging In..." : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-beige-dark/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-4 text-xs text-gray-400 uppercase tracking-wider">
                or continue with
              </span>
            </div>
          </div>

          {/* Social placeholders */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-beige-dark/40 bg-white text-sm font-medium text-gray-700 hover:bg-beige-light/40 hover:border-primary/30 transition-all duration-200">
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-beige-dark/40 bg-white text-sm font-medium text-gray-700 hover:bg-beige-light/40 hover:border-primary/30 transition-all duration-200">
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
