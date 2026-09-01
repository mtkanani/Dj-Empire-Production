import { InvoiceService } from '../services/invoice.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Tax Invoices
 */
export class InvoiceController {
  static getInvoice = asyncHandler(async (req, res) => {
    const data = await InvoiceService.getInvoice(req.params.bookingId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Tax invoice details retrieved',
      data,
    });
  });
}
