import { useState } from "react";
import { PageHeader } from "../components/ui";
import { CAFE } from "../data/site";
import { useToast } from "../hooks/useAppContext";
import { btn, container, field } from "../lib/styles";

const topics = ["A question about an order", "Becoming a community partner", "Catering or bulk orders", "Something else"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", topic: topics[0], message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Please tell us your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.message.trim()) errs.message = "Please write a message";
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSent(true);
      showToast("Message sent");
      setForm({ name: "", email: "", topic: topics[0], message: "" });
    }
  };

  const describe = (id) => (errors[id] ? { "aria-invalid": true, "aria-describedby": `ct-${id}-error` } : {});

  return (
    <div className={`${container} py-10`}>
      <PageHeader eyebrow="Contact" title="Say hello.">
        Questions about an order, catering, or running a kitchen that could use our surplus — we read everything.
      </PageHeader>

      <div className="grid md:grid-cols-[1fr_1.2fr] gap-12">
        <dl className="space-y-5 text-sm">
          <div>
            <dt className="font-medium text-charcoal">Address</dt>
            <dd className="text-charcoal-soft mt-0.5">{CAFE.address}</dd>
            <dd className="text-charcoal-soft mt-0.5">Partners collect from the side entrance on 5th Cross.</dd>
          </div>
          <div>
            <dt className="font-medium text-charcoal">Opening hours</dt>
            {CAFE.hours.map((h) => (
              <dd key={h.days} className="text-charcoal-soft mt-0.5">
                {h.days}: {h.time}
              </dd>
            ))}
          </div>
          <div>
            <dt className="font-medium text-charcoal">Phone</dt>
            <dd className="text-charcoal-soft mt-0.5">{CAFE.phone}</dd>
          </div>
          <div>
            <dt className="font-medium text-charcoal">Email</dt>
            <dd className="text-charcoal-soft mt-0.5">{CAFE.email}</dd>
          </div>
        </dl>

        <form onSubmit={handleSubmit} noValidate className="bg-paper border border-line rounded-xl p-5 sm:p-6 space-y-4">
          {sent && (
            <p className="bg-leaf-soft/70 rounded-lg px-3 py-2 text-sm text-leaf" role="status">
              Thanks — we usually reply within a day.
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ct-name" className={field.label}>Name</label>
              <input id="ct-name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field.input} {...describe("name")} />
              {errors.name && <p id="ct-name-error" className={field.error}>{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="ct-email" className={field.label}>Email</label>
              <input id="ct-email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field.input} {...describe("email")} />
              {errors.email && <p id="ct-email-error" className={field.error}>{errors.email}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="ct-topic" className={field.label}>What's it about?</label>
            <select id="ct-topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={field.input}>
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ct-message" className={field.label}>Message</label>
            <textarea id="ct-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${field.input} resize-none`} {...describe("message")} />
            {errors.message && <p id="ct-message-error" className={field.error}>{errors.message}</p>}
          </div>
          <button type="submit" className={`${btn.primary} w-full py-3`}>
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
