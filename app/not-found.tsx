import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

      export const viewport = {
          width: "device-width",
          initialScale: 1,
          maximumScale: 1,
        };

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            <FileQuestion className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            The page you&rsquo;re looking for doesn&rsquo;t exist. It may have been moved, deleted, or you entered the wrong URL.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/articles">
                <Search className="h-4 w-4 mr-2" />
                Browse Articles
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
