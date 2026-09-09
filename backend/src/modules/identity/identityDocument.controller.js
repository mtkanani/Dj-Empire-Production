import { IdentityDocumentService } from './identityDocument.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class IdentityDocumentController {
  static upload = asyncHandler(async (req, res) => {
    const data = await IdentityDocumentService.uploadForUser(req.user.userId, req.file);
    return ApiResponse.success(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Identity document uploaded',
      data,
    });
  });

  static download = asyncHandler(async (req, res) => {
    const { buffer, mimeType } = await IdentityDocumentService.authorizeRead(
      req.params.documentId,
      req.user
    );
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(HTTP_STATUS.OK).end(buffer);
  });
}
