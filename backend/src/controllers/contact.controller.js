import { EmailService } from '../services/email.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export class ContactController {
  static submit = asyncHandler(async (req, res) => {
    await EmailService.sendContactFormEmail(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Form saved and email sent successfully',
      data: { sent: true },
    });
  });
}
