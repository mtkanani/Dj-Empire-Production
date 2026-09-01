export const C = {
  bg: "#000000",
  bgDark: "#0B0B0B",
  bgCard: "#111111",
  bgPanel: "#1E1E1E",
  panel: "rgba(255, 255, 255, 0.05)",
  panel2: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.08)",
  borderGold: "rgba(255, 215, 0, 0.3)",
  borderBlue: "rgba(0, 229, 255, 0.3)",
  text: "#FFFFFF",
  muted: "#A0A0A0",
  faint: "#666666",
  gold: "#FFD700",
  goldDim: "rgba(255, 215, 0, 0.15)",
  goldGlow: "rgba(255, 215, 0, 0.4)",
  blue: "#00E5FF",
  blueDim: "rgba(0, 229, 255, 0.15)",
  blueGlow: "rgba(0, 229, 255, 0.4)",
  amber: "#FFB800",
  amberDim: "rgba(255, 184, 0, 0.12)",
  red: "#FF2A52",
  redDim: "rgba(255, 42, 82, 0.12)",
  purple: "#8B5CF6",
  purpleDim: "rgba(139, 92, 246, 0.12)",
  green: "#22C55E",
  greenDim: "rgba(34, 197, 94, 0.12)",
  pink: "#D4AF37",
  pinkDim: "rgba(212, 175, 55, 0.12)",
  orange: "#FF8C00",
  orangeDim: "rgba(255, 140, 0, 0.12)",
};

export const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&display=swap');
`;

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  EVENT_ORGANIZER: "EVENT_ORGANIZER",
  SCANNER_STAFF: "SCANNER_STAFF",
  CUSTOMER: "CUSTOMER",
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
