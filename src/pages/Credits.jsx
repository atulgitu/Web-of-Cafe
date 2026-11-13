import { PageHeader } from "../components/ui";
import { COMBO_IMAGES, IMAGE_CREDITS } from "../data/imageCredits";
import { container } from "../lib/styles";

// Photo credits. Most menu photos are under Creative Commons licences that ask for the
// author to be credited, so they're all listed here with a link to the original.
export default function Credits() {
  return (
    <div className={`${container} py-10 max-w-4xl`}>
      <PageHeader eyebrow="Credits" title="Photo credits">
        The menu photos are freely licensed photographs from Wikimedia Commons, by the people listed below. Combo photos show
        the photos of the items in the combo side by side.
      </PageHeader>

      <ul className="text-sm text-charcoal-soft space-y-1 mb-8">
        {COMBO_IMAGES.map((c) => (
          <li key={c.product}>
            <span className="text-charcoal">{c.product}</span>: {c.parts.join(" + ")}
          </li>
        ))}
      </ul>

      <ul className="divide-y divide-line border-y border-line text-sm">
        {IMAGE_CREDITS.map((c) => (
          <li key={c.file} className="py-3 grid gap-1 sm:grid-cols-[12rem_1fr]">
            <span className="font-medium text-espresso">{c.product}</span>
            <span className="text-charcoal-soft break-words">
              {c.author} ·{" "}
              <a href={c.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-espresso">
                {c.licence}
              </a>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
