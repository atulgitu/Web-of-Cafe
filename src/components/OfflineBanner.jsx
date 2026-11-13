import useOnline from "../hooks/useOnline";

export default function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="bg-espresso text-cream text-sm text-center px-4 py-2">
      You're offline. You can browse what's already loaded — reconnect to order, reserve or confirm pickups.
    </div>
  );
}
