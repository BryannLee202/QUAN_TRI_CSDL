'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Language, translations } from "../locales/translations";
import { translateTextViToEn } from "../locales/viToEn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.vi;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const ATTRS_TO_TRANSLATE = ["placeholder", "title", "aria-label"] as const;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");
  const originalTextMap = useRef<WeakMap<Text, string>>(new WeakMap());
  const originalAttrMap = useRef<WeakMap<Element, Record<string, string>>>(new WeakMap());

  useEffect(() => {
    const saved = localStorage.getItem("mushroomcloud_lang") as Language;
    if (saved === "vi" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("mushroomcloud_lang", lang);
  };

  // Tự động đồng bộ dịch toàn bộ DOM khi chuyển đổi giữa Tiếng Việt và English trên mọi trang & modal
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;

    if (language === "en") {
      document.title = "MushroomCloud - Smart Farm FaaS Platform";
    } else {
      document.title = "MushroomCloud - Nông Nghiệp Thông Minh FaaS";
    }

    const applyToElementAttrs = (el: Element, targetLang: Language) => {
      if (el.closest?.("[data-no-translate='true']")) return;
      for (const attr of ATTRS_TO_TRANSLATE) {
        const val = el.getAttribute(attr);
        if (!val) continue;
        let savedAttrs = originalAttrMap.current.get(el);
        if (!savedAttrs) {
          savedAttrs = {};
          originalAttrMap.current.set(el, savedAttrs);
        }
        if (targetLang === "en") {
          if (savedAttrs[attr] === undefined) {
            savedAttrs[attr] = val;
          }
          const translated = translateTextViToEn(savedAttrs[attr]);
          if (translated !== val) {
            el.setAttribute(attr, translated);
          }
        } else if (savedAttrs[attr] !== undefined && val !== savedAttrs[attr]) {
          el.setAttribute(attr, savedAttrs[attr]);
        }
      }
    };

    const applyToTextNode = (node: Text, targetLang: Language) => {
      const parent = node.parentElement;
      if (!parent) return;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return;
      if (parent.closest("[data-no-translate='true']")) return;

      const currentVal = node.nodeValue || "";
      if (!currentVal.trim()) return;

      if (targetLang === "en") {
        if (!originalTextMap.current.has(node)) {
          originalTextMap.current.set(node, currentVal);
        }
        const sourceText = originalTextMap.current.get(node) ?? currentVal;
        const translated = translateTextViToEn(sourceText);
        if (translated !== currentVal) {
          node.nodeValue = translated;
        }
      } else {
        const orig = originalTextMap.current.get(node);
        if (orig !== undefined && currentVal !== orig) {
          node.nodeValue = orig;
        }
      }
    };

    const walkSubtree = (rootNode: Node, targetLang: Language) => {
      if (rootNode.nodeType === Node.TEXT_NODE) {
        applyToTextNode(rootNode as Text, targetLang);
        return;
      }
      if (rootNode.nodeType === Node.ELEMENT_NODE) {
        applyToElementAttrs(rootNode as Element, targetLang);
      }

      const walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
      );
      let current: Node | null = walker.nextNode();
      while (current) {
        if (current.nodeType === Node.TEXT_NODE) {
          applyToTextNode(current as Text, targetLang);
        } else if (current.nodeType === Node.ELEMENT_NODE) {
          applyToElementAttrs(current as Element, targetLang);
        }
        current = walker.nextNode();
      }
    };

    walkSubtree(document.body, language);

    if (language !== "en") return;

    // Theo dõi các Modal / Drawer / Trang con mở mới khi đang ở chế độ English để tự động dịch tức thì
    let isApplying = false;
    const observer = new MutationObserver((mutations) => {
      if (isApplying) return;
      isApplying = true;
      try {
        for (const m of mutations) {
          if (m.type === "childList") {
            m.addedNodes.forEach((n) => walkSubtree(n, "en"));
          } else if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
            const txt = m.target as Text;
            // Nếu React vừa render nội dung mới bằng tiếng Việt, cập nhật bản gốc và dịch
            const val = txt.nodeValue || "";
            const prevOrig = originalTextMap.current.get(txt);
            if (prevOrig === undefined || translateTextViToEn(prevOrig) !== val) {
              originalTextMap.current.set(txt, val);
              applyToTextNode(txt, "en");
            }
          }
        }
      } finally {
        isApplying = false;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
