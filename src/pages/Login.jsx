import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Logo from "../components/Logo";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const { login, loginAsGuest, signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (mode === "signup" && !name.trim()) errs.name = "Please enter your name";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        showToast("Welcome back!");
      } else {
        await signup(name, email, password);
        showToast("Account created — welcome to Brew & Bean!");
      }
      navigate("/");
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setGuestLoading(true);
    setTimeout(() => {
      loginAsGuest();
      showToast("Browsing as guest");
      navigate("/");
    }, 350);
  };

  const handleGoogle = () => {
    showToast("Google login is a demo placeholder for this project");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[58%_42%] bg-cream">
      {/* LEFT — Café visual */}
      <div className="relative h-56 sm:h-72 lg:h-auto overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=80"
          alt="Warm café interior with freshly brewed coffee"
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/25 to-espresso/10" />
        <div className="absolute inset-0 bg-espresso/10" />

        <div className="relative h-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-cream">
          <Link to="/" className="hidden lg:flex items-center gap-2.5 w-fit">
            <Logo variant="light" size={34} />
          </Link>

          <div className="animate-fade-in max-w-md" style={{ animationDelay: "80ms" }}>
            <p className="font-serif-display text-2xl sm:text-4xl leading-[1.2] tracking-tight">
              Made fresh.
              <br />
              Served with warmth.
            </p>
            <p className="mt-3 text-cream/80 text-sm sm:text-base tracking-wide">
              Good coffee. Better moments.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — Login form */}
      <div className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
        <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <div className="lg:hidden flex justify-center mb-7">
            <Logo variant="dark" size={30} />
          </div>
          <div className="hidden lg:block mb-8">
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-caramel-dark">
              Brew & Bean
            </span>
          </div>

          <h1 className="font-serif-display text-[28px] sm:text-3xl text-espresso leading-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-charcoal-soft leading-relaxed">
            {mode === "login"
              ? "Your next great coffee is just a login away."
              : "Join us for faster checkout and member offers."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1.5">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.75 rounded-lg border border-line bg-white text-sm transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-caramel focus:border-caramel"
                  autoComplete="name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-soft/70">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.75 rounded-lg border border-line bg-white text-sm transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-caramel focus:border-caramel"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-charcoal">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => showToast("Password reset link sent (demo)")}
                    className="text-xs text-caramel-dark hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-soft/70">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.75 rounded-lg border border-line bg-white text-sm transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-caramel focus:border-caramel"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  aria-invalid={!!errors.password}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-soft hover:text-espresso transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {mode === "login" && (
              <label className="flex items-center gap-2 text-sm text-charcoal-soft cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-caramel-dark"
                />
                Remember me
              </label>
            )}

            {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-cream font-medium py-3.25 rounded-lg hover:bg-espresso-light active:scale-[0.99] transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Spinner />}
              {loading ? "Signing you in…" : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px bg-line flex-1" />
            <span className="text-xs text-charcoal-soft">or continue with</span>
            <div className="h-px bg-line flex-1" />
          </div>

          <button
            onClick={handleGoogle}
            className="mt-4 w-full flex items-center justify-center gap-2.5 border border-line rounded-lg py-2.75 text-sm font-medium text-charcoal hover:bg-cream-dim hover:border-charcoal-soft/30 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-charcoal-soft">
            {mode === "login" ? (
              <>
                New to Brew & Bean?{" "}
                <button onClick={() => setMode("signup")} className="text-caramel-dark font-medium hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-caramel-dark font-medium hover:underline">
                  Log in
                </button>
              </>
            )}
          </p>

          <div className="mt-5 pt-5 border-t border-line/70 text-center">
            <button
              onClick={handleGuest}
              disabled={guestLoading}
              className="text-sm font-medium text-charcoal-soft hover:text-espresso transition-colors inline-flex items-center gap-2"
            >
              {guestLoading && <Spinner />}
              Continue as Guest →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" strokeLinecap="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M9.9 5.1A10.9 10.9 0 0112 5c7 0 10.5 7 10.5 7a13.2 13.2 0 01-3.1 3.9M6.6 6.6C3.8 8.4 1.5 12 1.5 12a13.3 13.3 0 004.1 4.6" strokeLinecap="round" />
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.9 2 2.7 6.1 2.7 11.2S6.9 20.4 12 20.4c6.9 0 9.3-4.9 9.3-7.4 0-.5-.1-.9-.1-1.2H12z" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
