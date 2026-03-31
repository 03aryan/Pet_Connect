import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PawIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  ChevronIcon,
  EyeIcon,
  EyeOffIcon,
} from "../icons";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });
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
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Must be at least 8 characters";
    if (!form.role) errs.role = "Please select a role";
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
      await signup(form);
      navigate("/", { replace: true });
    } catch (error) {
      setSubmitError(
        error.message ||
          "Unable to create account right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Password strength meter */
  const pwStrength = (() => {
    const p = form.password;
    if (!p) return { pct: 0, color: "bg-gray-200", label: "" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const map = [
      { pct: 25, color: "bg-red-400", label: "Weak" },
      { pct: 50, color: "bg-amber-400", label: "Fair" },
      { pct: 75, color: "bg-primary", label: "Good" },
      { pct: 100, color: "bg-green-500", label: "Strong" },
    ];
    return map[Math.min(score, 4) - 1] || map[0];
  })();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* ── Left: Form Panel ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-lg animate-fade-in-up">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <PawIcon className="w-8 h-8 text-primary group-hover:text-primary-dark transition-colors" />
            <span className="text-2xl font-bold text-primary-dark">
              Pet Connect
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Create Account
          </h1>
          <p className="text-gray-500 mb-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Log In
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="signup-first"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  First Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-beige-darker" />
                  <input
                    id="signup-first"
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={update("firstName")}
                    placeholder="Jane"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.firstName ? "border-red-400" : "border-beige-dark/50"}`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="signup-last"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Last Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-beige-darker" />
                  <input
                    id="signup-last"
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={update("lastName")}
                    placeholder="Doe"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.lastName ? "border-red-400" : "border-beige-dark/50"}`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-beige-darker" />
                <input
                  id="signup-email"
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
                htmlFor="signup-password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-beige-darker" />
                <input
                  id="signup-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Min 8 characters"
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

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pwStrength.color}`}
                      style={{ width: `${pwStrength.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12">
                    {pwStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Role dropdown */}
            <div>
              <label
                htmlFor="signup-role"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                I am a…
              </label>
              <div className="relative">
                <PawIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-beige-darker" />
                <select
                  id="signup-role"
                  value={form.role}
                  onChange={update("role")}
                  className={`w-full pl-11 pr-10 py-3 rounded-xl border text-sm bg-white outline-none appearance-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.role ? "border-red-400" : "border-beige-dark/50"} ${!form.role ? "text-gray-400" : "text-gray-800"}`}
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="owner">Pet Owner</option>
                  <option value="lover">Pet Lover</option>
                  <option value="vet">Vet Doctor</option>
                </select>
                <ChevronIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-beige-darker pointer-events-none" />
              </div>
              {errors.role && (
                <p className="text-xs text-red-500 mt-1.5">{errors.role}</p>
              )}
            </div>

            {submitError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {submitError}
              </p>
            )}

            {/* Terms */}
            <p className="text-xs text-gray-400 leading-relaxed">
              By creating an account you agree to our{" "}
              <span className="text-primary-dark font-medium cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-primary-dark font-medium cursor-pointer">
                Privacy Policy
              </span>
              .
            </p>

            <button
              type="submit"
              id="signup-submit-btn"
              disabled={isSubmitting}
              className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:from-primary-dark hover:to-primary-deeper transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Right: Illustration Panel ─────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-secondary/80 via-primary/70 to-primary-dark/90 items-center justify-center auth-pattern">
        {/* Floating decorative shapes */}
        <div className="absolute top-20 right-16 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-24 left-12 w-44 h-44 rounded-full bg-white/8 blur-2xl" />

        <div className="relative z-10 max-w-sm text-center px-8">
          {/* Decorative paw cluster */}
          <div className="relative mx-auto w-48 h-48 mb-8">
            <PawIcon className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 text-white/20 rotate-[10deg]" />
            <PawIcon className="absolute top-14 left-4 w-10 h-10 text-white/15 rotate-[-25deg]" />
            <PawIcon className="absolute top-10 right-4 w-12 h-12 text-white/20 rotate-[30deg]" />
            <PawIcon className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 text-white/30" />
            <PawIcon className="absolute bottom-2 right-8 w-8 h-8 text-white/10 rotate-[-40deg]" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">Join Our Pack!</h2>
          <p className="text-white/75 text-base leading-relaxed">
            Create your account and become part of the most caring pet
            community. Adopt, rent, heal, and feed — together.
          </p>

          <div className="mt-10 flex items-center justify-center gap-6">
            {[
              { icon: <PawIcon className="w-5 h-5" />, text: "Free Forever" },
              {
                icon: <PawIcon className="w-5 h-5" />,
                text: "Verified Listings",
              },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-white/80 text-sm"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
