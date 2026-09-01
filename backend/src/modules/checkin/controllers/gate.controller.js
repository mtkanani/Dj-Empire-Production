import { GateRepository } from '../repositories/gate.repository.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { AppError } from '../../../utils/AppError.js';

/**
 * Controller handling Access Control Gate CRUD
 */
export class GateController {
  static createGate = asyncHandler(async (req, res) => {
    const data = await GateRepository.createGate(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Access control gate created successfully',
      data,
    });
  });

  static getGates = asyncHandler(async (req, res) => {
    const { eventId } = req.query;
    if (!eventId) {
      throw new AppError('eventId query parameter is required', HTTP_STATUS.BAD_REQUEST);
    }
    const data = await GateRepository.findByEvent(eventId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Event gates retrieved',
      data,
    });
  });

  static updateGate = asyncHandler(async (req, res) => {
    const data = await GateRepository.updateGate(req.params.gateId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Gate details updated',
      data,
    });
  });

  static deleteGate = asyncHandler(async (req, res) => {
    await GateRepository.deleteGate(req.params.gateId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Gate deleted',
    });
  });
}
