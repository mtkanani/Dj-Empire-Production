import React, { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext(null);

const getSessionData = (key, fallback) => {
  try {
    const item = sessionStorage.getItem(`booking_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setSessionData = (key, value) => {
  try {
    if (value === null || value === undefined) {
      sessionStorage.removeItem(`booking_${key}`);
    } else {
      sessionStorage.setItem(`booking_${key}`, JSON.stringify(value));
    }
  } catch {
    // Ignore storage errors
  }
};

export const BookingProvider = ({ children }) => {
  const [event, setEventState] = useState(() => getSessionData('event', null));
  const [selectedTickets, setSelectedTicketsState] = useState(() => getSessionData('selectedTickets', {}));
  const [selectedSeats, setSelectedSeatsState] = useState(() => getSessionData('selectedSeats', []));
  const [reservation, setReservationState] = useState(() => getSessionData('reservation', null));
  const [customerDetails, setCustomerDetailsState] = useState(() =>
    getSessionData('customerDetails', {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: '',
    })
  );
  const [booking, setBookingState] = useState(() => getSessionData('booking', null));
  const [payment, setPaymentState] = useState(() => getSessionData('payment', null));

  const setEvent = useCallback((val) => {
    setEventState(val);
    setSessionData('event', val);
  }, []);

  const setSelectedTickets = useCallback((val) => {
    setSelectedTicketsState((prev) => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      setSessionData('selectedTickets', nextVal);
      return nextVal;
    });
  }, []);

  const setSelectedSeats = useCallback((val) => {
    setSelectedSeatsState((prev) => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      setSessionData('selectedSeats', nextVal);
      return nextVal;
    });
  }, []);

  const setReservation = useCallback((val) => {
    setReservationState(val);
    setSessionData('reservation', val);
  }, []);

  const setCustomerDetails = useCallback((val) => {
    setCustomerDetailsState((prev) => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      setSessionData('customerDetails', nextVal);
      return nextVal;
    });
  }, []);

  const setBooking = useCallback((val) => {
    setBookingState(val);
    setSessionData('booking', val);
  }, []);

  const setPayment = useCallback((val) => {
    setPaymentState(val);
    setSessionData('payment', val);
  }, []);

  const resetBooking = useCallback(() => {
    setEventState(null);
    setSelectedTicketsState({});
    setSelectedSeatsState([]);
    setReservationState(null);
    setCustomerDetailsState({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
    setBookingState(null);
    setPaymentState(null);
    ['event', 'selectedTickets', 'selectedSeats', 'reservation', 'customerDetails', 'booking', 'payment'].forEach((k) =>
      setSessionData(k, null)
    );
  }, []);

  return (
    <BookingContext.Provider
      value={{
        event,
        setEvent,
        selectedTickets,
        setSelectedTickets,
        selectedSeats,
        setSelectedSeats,
        reservation,
        setReservation,
        customerDetails,
        setCustomerDetails,
        booking,
        setBooking,
        payment,
        setPayment,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

