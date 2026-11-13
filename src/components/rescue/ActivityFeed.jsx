import { formatTime } from "../../lib/format";

export default function ActivityFeed({ events, empty = "Nothing has happened yet today." }) {
  if (!events?.length) return <p className="text-sm text-charcoal-soft">{empty}</p>;
  return (
    <ol>
      {events.map((e, i) => (
        <li key={e.id} className="grid grid-cols-[4.75rem_1fr] gap-3 pb-4 last:pb-0">
          <time dateTime={e.at} className="text-xs font-medium text-charcoal-soft pt-0.5 nums">
            {formatTime(e.at)}
          </time>
          <p className={`text-sm leading-snug border-l pl-4 ${i === 0 ? "border-leaf text-charcoal" : "border-line text-charcoal-soft"}`}>{e.message}</p>
        </li>
      ))}
    </ol>
  );
}
