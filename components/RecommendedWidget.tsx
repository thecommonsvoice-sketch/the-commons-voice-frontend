import Link from "next/link";

interface RecommendedItem {
  title: string;
  link: string;
  image?: string;
}

interface RecommendedWidgetProps {
  items: RecommendedItem[];
}

function optimizeImageUrl(url: string | undefined | null, width = 300): string {
  if (!url) return "/placeholder.jpg";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

export function RecommendedWidget({ items }: RecommendedWidgetProps) {
  if (!items.length) return null;

  return (
    <div className="bg-card border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-2 h-5 bg-primary rounded-full inline-block" />
          Recommended Reads
        </h2>
        <span className="text-xs font-bold uppercase text-primary tracking-wider">Top Stories</span>
      </div>
      <div className="flex flex-col gap-4 divide-y divide-border/40">
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={item.link}
            className={`group flex gap-3 items-start ${idx > 0 ? "pt-3" : ""}`}
          >
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center font-mono mt-0.5">
              0{idx + 1}
            </div>
            {item.image && (
              <div className="relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border border-border/60">
                <img
                  src={optimizeImageUrl(item.image)}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="text-sm font-bold font-serif leading-snug line-clamp-2 text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
