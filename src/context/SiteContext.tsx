import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataApi, schemaApi } from '@/lib/api';

interface RitualItem {
  title: string;
  desc: string;
}

export interface DynamicPageData {
  slug: string;
  title: string;
  content: string;
}

export interface SiteContent {
  heroSubheading: string;
  conciergeTitle: string;
  conciergeHeading: string;
  conciergeText: string;
  ritualTitle: string;
  ritualHeading: string;
  ritualItems: RitualItem[];
  commissionTitle: string;
  commissionHeading: string;
  commissionText: string;
  commissionPenBrand: string;
  commissionPenName: string;
  penImage: string;
  pages: DynamicPageData[];
  stripePublicKey: string;
  firebaseApiKey: string;
  firebaseProjectId: string;
  servicePrice: number;
  penScale: number;
  
  // Dynamic Website Copy Upgrades
  discoverSubtitle: string;
  conciergeSommelierPillar1Title: string;
  conciergeSommelierPillar1Text: string;
  conciergeSommelierPillar2Title: string;
  conciergeSommelierPillar2Text: string;
  conciergeSommelierPillar3Title: string;
  conciergeSommelierPillar3Text: string;
  bookServiceButtonText: string;
  vaultEntranceButtonText: string;
  
  // Service Area Displays
  regionWesternTitle: string;
  regionWesternText: string;
  regionCentralTitle: string;
  regionCentralText: string;
  regionTownTitle: string;
  regionTownText: string;

  // Toggle Visibility Switches
  showConciergeSection: boolean;
  showWhiteGloveSection: boolean;
  showCoverageSection: boolean;
  showDynamicPages: boolean;
  acceptingOrders: boolean;
}

export interface SiteTheme {
  backgroundColor: string; // Hex
  textColor: string; // Hex
  accentColor: string; // Hex
  borderRadius: string; // e.g. "8px"
  borderWidth: string; // e.g. "2px"
  borderStyle: string; // e.g. "solid"
  fontFamilyPrimary: string;
  fontFamilySecondary: string;
}

export interface SiteContextType {
  content: SiteContent;
  theme: SiteTheme;
  isLoading: boolean;
  updateContent: (newContent: Partial<SiteContent>) => Promise<void>;
  updateTheme: (newTheme: Partial<SiteTheme>) => Promise<void>;
  updateServicePrice: (price: number) => Promise<void>;
  resetToDefault: () => Promise<void>;
  addPage: (page: DynamicPageData) => Promise<void>;
  removePage: (slug: string) => Promise<void>;
}

const DEFAULT_CONTENT: SiteContent = {
  heroSubheading: "Luxury in Every Stroke",
  conciergeTitle: "The Concierge",
  conciergeHeading: "Mastery in Person.",
  conciergeText: "No shipping. No waiting. Commission one of our master specialists to visit your private residence or office. We handle your most prized writing instruments with the reverence they deserve.",
  ritualTitle: "The White-Glove Ritual",
  ritualHeading: "The Refilling Ceremony.",
  ritualItems: [
    { title: 'The Purge', desc: 'Pharmaceutical-grade feed flush.' },
    { title: 'The Curation', desc: 'Private vault ink selection.' },
    { title: 'The Prime', desc: 'Flawless fill and nib polish.' },
  ],
  commissionTitle: "Commission",
  commissionHeading: "Reserve Your Concierge.",
  commissionText: "Experience the ultimate care for your collection.",
  commissionPenBrand: "Visconti",
  commissionPenName: "Homo Sapiens",
  penImage: "/uploaded1-pen.png",
  pages: [],
  stripePublicKey: "",
  firebaseApiKey: "",
  firebaseProjectId: "",
  servicePrice: 2500,
  penScale: 1.0,
  
  // Dynamic Website Copy Upgrades
  discoverSubtitle: "We bring the world's finest pen care and ink library directly to your home or office. Zero mess, zero downtime, and endless colour possibilities.",
  conciergeSommelierPillar1Title: "The Mobile Atelier",
  conciergeSommelierPillar1Text: "No mailing your precious pens. No dropping them off. Our trained artisans come directly to your residence or workplace at a time that suits you.",
  conciergeSommelierPillar2Title: "Sacred Preservation",
  conciergeSommelierPillar2Text: "We treat your instruments with the utmost respect. We meticulously flush, clean, and inspect your pens by hand, strictly avoiding harsh ultrasonic machines.",
  conciergeSommelierPillar3Title: "The Infinite Palette",
  conciergeSommelierPillar3Text: "Refill on the spot from our library of 500+ premium inks. Choose your exact colour today, without the commitment of buying the bottle.",
  bookServiceButtonText: "Book Your Concierge Session",
  vaultEntranceButtonText: "Enter Your Private Vault",
  
  // Service Area Displays
  regionWesternTitle: "Western",
  regionWesternText: "Whole corridor",
  regionCentralTitle: "Central",
  regionCentralText: "Till Ghatkopar",
  regionTownTitle: "Town",
  regionTownText: "Till Colaba",

  // Toggle Visibility Switches
  showConciergeSection: true,
  showWhiteGloveSection: true,
  showCoverageSection: true,
  showCommissionSection: true,
  showDynamicPages: true,
  acceptingOrders: true,
};

