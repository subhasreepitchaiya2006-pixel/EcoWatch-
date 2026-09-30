import React, { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English (US)" },
  { value: "en-gb", label: "English (UK)" },
  { value: "ta", label: "Tamil" },
  { value: "hi", label: "Hindi" },
  { value: "te", label: "Telugu" },
  { value: "ml", label: "Malayalam" },
  { value: "kn", label: "Kannada" },
  { value: "bn", label: "Bengali" },
  { value: "mr", label: "Marathi" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

const TRANSLATIONS = {
  en: { home: "Home", about: "About Us", weather: "Weather", tag: "Satellite Data Suite 2.0 Now Live", title: "Intelligence for a Changing Planet.", subtitle: "Satellite-Integrated Smart Weather Alert and Environmental Intelligence Platform", note: "Frontend-only | Public APIs | Static hosting | No server maintenance", start: "Get Started", demo: "Request a Demo", login: "Login", footerAbout: "About Us", footerDemo: "Request Demo", dashboard: "Dashboard", map: "Interactive Map", airQuality: "Air Quality", communityReports: "Community Reports", disasterAlerts: "Disaster Alerts", analytics: "Analytics", profile: "Profile", settings: "Settings", logout: "Logout", search: "Search satellite feeds or locations...", general: "General", organization: "Organization", apiIntegration: "API & Integration", dataManagement: "Data Management", security: "Security" },
  "en-gb": { home: "Home", about: "About Us", weather: "Weather", tag: "Satellite Data Suite 2.0 Now Live", title: "Intelligence for a Changing Planet.", subtitle: "Satellite-Integrated Smart Weather Alert and Environmental Intelligence Platform", note: "Frontend-only | Public APIs | Static hosting | No server maintenance", start: "Get Started", demo: "Request a Demo", login: "Log in", footerAbout: "About Us", footerDemo: "Request Demo", dashboard: "Dashboard", map: "Interactive Map", airQuality: "Air Quality", communityReports: "Community Reports", disasterAlerts: "Disaster Alerts", analytics: "Analytics", profile: "Profile", settings: "Settings", logout: "Log out", search: "Search satellite feeds or locations..." },
  ta: { home: "முகப்பு", about: "எங்களை பற்றி", weather: "வானிலை", tag: "செயற்கைக்கோள் தரவு தொகுப்பு 2.0 நேரலையில்", title: "மாறும் பூமிக்கான நுண்ணறிவு.", subtitle: "செயற்கைக்கோள் ஒருங்கிணைந்த வானிலை எச்சரிக்கை மற்றும் சுற்றுச்சூழல் நுண்ணறிவு தளம்", note: "முன்பக்க பயன்பாடு | பொது API | நிலையான ஹோஸ்டிங்", start: "தொடங்குங்கள்", demo: "விளக்கத்தை கோருங்கள்", login: "உள்நுழை", footerAbout: "எங்களை பற்றி", footerDemo: "விளக்கத்தை கோருங்கள்" },
  hi: { home: "होम", about: "हमारे बारे में", weather: "मौसम", tag: "सैटेलाइट डेटा सुइट 2.0 लाइव", title: "बदलते ग्रह के लिए बुद्धिमत्ता।", subtitle: "सैटेलाइट आधारित मौसम चेतावनी और पर्यावरणीय बुद्धिमत्ता मंच", note: "फ्रंटएंड | सार्वजनिक API | स्थिर होस्टिंग", start: "शुरू करें", demo: "डेमो का अनुरोध", login: "लॉग इन", footerAbout: "हमारे बारे में", footerDemo: "डेमो का अनुरोध" },
  te: { home: "హోమ్", about: "మా గురించి", weather: "వాతావరణం", tag: "ఉపగ్రహ డేటా సూట్ 2.0 ప్రత్యక్షం", title: "మారుతున్న గ్రహం కోసం నిఘా.", subtitle: "ఉపగ్రహ ఆధారిత వాతావరణ హెచ్చరిక మరియు పర్యావరణ నిఘా వేదిక", note: "ఫ్రంట్ ఎండ్ | పబ్లిక్ APIలు | స్టాటిక్ హోస్టింగ్", start: "ప్రారంభించండి", demo: "డెమోను అభ్యర్థించండి", login: "లాగిన్", footerAbout: "మా గురించి", footerDemo: "డెమోను అభ్యర్థించండి" },
  ml: { home: "ഹോം", about: "ഞങ്ങളെക്കുറിച്ച്", weather: "കാലാവസ്ഥ", tag: "സാറ്റലൈറ്റ് ഡാറ്റ സ്യൂട്ട് 2.0 തത്സമയം", title: "മാറുന്ന ഭൂമിക്കായുള്ള ബുദ്ധി.", subtitle: "സാറ്റലൈറ്റ് സംയോജിത കാലാവസ്ഥാ മുന്നറിയിപ്പും പരിസ്ഥിതി ബുദ്ധി പ്ലാറ്റ്ഫോമും", note: "ഫ്രണ്ട് എൻഡ് | പൊതു API | സ്റ്റാറ്റിക് ഹോസ്റ്റിംഗ്", start: "ആരംഭിക്കുക", demo: "ഡെമോ ആവശ്യപ്പെടുക", login: "ലോഗിൻ", footerAbout: "ഞങ്ങളെക്കുറിച്ച്", footerDemo: "ഡെമോ ആവശ്യപ്പെടുക" },
  kn: { home: "ಮುಖಪುಟ", about: "ನಮ್ಮ ಬಗ್ಗೆ", weather: "ಹವಾಮಾನ", tag: "ಉಪಗ್ರಹ ಡೇಟಾ ಸೂಟ್ 2.0 ನೇರ ಪ್ರಸಾರ", title: "ಬದಲಾಗುತ್ತಿರುವ ಗ್ರಹಕ್ಕಾಗಿ ಬುದ್ಧಿವಂತಿಕೆ.", subtitle: "ಉಪಗ್ರಹ ಆಧಾರಿತ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ಮತ್ತು ಪರಿಸರ ಬುದ್ಧಿವಂತಿಕೆ ವೇದಿಕೆ", note: "ಫ್ರಂಟ್ ಎಂಡ್ | ಸಾರ್ವಜನಿಕ API | ಸ್ಥಿರ ಹೋಸ್ಟಿಂಗ್", start: "ಪ್ರಾರಂಭಿಸಿ", demo: "ಡೆಮೊ ವಿನಂತಿಸಿ", login: "ಲಾಗಿನ್", footerAbout: "ನಮ್ಮ ಬಗ್ಗೆ", footerDemo: "ಡೆಮೊ ವಿನಂತಿಸಿ" },
  bn: { home: "হোম", about: "আমাদের সম্পর্কে", weather: "আবহাওয়া", tag: "স্যাটেলাইট ডেটা স্যুট 2.0 লাইভ", title: "পরিবর্তনশীল গ্রহের জন্য বুদ্ধিমত্তা।", subtitle: "স্যাটেলাইট সমন্বিত আবহাওয়া সতর্কতা ও পরিবেশগত বুদ্ধিমত্তা প্ল্যাটফর্ম", note: "ফ্রন্টএন্ড | পাবলিক API | স্ট্যাটিক হোস্টিং", start: "শুরু করুন", demo: "ডেমোর অনুরোধ করুন", login: "লগইন", footerAbout: "আমাদের সম্পর্কে", footerDemo: "ডেমোর অনুরোধ" },
  mr: { home: "मुख्यपृष्ठ", about: "आमच्याबद्दल", weather: "हवामान", tag: "सॅटेलाइट डेटा सूट 2.0 थेट", title: "बदलत्या ग्रहासाठी बुद्धिमत्ता.", subtitle: "सॅटेलाइट आधारित हवामान इशारा आणि पर्यावरणीय बुद्धिमत्ता व्यासपीठ", note: "फ्रंटएंड | सार्वजनिक API | स्थिर होस्टिंग", start: "सुरू करा", demo: "डेमोची विनंती करा", login: "लॉग इन", footerAbout: "आमच्याबद्दल", footerDemo: "डेमोची विनंती" },
  de: { home: "Startseite", about: "Über uns", weather: "Wetter", tag: "Satellitendaten-Suite 2.0 ist live", title: "Intelligenz für einen sich wandelnden Planeten.", subtitle: "Satellitenbasierte Wetterwarnungen und Umweltintelligenz", note: "Nur Frontend | Öffentliche APIs | Statisches Hosting", start: "Loslegen", demo: "Demo anfordern", login: "Anmelden", footerAbout: "Über uns", footerDemo: "Demo anfordern" },
  fr: { home: "Accueil", about: "À propos", weather: "Météo", tag: "La suite de données satellite 2.0 est en ligne", title: "L'intelligence pour une planète en changement.", subtitle: "Plateforme météo et environnementale intégrée aux satellites", note: "Frontend | API publiques | Hébergement statique", start: "Commencer", demo: "Demander une démo", login: "Connexion", footerAbout: "À propos", footerDemo: "Demander une démo" },
  es: { home: "Inicio", about: "Sobre nosotros", weather: "Clima", tag: "Suite de datos satelitales 2.0 en vivo", title: "Inteligencia para un planeta cambiante.", subtitle: "Plataforma de alertas meteorológicas e inteligencia ambiental por satélite", note: "Frontend | API públicas | Hosting estático", start: "Comenzar", demo: "Solicitar una demo", login: "Iniciar sesión", footerAbout: "Sobre nosotros", footerDemo: "Solicitar demo" },
  pt: { home: "Início", about: "Sobre nós", weather: "Clima", tag: "Suíte de dados de satélite 2.0 ao vivo", title: "Inteligência para um planeta em mudança.", subtitle: "Plataforma de alertas meteorológicos e inteligência ambiental por satélite", note: "Frontend | APIs públicas | Hospedagem estática", start: "Começar", demo: "Solicitar demonstração", login: "Entrar", footerAbout: "Sobre nós", footerDemo: "Solicitar demonstração" },
  ar: { home: "الرئيسية", about: "من نحن", weather: "الطقس", tag: "حزمة بيانات الأقمار الصناعية 2.0 مباشرة", title: "ذكاء لكوكب متغير.", subtitle: "منصة تنبيهات الطقس والذكاء البيئي المعتمدة على الأقمار الصناعية", note: "واجهة أمامية | واجهات عامة | استضافة ثابتة", start: "ابدأ الآن", demo: "اطلب عرضاً", login: "تسجيل الدخول", footerAbout: "من نحن", footerDemo: "اطلب عرضاً" },
  zh: { home: "首页", about: "关于我们", weather: "天气", tag: "卫星数据套件 2.0 已上线", title: "为不断变化的地球提供智能洞察。", subtitle: "卫星集成的天气预警和环境智能平台", note: "前端 | 公共 API | 静态托管", start: "开始使用", demo: "申请演示", login: "登录", footerAbout: "关于我们", footerDemo: "申请演示" },
  ja: { home: "ホーム", about: "概要", weather: "天気", tag: "衛星データスイート 2.0 が稼働中", title: "変化する地球のためのインテリジェンス。", subtitle: "衛星統合型スマート気象警報・環境インテリジェンスプラットフォーム", note: "フロントエンド | 公開 API | 静的ホスティング", start: "始める", demo: "デモを依頼", login: "ログイン", footerAbout: "概要", footerDemo: "デモを依頼" },
};

const SHARED_TRANSLATIONS = {
  ta: { dashboard: "டாஷ்போர்டு", map: "ஊடாடும் வரைபடம்", airQuality: "காற்றின் தரம்", communityReports: "சமூக அறிக்கைகள்", disasterAlerts: "பேரிடர் எச்சரிக்கைகள்", analytics: "பகுப்பாய்வு", profile: "சுயவிவரம்", settings: "அமைப்புகள்", logout: "வெளியேறு", search: "செயற்கைக்கோள் ஊட்டங்களைத் தேடுங்கள்..." },
  hi: { dashboard: "डैशबोर्ड", map: "इंटरैक्टिव मानचित्र", airQuality: "वायु गुणवत्ता", communityReports: "सामुदायिक रिपोर्ट", disasterAlerts: "आपदा चेतावनी", analytics: "विश्लेषण", profile: "प्रोफ़ाइल", settings: "सेटिंग्स", logout: "लॉग आउट", search: "सैटेलाइट फीड खोजें..." },
  te: { dashboard: "డ్యాష్‌బోర్డ్", map: "ఇంటరాక్టివ్ మ్యాప్", airQuality: "గాలి నాణ్యత", communityReports: "కమ్యూనిటీ నివేదికలు", disasterAlerts: "విపత్తు హెచ్చరికలు", analytics: "విశ్లేషణ", profile: "ప్రొఫైల్", settings: "సెట్టింగ్‌లు", logout: "లాగ్ అవుట్", search: "ఉపగ్రహ ఫీడ్‌లను వెతకండి..." },
  de: { dashboard: "Dashboard", map: "Interaktive Karte", airQuality: "Luftqualität", communityReports: "Gemeindeberichte", disasterAlerts: "Katastrophenwarnungen", analytics: "Analysen", profile: "Profil", settings: "Einstellungen", logout: "Abmelden", search: "Satellitenfeeds oder Orte suchen..." },
  fr: { dashboard: "Tableau de bord", map: "Carte interactive", airQuality: "Qualité de l'air", communityReports: "Rapports communautaires", disasterAlerts: "Alertes de catastrophe", analytics: "Analyses", profile: "Profil", settings: "Paramètres", logout: "Déconnexion", search: "Rechercher des flux satellite ou des lieux..." },
  es: { dashboard: "Panel", map: "Mapa interactivo", airQuality: "Calidad del aire", communityReports: "Informes comunitarios", disasterAlerts: "Alertas de desastre", analytics: "Análisis", profile: "Perfil", settings: "Configuración", logout: "Cerrar sesión", search: "Buscar fuentes satelitales o lugares..." },
};

const GOOGLE_LANGUAGE_CODES = {
  "en-gb": "en",
  zh: "zh-CN",
};

function getGoogleLanguageCode(language) {
  return GOOGLE_LANGUAGE_CODES[language] || language;
}

function setGoogleTranslateCookie(language) {
  const targetLanguage = getGoogleLanguageCode(language);
  document.cookie = `googtrans=/en/${targetLanguage}; path=/`;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("ecowatch-language") || "en";
  });

  const setLanguage = (nextLanguage) => {
    if (!LANGUAGE_OPTIONS.some((option) => option.value === nextLanguage)) return;
    setLanguageState(nextLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("ecowatch-language", language);
  }, [language]);

  useEffect(() => {
    const targetLanguage = getGoogleLanguageCode(language);
    const translationCookie = `/en/${targetLanguage}`;
    const hasTargetCookie = document.cookie.includes(`googtrans=${translationCookie}`);
    const isTranslated = document.cookie.includes("googtrans=/en/") && !document.cookie.includes("googtrans=/en/en");

    if (targetLanguage === "en") {
      if (isTranslated) {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        window.location.reload();
        return;
      }
    } else if (!hasTargetCookie) {
      setGoogleTranslateCookie(language);
      window.location.reload();
      return;
    }

    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false, includedLanguages: [...new Set(LANGUAGE_OPTIONS.map((option) => getGoogleLanguageCode(option.value)))].join(",") },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, [language]);

  const translate = (key) => SHARED_TRANSLATIONS[language]?.[key] || (TRANSLATIONS[language] || TRANSLATIONS.en)[key] || TRANSLATIONS.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, options: LANGUAGE_OPTIONS, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside a <LanguageProvider>");
  return context;
}