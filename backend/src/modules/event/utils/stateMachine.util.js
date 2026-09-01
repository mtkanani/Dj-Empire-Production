import { EventStatus } from '@prisma/client';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Valid Finite State Machine Transitions for Event Lifecycle
 */
const ALLOWED_TRANSITIONS = {
  [EventStatus.Draft]: [EventStatus.PendingApproval, EventStatus.Archived],
  [EventStatus.PendingApproval]: [EventStatus.Approved, EventStatus.Rejected, EventStatus.Draft],
  [EventStatus.Approved]: [EventStatus.Published, EventStatus.Draft, EventStatus.Archived],
  [EventStatus.Rejected]: [EventStatus.Draft, EventStatus.Archived],
  [EventStatus.Published]: [EventStatus.Unpublished, EventStatus.Cancelled, EventStatus.Completed, EventStatus.Archived],
  [EventStatus.Unpublished]: [EventStatus.Published, EventStatus.Archived],
  [EventStatus.Cancelled]: [EventStatus.Archived],
  [EventStatus.Completed]: [EventStatus.Archived],
  [EventStatus.Archived]: [], // Terminal state
};

/**
 * Validates state transition according to finite state machine rules
 * @param {string} currentStatus
 * @param {string} nextStatus
 */
export function validateStateTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return true; // Idempotent status update
  }

  const allowedNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNextStates.includes(nextStatus)) {
    throw new AppError(
      `Invalid event state transition from [${currentStatus}] to [${nextStatus}]. Allowed transitions: [${allowedNextStates.join(', ') || 'None (Terminal state)'}]`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  return true;
}
