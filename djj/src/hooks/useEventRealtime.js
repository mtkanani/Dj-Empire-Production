import { useState, useEffect } from 'react';
import { getSocket, joinEventRoom, leaveEventRoom } from '../services/socket/socketClient.js';

/**
 * Custom React Hook for Real-Time Event Availability & Inventory Synchronisation
 */
export const useEventRealtime = (eventId, initialInventory = null) => {
  const [liveInventory, setLiveInventory] = useState(initialInventory);

  useEffect(() => {
    if (!eventId) return;

    const socket = getSocket();
    joinEventRoom(eventId);

    const handleEventAvailabilityUpdated = (data) => {
      if (data.eventId === eventId && data.availability) {
        setLiveInventory(data.availability);
      }
    };

    const handleInventoryUpdated = (data) => {
      if (data.eventId === eventId && data.inventory) {
        setLiveInventory(data.inventory);
      }
    };

    socket.on('event:availability_updated', handleEventAvailabilityUpdated);
    socket.on('inventory:updated', handleInventoryUpdated);

    // Reconnection handling: fetch fresh inventory on socket reconnect
    const handleConnect = () => {
      joinEventRoom(eventId);
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('event:availability_updated', handleEventAvailabilityUpdated);
      socket.off('inventory:updated', handleInventoryUpdated);
      socket.off('connect', handleConnect);
      leaveEventRoom(eventId);
    };
  }, [eventId]);

  return { liveInventory, setLiveInventory };
};
