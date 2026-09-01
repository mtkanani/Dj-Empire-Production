/**
 * Single Source of Truth Inventory Calculator
 * Formula: Available = Total - Reserved - Sold - Blocked
 */
export function calculateAvailableQuantity(total, reserved = 0, sold = 0, blocked = 0) {
  const available = total - reserved - sold - blocked;
  return Math.max(0, available);
}
