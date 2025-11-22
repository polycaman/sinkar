interface ThemeConfig {
  siteTitle: string;
  siteDescription: string;
  paletteId: string;
  fontFamily: string;
  borderRadius: string;
  storeEmail?: string; // Added for store theme
  layoutStyle?: string;
  designVariant?: string;
  extraPages?: Array<{ title: string; content: string; }>;
}

const PALETTES: Record<string, any> = {
  default: { name: "Ocean Breeze", primary: "#2563eb", secondary: "#0ea5e9", bg: "#f8fafc", text: "#0f172a", surface: "#ffffff" },
  midnight: { name: "Midnight Pro", primary: "#6366f1", secondary: "#a855f7", bg: "#0f172a", text: "#f8fafc", surface: "#1e293b" },
  forest: { name: "Deep Forest", primary: "#059669", secondary: "#d97706", bg: "#f0fdf4", text: "#064e3b", surface: "#ffffff" },
  sunset: { name: "Sunset Glow", primary: "#e11d48", secondary: "#f59e0b", bg: "#fff1f2", text: "#881337", surface: "#ffffff" },
  monochrome: { name: "Swiss Mono", primary: "#000000", secondary: "#525252", bg: "#ffffff", text: "#171717", surface: "#f5f5f5" },
  coffee: { name: "Morning Coffee", primary: "#78350f", secondary: "#b45309", bg: "#fffbeb", text: "#451a03", surface: "#ffffff" },
  cyber: { name: "Cyberpunk", primary: "#00ff41", secondary: "#d600ff", bg: "#050505", text: "#e0e0e0", surface: "#111111" },
  luxury: { name: "Gold & Slate", primary: "#c2410c", secondary: "#fbbf24", bg: "#1c1917", text: "#e7e5e4", surface: "#292524" },
};

interface ThemeField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'url' | 'date' | 'boolean' | 'image';
  placeholder?: string;
}

const THEME_SCHEMAS: Record<string, ThemeField[]> = {
  writer: [
    { name: 'tags', label: 'Tags (comma separated)', type: 'text', placeholder: 'tech, life, coding' },
    { name: 'coverImage', label: 'Cover Image', type: 'image' }
  ],
  store: [
    { name: 'price', label: 'Price', type: 'number', placeholder: '0.00' },
    { name: 'currency', label: 'Currency', type: 'text', placeholder: 'USD' },
    { name: 'stock', label: 'Stock Quantity', type: 'number' },
    { name: 'coverImage', label: 'Product Image', type: 'image' },
    { name: 'features', label: 'Product Features (comma separated)', type: 'text' }
  ],
  portfolio: [
    { name: 'client', label: 'Client Name', type: 'text' },
    { name: 'projectDate', label: 'Project Date', type: 'date' },
    { name: 'projectUrl', label: 'Project URL', type: 'url' },
    { name: 'coverImage', label: 'Project Thumbnail', type: 'image' },
    { name: 'role', label: 'My Role', type: 'text' }
  ],
  landing: [
    { name: 'ctaText', label: 'Call to Action Text', type: 'text', placeholder: 'Get Started' },
    { name: 'ctaLink', label: 'Call to Action URL', type: 'url' },
    { name: 'coverImage', label: 'Feature Image', type: 'image' },
    { name: 'icon', label: 'Feature Icon Class', type: 'text', placeholder: 'fa-solid fa-rocket' }
  ]
};

// Expose to window for non-module environments
(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.PALETTES = PALETTES;
(window as any).SinkarGenerators.THEME_SCHEMAS = THEME_SCHEMAS;
