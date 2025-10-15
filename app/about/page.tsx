import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about The Commons Voice - our mission, values, and commitment to independent journalism.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">About The Commons Voice</h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
          Independent journalism for the modern world. We believe in the power of truth, transparency, and thoughtful reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <Target className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
            <h3 className="text-lg sm:text-xl font-semibold">Our Mission</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              To provide accurate, unbiased news coverage and analysis that empowers readers to make informed decisions about the world around them.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
            <h3 className="text-lg sm:text-xl font-semibold">Global Perspective</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              We cover stories from around the world with local expertise and global context, bringing you comprehensive coverage of events that matter.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
            <h3 className="text-lg sm:text-xl font-semibold">Our Team</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Our experienced journalists, editors, and contributors bring decades of expertise across politics, business, technology, and world affairs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <Award className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto" />
            <h3 className="text-lg sm:text-xl font-semibold">Editorial Standards</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              We maintain the highest standards of accuracy, fairness, and ethical reporting. Every story is fact-checked and reviewed by our editorial team.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="prose prose-sm sm:prose-base md:prose-lg prose-neutral max-w-none dark:prose-invert px-2">
        <h2>Our Story</h2>
        <p>
          Founded in 2025, The Commons Voice emerged from a simple belief: that quality journalism should be accessible to everyone. In an era of information overload and polarization, we strive to cut through the noise and deliver news that matters.
        </p>
        
        <p>
          Our editorial philosophy centers on thorough research, multiple source verification, and presenting complex issues with clarity and context. We believe that informed citizens are the foundation of a healthy democracy.
        </p>

        <h2>Our Values</h2>
        <ul>
          <li><strong>Independence:</strong> We maintain editorial independence and are committed to reporting without bias or external influence.</li>
          <li><strong>Accuracy:</strong> Every fact is verified through multiple sources before publication.</li>
          <li><strong>Transparency:</strong> We clearly distinguish between news reporting and opinion content.</li>
          <li><strong>Accessibility:</strong> We make our content available to readers regardless of their economic background.</li>
        </ul>

        <h2>Contact Our Editorial Team</h2>
        <p>
          Have a story tip or feedback? We'd love to hear from you. Reach out to our editorial team at <a href="mailto:editorial@thecommonvoice.com">editorial@thecommonvoice.com</a>.
        </p>
      </div>
    </div>
  );
}