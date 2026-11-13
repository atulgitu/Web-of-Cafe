import { Component } from "react";

// If one page crashes, show a calm message instead of a blank screen.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Page crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif-display text-3xl text-espresso">Something went wrong on this page.</h1>
        <p className="text-charcoal-soft mt-3">Your cart is saved. Try reloading, or head back to the home page.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-espresso text-cream px-5 py-2.5 text-sm font-medium">
            Reload
          </button>
          <a href="/" className="rounded-full border border-espresso/20 px-5 py-2.5 text-sm font-medium text-espresso">
            Home
          </a>
        </div>
      </div>
    );
  }
}
