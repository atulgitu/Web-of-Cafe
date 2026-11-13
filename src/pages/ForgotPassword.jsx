import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CAFE } from "../data/site";
import { btn, container, field } from "../lib/styles";
import { whatsappUrl } from "../lib/whatsapp";

// The site doesn't send emails yet, so a reset can't be emailed automatically.
// Instead this page says so plainly and prepares a message to the café, who can
// set a new password for the account. (An emailed reset link needs an email
// service; it's listed as a limitation in the README.)
export default function ForgotPassword() {
  const [email, setEmail] = useState(useLocation().state?.email || "");
  const message = `Hello Coffee Cinnamon, I've forgotten the password for my account${email.trim() ? ` (${email.trim()})` : ""}. Could you help me reset it?`;

  return (
    <div className={`${container} py-12 sm:py-16 max-w-lg`}>
      <h1 className="font-serif-display text-3xl text-espresso">Forgotten your password?</h1>
      <p className="mt-3 text-charcoal leading-relaxed">
        We can't email you a reset link yet. Send us a message from the phone or email you use with us and we'll set up a new
        password for you, usually the same day.
      </p>

      <div className="mt-6">
        <label htmlFor="fp-email" className={field.label}>
          The email you sign in with
        </label>
        <input id="fp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field.input} />
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className={`${btn.primary} py-3`}>
          Ask on WhatsApp
        </a>
        <a href={`mailto:${CAFE.email}?subject=${encodeURIComponent("Password reset")}&body=${encodeURIComponent(message)}`} className={`${btn.secondary} py-3`}>
          Ask by email
        </a>
      </div>
      <p className="mt-3 text-xs text-charcoal-soft">
        We'll never ask you to send us your old password.
      </p>

      <p className="mt-10">
        <Link to="/login" className="text-sm text-charcoal-soft hover:text-espresso py-1">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
