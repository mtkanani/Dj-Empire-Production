import { C } from '../constants/theme.js';

export const SEAT_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  HELD: 'HELD',
  SOLD: 'SOLD',
  RESERVED: 'RESERVED',
  BLOCKED: 'BLOCKED',
};

export const DEFAULT_SECTION_COLORS = [
  '#3B82F6', // Blue
  '#EAB308', // Gold
  '#10B981', // Green
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#06B6D4', // Cyan
];

export const getSeatStatusBadgeProps = (status) => {
  switch (status) {
    case SEAT_STATUSES.AVAILABLE:
      return { label: 'Available', bg: C.blueDim, color: C.blue, border: C.blue };
    case SEAT_STATUSES.HELD:
      return { label: 'Held', bg: C.amberDim, color: C.amber, border: C.amber };
    case SEAT_STATUSES.SOLD:
      return { label: 'Sold', bg: C.greenDim, color: C.green, border: C.green };
    case SEAT_STATUSES.RESERVED:
      return { label: 'Reserved', bg: C.amberDim, color: C.amber, border: C.amber };
    case SEAT_STATUSES.BLOCKED:
      return { label: 'Blocked', bg: C.redDim, color: C.red, border: C.red };
    default:
      return { label: status || 'Available', bg: C.blueDim, color: C.blue, border: C.blue };
  }
};

/**
 * Dynamically generates a seat grid layout array based on section capacity
 * E.g. capacity = 50 -> 5 rows (A-E), 10 seats per row (A1-A10, B1-B10...)
 */
export const generateSeatGridForSection = (section, soldSeats = 0, reservedSeats = 0) => {
  if (!section || !section.capacity || section.capacity <= 0) {
    return [];
  }

  const capacity = section.capacity;
  const seatsPerRow = capacity <= 30 ? 10 : capacity <= 100 ? 10 : 15;
  const numRows = Math.ceil(capacity / seatsPerRow);

  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

  const grid = [];
  let seatCounter = 0;
  let soldCount = 0;
  let reservedCount = 0;

  for (let r = 0; r < numRows; r++) {
    const rowName = rowLabels[r] || `R${r + 1}`;
    const rowSeats = [];

    for (let c = 1; c <= seatsPerRow; c++) {
      seatCounter++;
      if (seatCounter > capacity) break;

      let status = SEAT_STATUSES.AVAILABLE;

      // Deterministic simulation of sold/reserved seats matching section stats
      if (soldCount < (section.soldCapacity || soldSeats)) {
        status = SEAT_STATUSES.SOLD;
        soldCount++;
      } else if (reservedCount < (section.reservedCapacity || reservedSeats)) {
        status = SEAT_STATUSES.RESERVED;
        reservedCount++;
      }

      rowSeats.push({
        id: `${section.id || 'sec'}-${rowName}-${c}`,
        sectionId: section.id,
        sectionName: section.name,
        sectionColor: section.color || '#3B82F6',
        row: rowName,
        column: c,
        seatNumber: `${rowName}${c}`,
        seatLabel: `${section.name} — ${rowName}${c}`,
        status,
      });
    }

    grid.push({
      rowName,
      seats: rowSeats,
    });
  }

  return grid;
};

export const groupPersistedSeatsByRow = (seats = []) => {
  const rowMap = {};
  seats.forEach((seat) => {
    const rowName = seat.row || 'A';
    if (!rowMap[rowName]) rowMap[rowName] = [];
    rowMap[rowName].push({
      ...seat,
      seatLabel: seat.seatNumber || `${rowName}${seat.column}`,
      column: seat.column,
      status: seat.status || SEAT_STATUSES.AVAILABLE,
    });
  });

  return Object.keys(rowMap)
    .sort()
    .map((rowName) => ({
      rowName,
      seats: rowMap[rowName].sort((a, b) => (a.column || 0) - (b.column || 0)),
    }));
};

export const calculateOccupancyPercentage = (sold, total) => {
  if (!total || total <= 0) return 0;
  return parseFloat(((sold / total) * 100).toFixed(1));
};
