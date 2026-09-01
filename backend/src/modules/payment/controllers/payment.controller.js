import { PaymentService } from '../services/payment.service.js';
import { WebhookService } from '../services/webhook.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

/**
 * Controller handling Core Payment Endpoints
 */
export class PaymentController {
  static createPaymentOrder = asyncHandler(async (req, res) => {
    const data = await PaymentService.createPaymentOrder(req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Payment order created successfully',
      data,
    });
  });

  static verifyPayment = asyncHandler(async (req, res) => {
    const result = await PaymentService.verifyPayment(req.body);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result.payment,
    });
  });

  static getPaymentById = asyncHandler(async (req, res) => {
    const data = await PaymentService.getPaymentDetails(req.params.paymentId);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Payment transaction details retrieved',
      data,
    });
  });

  static getOrganizerPayments = asyncHandler(async (req, res) => {
    const result = await PaymentService.getOrganizerPayments(req.user.userId, req.query);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Organizer event payments retrieved',
      data: result.data,
      meta: result.meta,
    });
  });

  // Gateway Webhooks
  static handleRazorpayWebhook = asyncHandler(async (req, res) => {
    const result = await WebhookService.handleWebhook('RAZORPAY', req.body, req.headers);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Razorpay webhook received',
      data: result,
    });
  });

  static handlePayPalWebhook = asyncHandler(async (req, res) => {
    const result = await WebhookService.handleWebhook('PAYPAL', req.body, req.headers);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'PayPal webhook received',
      data: result,
    });
  });
}
