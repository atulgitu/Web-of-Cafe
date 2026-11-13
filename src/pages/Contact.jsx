import { useState } from "react";
import { PageHeader, Spinner } from "../components/ui";
import { CAFE } from "../data/site";
import useOnline from "../hooks/useOnline";
import { api } from "../lib/api";
import { whatsappUrl } from "../lib/whatsapp";
import { btn, container, field, focusFirstInvalid } from "../lib/styles";

const topics = ["A question about an order", "Becoming a community partner", "Catering or bulk orders", "Something else"];
const emptyForm = { name: "", email: "", topic: topics[0], message: "" };
const MAX_MESSAGE = 2000;

// The same rules the server applies (server/src/routes/schemas.js), checked here
// first so people get an answer without waiting for a round trip.
function validate(form) {
  const errs = {};
  if (!form.name.trim()) errs.name = "Please tell us your name.";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Enter an email address like name@example.com.";
  if (form.message.trim().length < 10) errs.message = "Please write at least 10 characters.";
  return errs;
}

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | failed
  const [failure, setFailure] = useState("");
  const online = useOnline();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return; // ignore double clicks
    const formElement = e.currentTarget;
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstInvalid(formElement);
      return;
    }
    setStatus("sending");
    try {
      await api("/contact", { method: "POST", body: { ...form, name: form.name.trim(), email: form.email.trim(), message: form.message.trim() } });
      setStatus("sent");
      setForm(emptyForm);
    } catch (err) {
      // What the visitor typed stays in the form, so they can simply try again.
      setStatus("failed");
      setFailure(err.message);
      if (err.fields) {
        setErrors(err.fields);
        focusFirstInvalid(formElement);
      }
    }
  };

  const describe = (id) => (errors[id] ? { "aria-invalid": true, "aria-describedby": `ct-${id}-error` } : {});

  return (
    <div className={`${container} py-10`}>
      <PageHeader eyebrow="Contact" title="Get in touch">
        For an order, WhatsApp is quickest. For catering, or collecting our surplus food for your kitchen, use the form or email.
      </PageHeader>

      <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-12">
        <dl className="space-y-5 text-sm">
          <div>
            <dt className="font-medium text-charcoal">Address</dt>
            <dd className="text-charcoal-soft mt-0.5">{CAFE.address}</dd>
            <dd className="text-charcoal-soft mt-0.5">Community partners collect from the side entrance on 5th Cross.</dd>
          </div>
          <div>
            <dt className="font-medium text-charcoal">Opening hours</dt>
            {CAFE.hoursText.map((h) => (
              <dd key={h.days} className="text-charcoal-soft mt-0.5">
                {h.days}: {h.time}
              </dd>
            ))}
          </div>
          <div>
            <dt className="font-medium text-charcoal">WhatsApp</dt>
            <dd>
              <a href={whatsappUrl("Hello Coffee Cinnamon, ")} target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-caramel-dark underline underline-offset-2">
                Message us on WhatsApp
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-charcoal">Phone</dt>
            <dd>
              <a href={`tel:${CAFE.phone.replace(/\s/g, "")}`} className="inline-block py-1 text-caramel-dark underline underline-offset-2">
                {CAFE.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-charcoal">Email</dt>
            <dd>
              <a href={`mailto:${CAFE.email}`} className="inline-block py-1 text-caramel-dark underline underline-offset-2 break-all">
                {CAFE.email}
              </a>
            </dd>
          </div>
        </dl>

        {status === "sent" ? (
          <div role="status" className="bg-leaf-soft/70 border border-leaf/20 rounded-xl p-6 self-start">
            <h2 className="font-serif-display text-xl text-leaf">Message received. Thank you.</h2>
            <p className="text-sm text-charcoal mt-2 leading-relaxed">
              It has been saved for the café team, who reply by email. For anything about a current order, WhatsApp us instead.
            </p>
            <button type="button" onClick={() => setStatus("idle")} className={`${btn.secondary} mt-4`}>
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate aria-label="Send us a message" className="bg-paper border border-line rounded-xl p-5 sm:p-6 space-y-4">
            <p className="text-xs text-charcoal-soft">All fields are required.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ct-name" className={field.label}>
                  Name
                </label>
                <input id="ct-name" autoComplete="name" required maxLength={80} value={form.name} onChange={set("name")} className={field.input} {...describe("name")} />
                {errors.name && (
                  <p id="ct-name-error" className={field.error}>
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="ct-email" className={field.label}>
                  Email
                </label>
                <input id="ct-email" type="email" autoComplete="email" required maxLength={120} value={form.email} onChange={set("email")} className={field.input} {...describe("email")} />
                {errors.email && (
                  <p id="ct-email-error" className={field.error}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="ct-topic" className={field.label}>
                What's it about?
              </label>
              <select id="ct-topic" value={form.topic} onChange={set("topic")} className={field.input}>
                {topics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ct-message" className={field.label}>
                Message
              </label>
              <textarea id="ct-message" rows={5} required maxLength={MAX_MESSAGE} value={form.message} onChange={set("message")} className={`${field.input} resize-y`} {...describe("message")} />
              {errors.message && (
                <p id="ct-message-error" className={field.error}>
                  {errors.message}
                </p>
              )}
            </div>

            {status === "failed" && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-sm text-red-800">
                Your message wasn't sent. {failure} Nothing you typed has been lost.
              </p>
            )}
            {!online && <p className="text-sm text-caramel-dark">You're offline. Reconnect to send your message.</p>}

            <button type="submit" disabled={status === "sending" || !online} className={`${btn.primary} w-full py-3`}>
              {status === "sending" && <Spinner />}
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
