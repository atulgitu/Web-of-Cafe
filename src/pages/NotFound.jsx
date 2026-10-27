import { Link } from "react-router-dom";
import { btn, container } from "../lib/styles";

export default function NotFound() {
  return (
    <div className={`${container} py-24 text-center`}>
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-caramel-dark">404</p>
      <h1 className="font-serif-display text-3xl text-espresso mt-2">We couldn't find that page.</h1>
      <p className="text-charcoal-soft mt-2">It may have moved, or the link might be mistyped.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className={btn.primary}>
          Go home
        </Link>
        <Link to="/menu" className={btn.secondary}>
          See the menu
        </Link>
      </div>
    </div>
  );
}
