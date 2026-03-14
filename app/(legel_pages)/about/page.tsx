import type { Metadata } from "next";
import UttarakhandSVGMap from "@/components/UttarakhandSVGMap";

export const metadata: Metadata = {
  title: "About | The Commons Voice",
  description: "Learn more about The Commons Voice - our mission, values, and commitment to independent journalism in Uttarakhand and beyond.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

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
          
          <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="p-8 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 hover:border-primary/30 group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                   <div className="w-6 h-6 bg-primary rounded-full opacity-80"></div>
                </div>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  The Commons Voice was founded in 2025 with a simple belief: Important stories don't always come from the powerful. Sometimes they come from the ordinary people living ordinary lives.
                </p>
            </div>
            <div className="p-8 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 hover:border-primary/30 group">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                   <div className="w-6 h-6 bg-indigo-500 rounded-full opacity-80 animate-pulse"></div>
                </div>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  Started as a storytelling platform dedicated to sharing unheard voices, The Commons Voice has evolved into a digital media space for podcasts, storytelling, journalism, and social conversations.
                </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
          <div className="space-y-16 order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-1000 delay-500">
              <div className="space-y-6">
                <div className="relative">
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-gray-100 relative inline-block">
                    Our Philosophy
                    <span className="absolute -bottom-2 left-0 w-1/2 h-2 bg-primary/40 rounded-full"></span>
                  </h2>
                </div>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
                  We believe the strongest impact comes from stories grounded in reality. The idea that <span className="text-primary font-bold">authentic stories matter more than loud narratives</span>! Because when stories stay rooted in truth, they resonate further and leave a lasting impression.
                </p>
              </div>
              
              <div className="space-y-6 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700"></div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <span className="w-8 h-8 flex items-center justify-center bg-primary text-white text-base rounded-full shadow-lg shadow-primary/20">02</span>
                  Our Focus
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  While our stories explore life everywhere, we place special attention on Uttarakhand's people, culture, issues, and voices. We believe regional stories deserve a global audience and a standard of excellence.
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
                    <div className="mt-4 flex items-center gap-4 bg-white/50 dark:bg-black/50 px-6 py-2 rounded-full backdrop-blur-md border-primary/10 pointer-events-none">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">HQ: Dehradun</span>
                    </div>
                </div>
            </div>
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

