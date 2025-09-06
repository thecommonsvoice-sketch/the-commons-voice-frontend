import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recommended</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, idx) => (
          <Link key={idx} href={item.link} className="flex gap-3 hover:underline">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <p className="text-sm">{item.title}</p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
