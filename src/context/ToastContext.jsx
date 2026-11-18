import { useCallback, useState } from "react";
import { ToastContext } from "./contexts";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-24 lg:bottom-5 inset-x-4 lg:inset-x-auto lg:right-5 z-[100] flex flex-col gap-2 items-center lg:items-end pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm border ${
              t.type === "error" ? "bg-paper text-red-800 border-red-200" : "bg-espresso text-cream border-espresso-light"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
