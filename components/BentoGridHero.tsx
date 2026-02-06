import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "@/lib/types";

interface BentoGridHeroProps {
    articles: Article[];
}

export function BentoGridHero({ articles }: BentoGridHeroProps) {
    if (!articles || articles.length === 0) return null;

    // Ensure we have at least 1 article
    const mainArticle = articles[0];
    const sideArticles = articles.slice(1, 3); // Get next 2 articles

    return (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* Main Feature - Takes 2/3 width on large screens */}
            <div className="lg:col-span-2 relative group overflow-hidden rounded-2xl shadow-xl min-h-[400px] lg:min-h-[500px]">
                <Link href={`/articles/${mainArticle.slug}`} className="block w-full h-full">
                    <div className="absolute inset-0">
                        <img
                            src={mainArticle.coverImage || "/placeholder.jpg"}
                            alt={mainArticle.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full max-w-3xl">
                        {mainArticle.category && (
                            <Badge className="mb-3 bg-primary hover:bg-primary/90 text-white border-none">
                                {mainArticle.category.name}
                            </Badge>
                        )}
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-sm">
                            {mainArticle.title}
                        </h2>
                        {mainArticle.excerpt && (
                            <p className="text-gray-200 text-lg line-clamp-2 md:line-clamp-3 mb-4 max-w-2xl font-medium">
                                {mainArticle.excerpt}
                            </p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                            {mainArticle.author?.name && (
                                <span className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs text-white uppercase font-bold">
                                        {mainArticle.author.name.charAt(0)}
                                    </div>
                                    {mainArticle.author.name}
                                </span>
                            )}

                            {mainArticle.createdAt && (
                                <>
                                    <span>•</span>
                                    <time>
                                        {formatDistanceToNow(new Date(mainArticle.createdAt), { addSuffix: true })}
                                    </time>
                                </>
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Side Column - Stack of 2 smaller articles */}
            <div className="flex flex-col gap-6 lg:h-[500px]">
                {sideArticles.map((article, idx) => (
                    <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="group relative flex-1 overflow-hidden rounded-2xl shadow-lg min-h-[200px]"
                    >
                        <div className="absolute inset-0">
                            <img
                                src={article.coverImage || "/placeholder.jpg"}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 p-5 w-full">
                            {article.category && (
                                <Badge variant="secondary" className="mb-2 bg-white/20 text-white backdrop-blur-sm border-none hover:bg-white/30">
                                    {article.category.name}
                                </Badge>
                            )}
                            <h3 className="text-xl font-bold text-white mb-2 leading-snug drop-shadow-sm line-clamp-2 group-hover:text-primary-foreground transition-colors">
                                {article.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                {article.createdAt && (
                                    <time>
                                        {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                                    </time>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}

                {/* Fill empty space if less than 2 side articles */}
                {sideArticles.length < 2 && (
                    <div className="flex-1 rounded-2xl bg-muted/30 border-2 border-dashed border-muted flex items-center justify-center p-6 text-center text-muted-foreground">
                        <div className="space-y-2">
                            <p className="font-medium">More news coming soon</p>
                            <Link href="/articles">
                                <Button variant="outline" size="sm">Browse Archive</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
