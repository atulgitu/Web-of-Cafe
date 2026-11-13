import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FoodImage from "../components/FoodImage";
import Logo from "../components/Logo";
import { Spinner } from "../components/ui";
import { useAuth, useToast } from "../hooks/useAppContext";
import { homeForRole } from "../lib/accountLinks";
import { btn, field, focusFirstInvalid } from "../lib/styles";

const EMAIL = /^\S+@\S+\.\S+$/;
const empty = { name: "", email: "", password: "", confirm: "" };

// Sign in, or create a customer account. There is no role picker: the account's
// role (customer, café staff, community partner) is stored on the server, and
// public sign-up always creates a customer.
export default function Login() {
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "register" ? "register" : "login";
  const [form, setForm] = useState(empty);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from;
  const registering = mode === "register";

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const switchMode = () => {
    setParams(registering ? {} : { mode: "register" }, { replace: true });
    setErrors({});
    setForm({ ...empty, email: form.email });
  };

  const validate = () => {
    const errs = {};
    if (registering && !form.name.trim()) errs.name = "Please enter your name.";
    if (!form.email.trim()) errs.email = "Please enter your email address.";
    else if (!EMAIL.test(form.email.trim())) errs.email = "That doesn't look like an email address. Check for a missing @ or dot.";
    if (!form.password) errs.password = "Please enter your password.";
    else if (registering && form.password.length < 8) errs.password = "Use at least 8 characters.";
    if (registering && !errs.password && form.confirm !== form.password) errs.confirm = "The passwords don't match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return focusFirstInvalid(e.currentTarget);
    setLoading(true);
    try {
      const user = registering
        ? await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
        : await login(form.email.trim(), form.password);
      showToast(registering ? `Welcome to Coffee Cinnamon, ${user.name.split(" ")[0]}` : `Welcome back, ${user.name.split(" ")[0]}`);
      // Back to where they were heading, otherwise to the right page for their role.
      navigate(from || homeForRole(user.role), { replace: true });
    } catch (err) {
      setErrors({ ...(err.fields || {}), form: err.message });
      setLoading(false);
    }
  };

  const described = (key) => (errors[key] ? { "aria-invalid": true, "aria-describedby": `${key}-error` } : {});
  const error = (key) =>
    errors[key] && (
      <p id={`${key}-error`} className={field.error}>
        {errors[key]}
      </p>
    );

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Photo and welcome: wide screens only. Phones get the logo and the form. */}
      <div className="relative hidden lg:block">
        <FoodImage
          src="/images/pour-over.webp"
          alt=""
          eager
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* 70% so the text stays readable over any part of the photo */}
        <div className="absolute inset-0 bg-espresso/70" />
        <div className="relative h-full flex flex-col justify-between p-12 xl:p-16 text-cream">
          <Link to="/" className="w-fit py-1" aria-label="Coffee Cinnamon home">
            <Logo variant="light" size={32} />
          </Link>
          <div className="max-w-sm">
            <p className="font-serif-display text-4xl leading-tight">Good food shouldn't go to waste.</p>
            <p className="mt-3 text-cream/90 leading-relaxed">142, 5th Cross, Indiranagar. Open every day.</p>
          </div>
        </div>
      </div>

      <main className="flex flex-col px-5 py-8 sm:px-10 lg:justify-center lg:py-12">
        <Link to="/" className="w-fit py-1 lg:hidden" aria-label="Coffee Cinnamon home">
          <Logo size={28} />
        </Link>

        <div className="w-full max-w-sm mx-auto mt-10 lg:mt-0">
          <h1 className="font-serif-display text-3xl text-espresso">{registering ? "Create your account" : "Welcome back."}</h1>
          <p className="mt-2 text-sm text-charcoal-soft leading-relaxed">
            {registering ? "Keep your orders in one place and order faster next time." : "Sign in to see your orders and continue with Coffee Cinnamon."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate aria-label={registering ? "Create account" : "Sign in"}>
            {registering && (
              <div>
                <label htmlFor="name" className={field.label}>
                  Your name
                </label>
                <input id="name" value={form.name} onChange={set("name")} autoComplete="name" maxLength={80} className={field.input} {...described("name")} />
                {error("name")}
              </div>
            )}
            <div>
              <label htmlFor="email" className={field.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete={registering ? "email" : "username"}
                autoCapitalize="none"
                spellCheck={false}
                value={form.email}
                onChange={set("email")}
                className={field.input}
                {...described("email")}
              />
              {error("email")}
            </div>
            <div>
              <label htmlFor="password" className={field.label}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  autoComplete={registering ? "new-password" : "current-password"}
                  className={`${field.input} pr-20`}
                  {...described("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  aria-controls="password"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-9 px-3 rounded-md text-sm font-medium text-charcoal-soft hover:text-espresso hover:bg-cream-dim"
                >
                  {showPassword ? "Hide" : "Show"}
                  <span className="sr-only"> password</span>
                </button>
              </div>
              {registering && !errors.password && <p className="text-xs text-charcoal-soft mt-1">At least 8 characters.</p>}
              {error("password")}
              {/* After the field in the page order, so Tab goes email → password → show → this */}
              {!registering && (
                <p className="mt-1 text-right">
                  <Link to="/forgot-password" state={{ email: form.email }} className="inline-block py-1 text-sm text-caramel-dark underline-offset-4 hover:underline">
                    Forgot password?
                  </Link>
                </p>
              )}
            </div>
            {registering && (
              <div>
                <label htmlFor="confirm" className={field.label}>
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  autoComplete="new-password"
                  className={field.input}
                  {...described("confirm")}
                />
                {error("confirm")}
              </div>
            )}

            {errors.form && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50/60 px-3 py-2 text-sm text-red-800">
                {errors.form}
              </p>
            )}

            <button type="submit" disabled={loading} className={`${btn.primary} w-full py-3`}>
              {loading && <Spinner />}
              {loading ? (registering ? "Creating your account…" : "Signing in…") : registering ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-charcoal-soft">
            {registering ? "Already have an account? " : "New to Coffee Cinnamon? "}
            <button type="button" onClick={switchMode} className="font-medium text-caramel-dark underline-offset-4 hover:underline py-1">
              {registering ? "Sign in" : "Create an account"}
            </button>
          </p>
          <p className="mt-2 text-sm text-charcoal-soft">You don't need an account to order.</p>

          <p className="mt-10 lg:mt-12">
            <Link to="/" className="text-sm text-charcoal-soft hover:text-espresso py-1">
              ← Back to the café
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
