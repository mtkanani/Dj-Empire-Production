export const formatCurrency = (amount, currency = 'INR') => {
  const num = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};

export const fmtINR = (n) => formatCurrency(n, 'INR');

export const fmtPct = (n) => Math.round(n) + "%";

export const uid = (p = "id") => p + "_" + Math.random().toString(36).slice(2, 9);

export const nowStr = () =>
  new Date().toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatTimeLabel = (timeStr) => {
  if (!timeStr) return "";
  const raw = String(timeStr).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return raw;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

