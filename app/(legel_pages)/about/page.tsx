import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about The Commons Voice - our mission, values, and commitment to independent journalism.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">TheCommonsVoice </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
          We love to tell grounded stories and explore life
        </p>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
          TheCommonsVoice was founded in 2025 with a simple belief: 
Important stories don't always come from the powerful. Sometimes they come from the ordinary people living ordinary lives. 
Started as a storytelling platform dedicated to sharing unheard Voices, TheCommonsVoice has evolved into a digital media space for podcasts, storytelling, journalism, and social conversations.
Today, we creates content that informs, motivates, and connects people with the stories that Matter!
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

      
    </div>
  );
}
