export default function ArticleLoading() {
    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
            <article className="space-y-4 sm:space-y-6 animate-pulse">
                {/* Category badge skeleton */}
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

                {/* Title skeleton */}
                <div className="space-y-3">
                    <div className="h-8 sm:h-10 md:h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-8 sm:h-10 md:h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>

                {/* Excerpt skeleton */}
                <div className="space-y-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>

                {/* Author and date skeleton */}
                <div className="flex items-center gap-3">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>

                {/* Featured image skeleton */}
                <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700"></div>

                {/* Content skeleton */}
                <div className="space-y-3 pt-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-11/12"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>

                    <div className="pt-4"></div>

                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                </div>

                {/* Related articles skeleton */}
                <div className="mt-12 space-y-4">
                    <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-2 p-4 border rounded-lg">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    );
}
