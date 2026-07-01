"use client";

import { useEffect, useState } from "react";
import { Globe, ChevronDown } from "lucide-react";

// Famous international languages + regional Indian languages
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh-CN", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ar", name: "العربية" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "hi", name: "हिंदी" },
  { code: "bn", name: "বাংলা" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ml", name: "മലയാളം" },
  { code: "or", name: "ଓଡ଼ିଆ" },
  { code: "ur", name: "اردو" },
];

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const setCookie = (name: string, value: string, days?: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const getCookie = (name: string) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export default function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    // 1. Resolve current active language from cookie on mount
    const transCookie = getCookie("googtrans");
    if (transCookie) {
      const parts = transCookie.split("/");
      const currentCode = parts[parts.length - 1];
      if (currentCode) {
        setSelectedLanguage(currentCode);
      }
    }

    // 2. Load Google Translate script dynamically
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,es,fr,de,zh-CN,ja,ar,pt,ru,hi,bn,pa,mr,gu,ta,te,kn,ml,or,ur",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };
    }
  }, []);

  const changeLanguage = (code: string) => {
    setSelectedLanguage(code);

    const cookieValue = code === "en" ? "" : `/en/${code}`;
    setCookie("googtrans", cookieValue);

    const googleSelect = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (googleSelect) {
      googleSelect.value = code;
      googleSelect.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div id="google_translate_element" className="hidden" style={{ display: "none" }}></div>

      <div className="relative flex items-center gap-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-full px-2 py-0.5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
        <Globe className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 animate-pulse" />
        <select
          value={selectedLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="notranslate appearance-none bg-transparent pr-4 pl-0.5 py-0 text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 outline-none border-none cursor-pointer w-[50px] sm:w-[58px] focus:ring-0 truncate"
          translate="no"
        >
          {languages.map((lng) => (
            <option key={lng.code} value={lng.code} className="notranslate text-black dark:text-white bg-white dark:bg-black" translate="no">
              {lng.name}
            </option>
          ))}
        </select>
        <ChevronDown className="h-2.5 w-2.5 text-gray-400 absolute right-2 pointer-events-none" />
      </div>
    </div>
  );
}
