import Link from "next/link";

interface RecommendedItem {
  title: string;
  link: string;
  image?: string;
}

interface RecommendedWidgetProps {
  items: RecommendedItem[];
}

export function RecommendedWidget({ items }: RecommendedWidgetProps) {
  if (!items.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-serif border-l-4 border-primary pl-3">Recommended</h3>
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={item.link}
            className="group flex gap-3 items-start"
          >
            {item.image && (
              <div className="relative shrink-0 w-20 h-16 rounded-md overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex flex-col">
              <h4 className="text-sm font-medium leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
