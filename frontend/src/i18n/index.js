import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ICU from 'i18next-icu';

import fr from './fr.json';
import ar from './ar.json';
import en from './en.json';

i18n
  .use(ICU)                  // Support ICU message format (plurals, dates, numbers)
  .use(LanguageDetector)     // Détecte automatiquement la langue du navigateur
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'ar', 'en'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'autolink_lang',
    },
    interpolation: {
      escapeValue: false,
    },
    i18nFormat: {
      // Options ICU pour les formats de nombres et dates
      formats: {
        number: {
          MAD: { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 },
        },
      },
    },
  });

// Appliquer direction RTL pour l'arabe
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'ar';
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);

  // Charger la police arabe si nécessaire
  if (isRTL) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap';
    link.id = 'arabic-font';
    if (!document.getElementById('arabic-font')) {
      document.head.appendChild(link);
    }
    document.documentElement.style.setProperty('--font-display', "'Cairo', sans-serif");
    document.documentElement.style.setProperty('--font-body',    "'Cairo', sans-serif");
  } else {
    document.documentElement.style.setProperty('--font-display', "'Syne', sans-serif");
    document.documentElement.style.setProperty('--font-body',    "'DM Sans', sans-serif");
  }
});

// Appliquer immédiatement au chargement
const currentLang = localStorage.getItem('autolink_lang') || 'fr';
const isRTL = currentLang === 'ar';
document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', currentLang);

export default i18n;