const DEFAULT_THEME: SiteTheme = {
  backgroundColor: "#F5F5F5",
  textColor: "#004225",
  accentColor: "#D4AF37",
  borderRadius: "8px",
  borderWidth: "2px",
  borderStyle: "solid",
  fontFamilyPrimary: "'Playfair Display', Georgia, serif",
  fontFamilySecondary: "'Inter', system-ui, sans-serif",
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const hexToHsl = (hex: string): string => {
  if (!hex || hex[0] !== '#') return "0 0% 0%";
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);
  const [schemaId, setSchemaId] = useState<string | null>(null);

  useEffect(() => {
    const initSite = async () => {
      try {
        // 1. Get or create the 'site_config' schema
        const response = await schemaApi.getAll();
        const schemas = response?.data || [];
        
        if (!Array.isArray(schemas)) {
          console.error('Expected schemas array from backend, got:', schemas);
          setIsLoading(false);
          return;
        }

        let siteSchema = schemas.find((s: any) => s.collectionName === 'site_config');
        
        if (!siteSchema) {
          try {
            const { data: newSchema } = await schemaApi.create({
              collectionName: 'site_config',
              displayName: 'Site Configuration',
              fields: [
                { name: 'content', label: 'Site Content', type: 'rich-text' },
                { name: 'theme', label: 'Site Theme', type: 'rich-text' }
              ]
            });
            siteSchema = newSchema;
          } catch (err) {
            console.error('Failed to create site_config schema:', err);
          }
        }

        if (siteSchema?._id) {
          setSchemaId(siteSchema._id);

          // 2. Fetch data for this schema
          const { data: siteData } = await dataApi.getBySchema(siteSchema._id);
          if (siteData && siteData.length > 0) {
            const config = siteData[0];
            setConfigId(config._id);
            
            // Defensively merge with defaults to prevent crashes if fields are missing
            const fetchedContent = config.data?.content || {};
            const fetchedTheme = config.data?.theme || {};

            setContent(prev => ({ 
              ...DEFAULT_CONTENT, 
              ...fetchedContent,
              // Ensure critical arrays and strings exist
              ritualItems: fetchedContent.ritualItems || DEFAULT_CONTENT.ritualItems,
              pages: fetchedContent.pages || DEFAULT_CONTENT.pages,
              conciergeHeading: fetchedContent.conciergeHeading || DEFAULT_CONTENT.conciergeHeading,
              ritualHeading: fetchedContent.ritualHeading || DEFAULT_CONTENT.ritualHeading,
              commissionHeading: fetchedContent.commissionHeading || DEFAULT_CONTENT.commissionHeading
            }));

            if (fetchedTheme) {
              setTheme(prev => ({ ...DEFAULT_THEME, ...fetchedTheme }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch site config from backend:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSite();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--background', hexToHsl(theme.backgroundColor));
    root.style.setProperty('--foreground', hexToHsl(theme.textColor));
    root.style.setProperty('--primary', hexToHsl(theme.textColor));
    root.style.setProperty('--ink-green', hexToHsl(theme.textColor));
    root.style.setProperty('--accent', hexToHsl(theme.accentColor));
    root.style.setProperty('--gold', hexToHsl(theme.accentColor));
    root.style.setProperty('--radius', theme.borderRadius);
    root.style.setProperty('--border-width', theme.borderWidth);
    root.style.setProperty('--border-style', theme.borderStyle);
    root.style.setProperty('--font-serif', theme.fontFamilyPrimary);
    root.style.setProperty('--font-sans', theme.fontFamilySecondary);
  }, [theme]);

  const updateContent = async (newContent: Partial<SiteContent>) => {
    const updated = { ...content, ...newContent };
    setContent(updated);
    if (schemaId) {
      const { data } = await dataApi.upsert({
        schemaId,
        uniqueId: configId,
        data: { content: updated, theme }
      });
      if (data?._id && !configId) setConfigId(data._id);
    }
  };

  const updateTheme = async (newTheme: Partial<SiteTheme>) => {
    const updated = { ...theme, ...newTheme };
    setTheme(updated);
    if (schemaId) {
      const { data } = await dataApi.upsert({
        schemaId,
        uniqueId: configId,
        data: { content, theme: updated }
      });
      if (data?._id && !configId) setConfigId(data._id);
    }
  };

  const updateServicePrice = async (price: number) => {
    const updatedContent = { ...content, servicePrice: price };
    setContent(updatedContent);
    if (schemaId) {
      await dataApi.upsert({
        schemaId,
        uniqueId: configId,
        data: { content: updatedContent, theme }
      });
    }
  };

  const resetToDefault = async () => {
    setContent(DEFAULT_CONTENT);
    setTheme(DEFAULT_THEME);
    if (schemaId && configId) {
      await dataApi.upsert({
        schemaId,
        uniqueId: configId,
        data: { content: DEFAULT_CONTENT, theme: DEFAULT_THEME }
      });
    }
  };

  const addPage = async (page: DynamicPageData) => {
    const updatedContent = {
      ...content,
      pages: [...content.pages, page]
    };
    setContent(updatedContent);
    if (schemaId) {
      await dataApi.upsert({
        schemaId,
        uniqueId: configId,
        data: { content: updatedContent, theme }
      });
    }
  };

  const removePage = async (slug: string) => {
    const updatedContent = {
      ...content,
      pages: content.pages.filter(p => p.slug !== slug)
    };
    setContent(updatedContent);
    if (schemaId) {
      await dataApi.upsert({
        schemaId,
        uniqueId: configId,
        data: { content: updatedContent, theme }
      });
    }
  };

  return (
    <SiteContext.Provider value={{ 
      content, theme, isLoading, 
      updateContent, updateTheme, updateServicePrice,
      resetToDefault, addPage, removePage 
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
