import { formatTime } from "../../lib/format";

export default function ActivityFeed({ events, limit }) {
  const shown = limit ? events.slice(0, limit) : events;
  return (
    <ol className="relative">
      {shown.map((e, i) => (
        <li key={e.id} className="grid grid-cols-[4.5rem_1fr] gap-3 pb-4 last:pb-0">
          <time className="text-xs font-medium text-charcoal-soft pt-0.5 nums">{formatTime(e.at)}</time>
          <p className={`text-sm leading-snug border-l pl-4 ${i === 0 ? "border-leaf text-charcoal" : "border-line text-charcoal-soft"}`}>
            {e.text}
          </p>
        </li>
      ))}
    </ol>
  );
}
