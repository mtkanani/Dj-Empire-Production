import { useState, useEffect } from 'react';
import { getSocket, joinSectionRoom, leaveSectionRoom } from '../services/socket/socketClient.js';

/**
 * Custom React Hook for Real-Time Seat Map Grid Synchronization
 */
export const useSeatRealtime = (sectionId, initialSeats = []) => {
  const [seats, setSeats] = useState(initialSeats);

  useEffect(() => {
    setSeats(initialSeats);
  }, [initialSeats]);

  useEffect(() => {
    if (!sectionId) return;

    const socket = getSocket();
    joinSectionRoom(sectionId);

    const updateSingleSeatState = (updatedSeat) => {
      setSeats((prevSeats) =>
        prevSeats.map((s) => {
          if (s.id === updatedSeat.id || (s.row === updatedSeat.row && s.seatNumber === updatedSeat.seatNumber)) {
            return {
              ...s,
              status: updatedSeat.status,
              isBooked: updatedSeat.status === 'SOLD',
              isBlocked: updatedSeat.status === 'BLOCKED',
              heldUntil: updatedSeat.heldUntil || null,
            };
          }
          return s;
        })
      );
    };

    const handleSeatHeld = (data) => {
      if (data.sectionId === sectionId && data.seat) {
        updateSingleSeatState(data.seat);
      }
    };

    const handleSeatReleased = (data) => {
      if (data.sectionId === sectionId && data.seat) {
        updateSingleSeatState(data.seat);
      }
    };

    const handleSeatSold = (data) => {
      if (data.sectionId === sectionId && data.seat) {
        updateSingleSeatState(data.seat);
      }
    };

    const handleSeatBlocked = (data) => {
      if (data.sectionId === sectionId && data.seat) {
        updateSingleSeatState(data.seat);
      }
    };

    socket.on('seat:held', handleSeatHeld);
    socket.on('seat:released', handleSeatReleased);
    socket.on('seat:sold', handleSeatSold);
    socket.on('seat:blocked', handleSeatBlocked);

    return () => {
      socket.off('seat:held', handleSeatHeld);
      socket.off('seat:released', handleSeatReleased);
      socket.off('seat:sold', handleSeatSold);
      socket.off('seat:blocked', handleSeatBlocked);
      leaveSectionRoom(sectionId);
    };
  }, [sectionId]);

  return { seats, setSeats };
};
