/**
 * Build persisted SeatMap rows for a GRID section.
 * Matches the organizer canvas layout (10 seats/row up to 100 capacity, else 15).
 */
export const buildSeatRecords = (capacity) => {
  const total = Math.max(0, parseInt(capacity, 10) || 0);
  if (total <= 0) return [];

  const seatsPerRow = total <= 100 ? 10 : 15;
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const seats = [];
  let seatCounter = 0;
  const numRows = Math.ceil(total / seatsPerRow);

  for (let r = 0; r < numRows; r++) {
    const rowName = rowLabels[r] || `R${r + 1}`;
    for (let c = 1; c <= seatsPerRow; c++) {
      seatCounter += 1;
      if (seatCounter > total) break;
      seats.push({
        row: rowName,
        column: c,
        seatNumber: `${rowName}${c}`,
        seatType: 'REGULAR',
        status: 'AVAILABLE',
        isBooked: false,
        isBlocked: false,
      });
    }
  }

  return seats;
};

export const isStandingLayout = (layoutType = '', sectionName = '') => {
  const layout = String(layoutType || '').toUpperCase();
  const nameLower = String(sectionName || '').toLowerCase();
  return (
    layout === 'GROUND_BOX' ||
    layout === 'STANDING' ||
    nameLower.includes('standing') ||
    nameLower.includes('pit') ||
    nameLower.includes('lawn')
  );
};
