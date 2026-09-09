const money = (value) => parseFloat((Number(value) || 0).toFixed(2));

export const normalizeTicketLines = (items = [], booking = null, selectedTickets = {}) => {
  if (booking?.items?.length) {
    return booking.items.map((item) => {
      const tt = item.ticketType || {};
      return {
        name: tt.name || item.name || 'Ticket',
        quantity: Number(item.quantity) || 1,
        unitPrice: money(item.unitPrice ?? tt.price),
        bookingFee: money(tt.bookingFee),
        platformFee: money(tt.platformFee),
        serviceCharge: money(tt.serviceCharge),
        sectionName: item.section?.name || tt.section?.name || '',
      };
    });
  }

  const fromSelection = Object.values(selectedTickets || {}).map((it) => {
    const tt = it.ticketType || it;
    return {
      name: tt.name || it.name || 'Ticket',
      quantity: Number(it.quantity) || 1,
      unitPrice: money(it.price ?? tt.price),
      bookingFee: money(tt.bookingFee ?? it.bookingFee),
      platformFee: money(tt.platformFee ?? it.platformFee),
      serviceCharge: money(tt.serviceCharge ?? it.serviceCharge),
      sectionName: tt.section?.name || '',
    };
  });

  if (fromSelection.length) return fromSelection;

  return (items || []).map((it) => ({
    name: it.name || it.ticketTypeName || it.ticketType?.name || 'Ticket',
    quantity: Number(it.quantity) || 1,
    unitPrice: money(it.price ?? it.unitPrice ?? it.ticketType?.price),
    bookingFee: money(it.bookingFee ?? it.ticketType?.bookingFee),
    platformFee: money(it.platformFee ?? it.ticketType?.platformFee),
    serviceCharge: money(it.serviceCharge ?? it.ticketType?.serviceCharge),
    sectionName: it.sectionName || it.section?.name || '',
  }));
};

export const quoteOrderPreview = (lines = [], taxSettings = {}, booking = null) => {
  const totalQty = lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  const computedSubtotal = money(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  const hasTicketPlatform = lines.some((line) => Number(line.platformFee) > 0);
  const computedPlatform = money(
    hasTicketPlatform
      ? lines.reduce((sum, line) => sum + line.quantity * (Number(line.platformFee) || 0), 0)
      : totalQty * (Number(taxSettings.platformFee) || 0)
  );
  const computedBookingFee = money(
    lines.reduce((sum, line) => sum + line.quantity * (Number(line.bookingFee) || 0), 0)
  );
  const hasTicketService = lines.some((line) => Number(line.serviceCharge) > 0);
  const computedService = money(
    hasTicketService
      ? lines.reduce((sum, line) => sum + line.quantity * (Number(line.serviceCharge) || 0), 0)
      : Number(taxSettings.serviceFee) || 0
  );
  let gstRate = Number(booking?.gstRate ?? taxSettings.gstRate) || 0;
  const couponDiscount = money(booking?.couponDiscount || booking?.discount || 0);
  const subtotal = booking?.subtotal != null ? money(booking.subtotal) : computedSubtotal;
  const platformFee = booking?.platformFee != null ? money(booking.platformFee) : computedPlatform;
  const bookingFee = booking?.bookingFee != null ? money(booking.bookingFee) : computedBookingFee;
  const serviceCharge =
    booking?.serviceCharge != null ? money(booking.serviceCharge) : computedService;
  const taxable = money(Math.max(0, subtotal - couponDiscount + platformFee + bookingFee + serviceCharge));
  const gstAmount =
    booking?.gstAmount != null || booking?.taxAmount != null
      ? money(booking.gstAmount ?? booking.taxAmount)
      : money(taxable * (gstRate / 100));
  if (!gstRate && taxable > 0 && gstAmount > 0) {
    gstRate = money((gstAmount / taxable) * 100);
  }
  const total =
    booking?.totalAmount != null ? money(booking.totalAmount) : money(taxable + gstAmount);

  return {
    lines,
    totalQty,
    subtotal,
    platformFee,
    bookingFee,
    serviceCharge,
    couponDiscount,
    gstRate,
    gstAmount,
    cgstAmount: money(gstAmount / 2),
    sgstAmount: money(gstAmount / 2),
    total,
  };
};
