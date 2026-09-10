import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/90 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        <div className="col-span-2 lg:col-span-1">
          <Logo variant="light" size={28} />
          <p className="text-sm text-cream/65 leading-relaxed mt-3 max-w-[220px]">
            Good coffee. Better moments.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Brew & Bean on Instagram"
              className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center hover:bg-cream/10 hover:border-cream/40 transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Brew & Bean on Facebook"
              className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center hover:bg-cream/10 hover:border-cream/40 transition-colors"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream mb-3.5 tracking-wide uppercase">Quick Links</h3>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li><Link to="/" className="hover:text-cream transition-colors">Home</Link></li>
            <li><Link to="/menu" className="hover:text-cream transition-colors">Menu</Link></li>
            <li><Link to="/offers" className="hover:text-cream transition-colors">Offers</Link></li>
            <li><Link to="/about" className="hover:text-cream transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-cream transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream mb-3.5 tracking-wide uppercase">Customer Support</h3>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li><Link to="/contact" className="hover:text-cream transition-colors">FAQs</Link></li>
            <li><Link to="/contact" className="hover:text-cream transition-colors">Order Help</Link></li>
            <li><Link to="/contact" className="hover:text-cream transition-colors">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:text-cream transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-cream mb-3.5 tracking-wide uppercase">Contact</h3>
          <ul className="space-y-2.5 text-sm text-cream/70 leading-relaxed">
            <li>+91 80 4567 1234</li>
            <li>hello@brewandbean.in</li>
            <li>7:30 AM – 10:30 PM daily</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/50">
        © 2026 Brew & Bean. Crafted with care.
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 8.5h-2a1.5 1.5 0 00-1.5 1.5v2h3.4l-.4 3H11.5v7h-3v-7H6v-3h2.5v-2.3A4.2 4.2 0 0112.9 5H15v3.5z" />
    </svg>
  );
}
