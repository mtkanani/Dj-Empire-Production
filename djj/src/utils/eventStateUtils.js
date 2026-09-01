import { C } from '../constants/theme.js';

export const EVENT_STATUSES = {
  Draft: 'Draft',
  PendingApproval: 'PendingApproval',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Published: 'Published',
  Unpublished: 'Unpublished',
  Cancelled: 'Cancelled',
  Completed: 'Completed',
  Archived: 'Archived',
};

export const EVENT_STATUS_LABELS = {
  Draft: 'Draft',
  PendingApproval: 'Pending Approval',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Published: 'Published (Live)',
  Unpublished: 'Unpublished',
  Cancelled: 'Cancelled',
  Completed: 'Completed',
  Archived: 'Archived',
};

export const getEventStatusBadgeProps = (status) => {
  switch (status) {
    case EVENT_STATUSES.Published:
      return { label: 'Published (Live)', bg: C.greenDim, color: C.green, border: C.green };
    case EVENT_STATUSES.Approved:
      return { label: 'Approved', bg: C.blueDim, color: C.blue, border: C.blue };
    case EVENT_STATUSES.PendingApproval:
      return { label: 'Pending Approval', bg: C.amberDim, color: C.amber, border: C.amber };
    case EVENT_STATUSES.Draft:
      return { label: 'Draft', bg: C.goldDim, color: C.gold, border: C.gold };
    case EVENT_STATUSES.Unpublished:
      return { label: 'Unpublished', bg: C.purpleDim, color: C.purple, border: C.purple };
    case EVENT_STATUSES.Rejected:
      return { label: 'Rejected', bg: C.redDim, color: C.red, border: C.red };
    case EVENT_STATUSES.Cancelled:
      return { label: 'Cancelled', bg: C.redDim, color: C.red, border: C.red };
    case EVENT_STATUSES.Completed:
      return { label: 'Completed', bg: C.greenDim, color: C.green, border: C.green };
    case EVENT_STATUSES.Archived:
      return { label: 'Archived (Hidden)', bg: 'rgba(255, 255, 255, 0.05)', color: C.muted, border: C.border };
    default:
      return { label: status || 'Draft', bg: C.goldDim, color: C.gold, border: C.gold };
  }
};

/**
 * Returns allowed FSM actions for an event based on current status and backend rules.
 */
export const getAvailableEventActions = (event) => {
  if (!event) return [];
  const status = event.status || 'Draft';
  const actions = [];

  switch (status) {
    case EVENT_STATUSES.Draft:
      actions.push({ key: 'edit', label: 'Edit Event', action: 'edit' });
      actions.push({ key: 'preview', label: 'Preview', action: 'preview' });
      actions.push({ key: 'submit-approval', label: 'Submit for Approval', action: 'submit-approval', primary: true });
      actions.push({ key: 'publish', label: 'Publish Live', action: 'publish' });
      actions.push({ key: 'archive', label: 'Archive', action: 'archive' });
      actions.push({ key: 'delete', label: 'Delete', action: 'delete', danger: true });
      break;

    case EVENT_STATUSES.PendingApproval:
      actions.push({ key: 'view', label: 'View Details', action: 'view' });
      actions.push({ key: 'preview', label: 'Preview', action: 'preview' });
      actions.push({ key: 'archive', label: 'Archive', action: 'archive' });
      actions.push({ key: 'delete', label: 'Delete', action: 'delete', danger: true });
      break;

    case EVENT_STATUSES.Approved:
      actions.push({ key: 'publish', label: 'Publish Live', action: 'publish', primary: true });
      actions.push({ key: 'edit', label: 'Edit Event', action: 'edit' });
      actions.push({ key: 'preview', label: 'Preview', action: 'preview' });
      actions.push({ key: 'archive', label: 'Archive', action: 'archive' });
      actions.push({ key: 'delete', label: 'Delete', action: 'delete', danger: true });
      break;

    case EVENT_STATUSES.Rejected:
      actions.push({ key: 'edit', label: 'Edit & Fix', action: 'edit', primary: true });
      actions.push({ key: 'preview', label: 'Preview', action: 'preview' });
      actions.push({ key: 'submit-approval', label: 'Resubmit for Approval', action: 'submit-approval' });
      actions.push({ key: 'archive', label: 'Archive', action: 'archive' });
      actions.push({ key: 'delete', label: 'Delete', action: 'delete', danger: true });
      break;

    case EVENT_STATUSES.Published:
      actions.push({ key: 'view', label: 'View Details', action: 'view' });
      actions.push({ key: 'preview', label: 'Preview', action: 'preview' });
      actions.push({ key: 'unpublish', label: 'Unpublish', action: 'unpublish' });
      actions.push({ key: 'cancel', label: 'Cancel Event', action: 'cancel', danger: true });
      actions.push({ key: 'archive', label: 'Archive', action: 'archive' });
      actions.push({ key: 'delete', label: 'Delete', action: 'delete', danger: true });
      break;

    case EVENT_STATUSES.Unpublished:
      actions.push({ key: 'publish', label: 'Publish Live', action: 'publish', primary: true });
      actions.push({ key: 'edit', label: 'Edit Event', action: 'edit' });
      actions.push({ key: 'preview', label: 'Preview', action: 'preview' });
      actions.push({ key: 'archive', label: 'Archive', action: 'archive' });
      actions.push({ key: 'delete', label: 'Delete', action: 'delete', danger: true });
      break;

    case EVENT_STATUSES.Cancelled:
    case EVENT_STATUSES.Completed:
      actions.push({ key: 'view', label: 'View Details', action: 'view' });
      actions.push({ key: 'preview', label: 'Preview', action: 'preview' });
      actions.push({ key: 'archive', label: 'Archive', action: 'archive' });
      actions.push({ key: 'delete', label: 'Delete', action: 'delete', danger: true });
      break;

    case EVENT_STATUSES.Archived:
      actions.push({ key: 'view', label: 'View Details', action: 'view' });
      actions.push({ key: 'delete', label: 'Delete', action: 'delete', danger: true });
      break;

    default:
      actions.push({ key: 'view', label: 'View Details', action: 'view' });
      actions.push({ key: 'delete', label: 'Delete', action: 'delete', danger: true });
      break;
  }

  return actions;
};
