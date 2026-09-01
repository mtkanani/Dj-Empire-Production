import { PaymentRepository } from '../repositories/payment.repository.js';

/**
 * Organizer Settlement Payout Service
 */
export class SettlementService {
  static async getOrganizerSettlements(organizerId) {
    return PaymentRepository.findSettlementsByOrganizer(organizerId);
  }
}
