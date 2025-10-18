import {
  Home,
  Tv,
  Newspaper,
  BarChart3,
  Film,
  Briefcase,
  CheckCircle,
  Palette,
} from "lucide-react";

export const portalNav = [
  { label: "Home", href: "/", icon: Home },
  { label: "TV", href: "/tv", icon: Tv },
  { label: "Magazine", href: "/magazine", icon: Newspaper },
  // {
  //   label: "Election Hub",
  //   href: "/election",
  //   icon: BarChart3,
  //   children: [
  //     { label: "2025 Elections", href: "/election/2025" },
  //     { label: "Exit Polls", href: "/election/polls" },
  //   ],
  // },
  { label: "Life+Style", href: "/lifestyle", icon: Palette },
  { label: "Business", href: "/business", icon: Briefcase },
  { label: "Videos", href: "/videos", icon: Film },
  { label: "Fact Check", href: "/fact-check", icon: CheckCircle },
];
