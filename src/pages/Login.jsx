import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DemoSwitcherInline } from "../components/DemoSwitcher";
import FoodImage from "../components/FoodImage";
import Logo from "../components/Logo";
import { Spinner } from "../components/ui";
import { useAuth, useToast } from "../hooks/useAppContext";
import { btn, field, focusFirstInvalid } from "../lib/styles";

export default function Login() {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from || "/";

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const errs = {};
    if (mode === "register" && !form.name.trim()) errs.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (mode === "register" && form.password.length < 8) errs.password = "Use at least 8 characters";
    if (mode === "login" && !form.password) errs.password = "Enter your password";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return focusFirstInvalid(e.currentTarget);
    setLoading(true);
    try {
      const user = mode === "login" ? await login(form.email, form.password) : await register(form);
      showToast(mode === "login" ? `Welcome back, ${user.name.split(" ")[0]}` : "Account created — welcome to Coffee Cinnamon");
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({ ...(err.fields || {}), form: err.message });
    } finally {
      setLoading(false);
    }
  };

  const described = (key) => (errors[key] ? { "aria-invalid": true, "aria-describedby": `${key}-error` } : {});

  return (
    <div className="min-h-screen grid lg:grid-cols-[55%_45%] bg-cream">
      <div className="relative h-48 sm:h-64 lg:h-auto overflow-hidden">
        <FoodImage
          src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=80"
          alt="Coffee being poured at a café counter"
          eager
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/20 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-cream">
          <Link to="/" className="w-fit" aria-label="Back to Coffee Cinnamon home">
            <Logo variant="light" size={30} />
          </Link>
          <p className="hidden sm:block font-serif-display text-3xl lg:text-4xl leading-tight max-w-md">Good food shouldn't go to waste.</p>
        </div>
      </div>

      <main className="flex items-center justify-center px-5 py-10 sm:px-12">
        <div className="w-full max-w-sm">
          <h1 className="font-serif-display text-3xl text-espresso">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-charcoal-soft leading-relaxed">
            {mode === "login" ? "Log in to order, see your history and your contributions." : "Save your orders and see what your contributions helped fund."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            {mode === "register" && (
              <div>
                <label htmlFor="name" className={field.label}>Full name</label>
                <input id="name" value={form.name} onChange={set("name")} autoComplete="name" className={field.input} {...described("name")} />
                {errors.name && <p id="name-error" className={field.error}>{errors.name}</p>}
              </div>
            )}
            <div>
              <label htmlFor="email" className={field.label}>Email</label>
              <input id="email" type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" className={field.input} {...described("email")} />
              {errors.email && <p id="email-error" className={field.error}>{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className={field.label}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className={`${field.input} pr-16`}
                  {...described("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-charcoal-soft hover:text-espresso px-2 min-h-8"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p id="password-error" className={field.error}>{errors.password}</p>}
            </div>

            {errors.form && (
              <p role="alert" className="text-sm text-red-700">
                {errors.form}
              </p>
            )}

            <button type="submit" disabled={loading} className={`${btn.primary} w-full py-3`}>
              {loading && <Spinner />}
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-charcoal-soft">
            {mode === "login" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrors({});
              }}
              className="text-caramel-dark font-medium underline-offset-4 hover:underline"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>

          <div className="mt-8">
            <DemoSwitcherInline />
          </div>

          <p className="mt-6 text-center">
            <Link to="/" className="text-sm text-charcoal-soft hover:text-espresso">
              ← Back to the café
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
