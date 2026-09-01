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
  purple: "#9B7653",
  purpleDim: "rgba(155, 118, 83, 0.12)",
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

export const fmtINR = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN");
export const fmtPct = (n) => Math.round(n) + "%";
export const uid = (p = "id") => p + "_" + Math.random().toString(36).slice(2, 9);
export const nowStr = () => new Date().toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });

export const initialEvents = [
  { 
    id: "evt_001", 
    name: "Tech Summit 2026", 
    date: "2026-03-15", 
    venue: "Convention Center", 
    capacity: 5000, 
    status: "Approved",
    categories: [
      { id: "cat_001", name: "General", price: 2999, seats: 2000 },
      { id: "cat_002", name: "VIP", price: 4999, seats: 500 },
      { id: "cat_003", name: "Premium", price: 7999, seats: 200 }
    ]
  },
  { 
    id: "evt_002", 
    name: "Music Festival", 
    date: "2026-04-20", 
    venue: "City Arena", 
    capacity: 15000, 
    status: "Approved",
    categories: [
      { id: "cat_004", name: "General", price: 1499, seats: 8000 },
      { id: "cat_005", name: "VIP", price: 2999, seats: 2000 },
      { id: "cat_006", name: "Backstage", price: 5999, seats: 200 }
    ]
  },
  { 
    id: "evt_003", 
    name: "Startup Expo", 
    date: "2026-05-10", 
    venue: "Exhibition Hall", 
    capacity: 3000, 
    status: "Pending",
    categories: [
      { id: "cat_007", name: "General", price: 999, seats: 1500 },
      { id: "cat_008", name: "Premium", price: 1999, seats: 500 }
    ]
  },
];

export const initialClients = [
  { id: "cli_001", name: "Acme Corp", revenue: 450000, commission: 15, events: 3, status: "Active" },
  { id: "cli_002", name: "Beta Ltd", revenue: 320000, commission: 12, events: 2, status: "Active" },
  { id: "cli_003", name: "Gamma Inc", revenue: 580000, commission: 18, events: 5, status: "Active" },
];
