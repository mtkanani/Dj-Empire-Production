import { DeviceRepository } from '../repositories/device.repository.js';
import { GateRepository } from '../repositories/gate.repository.js';
import { AppError } from '../../../utils/AppError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Service for Scanner Device Registration & Management
 */
export class DeviceService {
  static async registerDevice(dto) {
    if (dto.gateId) {
      const gate = await GateRepository.findById(dto.gateId);
      if (!gate) throw new AppError('Specified Gate not found', HTTP_STATUS.NOT_FOUND);
    }

    return DeviceRepository.registerDevice(dto);
  }

  static async getDevicesByEvent(eventId) {
    return DeviceRepository.findByEvent(eventId);
  }

  static async deleteDevice(id) {
    return DeviceRepository.deleteDevice(id);
  }
}
