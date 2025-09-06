"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/ArticleCard";
import type { Article } from "@/lib/types";

interface HeroCarouselProps {
  articles: Article[];
}

export function HeroCarousel({ articles }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredArticles = articles.slice(0, 5);

  useEffect(() => {
    if (featuredArticles.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredArticles.length]);

  if (featuredArticles.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
  };

  return (
    <section className="relative mb-8">
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {featuredArticles.map((article, index) => (
            <div key={article.id} className="w-full flex-shrink-0">
              <ArticleCard article={article} variant="featured" show={false} />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={goToPrevious}
          aria-label="Previous article"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={goToNext}
          aria-label="Next article"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {featuredArticles.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}