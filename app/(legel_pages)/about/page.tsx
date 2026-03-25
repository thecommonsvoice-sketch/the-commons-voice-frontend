import type { Metadata } from "next";
import UttarakhandSVGMap from "@/components/UttarakhandSVGMap";
import { Mail, Instagram, Facebook, type LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "About | The Commons Voice",
  description: "Learn more about The Commons Voice - our mission, values, and commitment to independent journalism in Uttarakhand and beyond.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

type SocialLink =
  | {
      kind: "icon";
      icon: LucideIcon;
      href: string;
      label: string;
      color: string;
    }
  | {
      kind: "image";
      imageSrc: string;
      href: string;
      label: string;
      color: string;
    };

const socialLinks: SocialLink[] = [
  {
    kind: "icon",
    icon: Instagram,
    href: "https://www.instagram.com/thecommons_voice/",
    label: "Instagram",
    color: "hover:text-pink-500 hover:bg-pink-500/10",
  },
  {
    kind: "image",
    imageSrc: "https://cdn.simpleicons.org/threads/111111",
    href: "https://www.threads.com/@thecommons_voice",
    label: "Threads",
    color: "hover:bg-neutral-900/10 dark:hover:bg-white/10",
  },
  {
    kind: "icon",
    icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=61578787756966",
    label: "Facebook",
    color: "hover:text-blue-600 hover:bg-blue-600/10",
  },
  {
    kind: "image",
    imageSrc: "https://cdn.simpleicons.org/x/111111",
    href: "https://x.com/commonsvoice1",
    label: "X",
    color: "hover:bg-zinc-900/10 dark:hover:bg-white/10",
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 max-w-6xl relative z-10">
        <div className="text-center space-y-6 mb-20 sm:mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             Our Journey
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            The Commons Voice
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground font-semibold max-w-3xl mx-auto px-2 italic animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            "We love to tell grounded stories and explore life."
          </p>
          
          <div className="max-w-4xl mx-auto mt-12 text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="p-8 sm:p-10 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 hover:border-primary/30 group">
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-[0.2em] uppercase">
                  Since 2025
                </div>

                <div className="space-y-6">
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    The Commons Voice was founded in 2025 with a simple belief: Important stories don&apos;t always come from the powerful. Sometimes they come from the ordinary people living ordinary lives.
                  </p>

                  <div className="h-px w-full bg-gradient-to-r from-primary/30 via-indigo-500/40 to-transparent"></div>

                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                    Started as a storytelling platform dedicated to sharing unheard voices, The Commons Voice has evolved into a digital media space for podcasts, storytelling, journalism, and social conversations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
          <div className="space-y-8 order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-1000 delay-500">
              <div className="space-y-6 p-8 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-primary/10 rounded-[2.5rem] relative group overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 hover:border-primary/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Our Philosophy
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
                  We believe the strongest impact comes from stories grounded in reality. The idea that <span className="text-primary font-bold">authentic stories matter more than loud narratives</span>! Because when stories stay rooted in truth, they resonate further and leave a lasting impression.
                </p>
              </div>
              
              <div className="space-y-6 p-8 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-primary/10 rounded-[2.5rem] relative group overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 hover:border-primary/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Our Focus
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
                  While our stories explore life everywhere, we place special attention on Uttarakhand&apos;s people, culture, issues, and voices. We believe regional stories deserve a global audience.
                </p>
              </div>
          </div>

          <div className="order-1 lg:order-2 animate-in fade-in zoom-in duration-1000 delay-500">
            <div className="w-full relative aspect-square max-w-[550px] mx-auto group">
                {/* Decorative Frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-60"></div>
                
                <div className="relative w-full h-full bg-white/40 dark:bg-black/60 backdrop-blur-2xl rounded-[3rem] p-4 sm:p-8 flex flex-col items-center justify-center border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <div className="absolute top-8 left-8 text-xs font-black tracking-widest text-primary/40 uppercase">Uttarakhand & Beyond</div>
                    <div className="w-full h-[85%] relative z-10 group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                      <UttarakhandSVGMap />
                    </div>
                    <div className="mt-4 flex items-center bg-white/50 dark:bg-black/50 px-6 py-2 rounded-full backdrop-blur-md border-primary/10 pointer-events-none">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">HQ: Dehradun</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Share Your Story Section */}
        <div className="mt-32 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-indigo-500/5 blur-3xl -z-10"></div>
          
          <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-primary/10 rounded-[3rem] shadow-2xl overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-700"></div>
            
            <div className="relative z-10 text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                Submit Your Story
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-gray-100 italic">
                Do you have a story that deserves to be heard?
              </h2>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Whether it's a personal journey, a community experience, or a voice from the ground — we would love to hear it and share it with the world.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4">
                <a 
                  href="mailto:thecommonsvoice@gmail.com" 
                  className="flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.05] hover:shadow-primary/30 active:scale-95 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  <Mail className="w-5 h-5 dark:text-black" />
                  <span className="dark:text-black">Email Us</span>
                </a>
                
                <a 
                  href="https://www.instagram.com/thecommons_voice/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-zinc-900 border border-primary/20 text-foreground rounded-2xl font-bold hover:bg-primary/5 hover:border-primary/40 hover:scale-[1.05] active:scale-95 transition-all duration-300 w-full sm:w-auto justify-center shadow-sm"
                >
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <span>@thecommons_voice</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Follow Socials Section */}
        <div className="mt-32 text-center space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Follow TheCommonsVoice</h2>
            <p className="text-muted-foreground font-medium">Connect with us on social media for daily updates and stories.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl border border-primary/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl transition-all duration-500 hover:scale-110 shadow-sm hover:shadow-md ${social.color} group`}
                title={social.label}
              >
                {social.kind === "icon" ? (
                  <social.icon className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-500 group-hover:rotate-[360deg]" />
                ) : (
                  <img
                    src={social.imageSrc}
                    alt={social.label}
                    className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-500 group-hover:scale-110 dark:invert"
                  />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Footer Section for About */}
      <div className="container mx-auto px-4 py-20 mt-20 border-t border-primary/10 text-center animate-in fade-in duration-1000 delay-700">
         <p className="text-muted-foreground max-w-2xl mx-auto font-medium italic">
            Connecting local voices to local hearts, and the world to the unheard truth.
         </p>
      </div>
    </div>
  );
}

