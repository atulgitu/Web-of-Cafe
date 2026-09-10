import { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.message.trim()) errs.message = "Please write a message";
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSent(true);
      showToast("Message sent — we'll get back to you soon");
      setForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif-display text-3xl text-espresso">Get in Touch</h1>
        <p className="text-charcoal-soft text-sm mt-1">Questions, feedback, or catering enquiries — we'd love to hear from you.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <dl className="space-y-4 text-sm mb-8">
            <div>
              <dt className="font-medium text-charcoal">Address</dt>
              <dd className="text-charcoal-soft mt-0.5">142, 5th Cross, Indiranagar, Bengaluru, Karnataka 560038</dd>
            </div>
            <div>
              <dt className="font-medium text-charcoal">Opening Hours</dt>
              <dd className="text-charcoal-soft mt-0.5">Mon – Fri: 7:30 AM – 10:30 PM<br />Sat – Sun: 8:00 AM – 11:00 PM</dd>
            </div>
            <div>
              <dt className="font-medium text-charcoal">Phone</dt>
              <dd className="text-charcoal-soft mt-0.5">+91 80 4567 1234</dd>
            </div>
            <div>
              <dt className="font-medium text-charcoal">Email</dt>
              <dd className="text-charcoal-soft mt-0.5">hello@brewandbean.in</dd>
            </div>
          </dl>
          <div className="rounded-2xl overflow-hidden border border-line h-48 bg-cream-dim flex items-center justify-center text-charcoal-soft text-sm">
            Map placeholder — 142, 5th Cross, Indiranagar
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-xl p-6 space-y-4 h-fit">
          {sent && (
            <div className="bg-sage/10 border border-sage/25 rounded-lg px-3 py-2 text-sm text-sage-dark">
              Thanks for reaching out — we typically reply within a day.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel resize-none"
            />
            {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
          </div>
          <button type="submit" className="w-full bg-espresso text-cream font-medium py-3 rounded-full hover:bg-espresso-light transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
