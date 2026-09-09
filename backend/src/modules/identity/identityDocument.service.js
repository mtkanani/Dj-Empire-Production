import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { ObjectStorageService } from '../../services/storage/objectStorage.service.js';
import { sniffImageMime, ALLOWED_IDENTITY_MIME_TYPES } from '../../utils/imageMagic.util.js';
import { AppError } from '../../utils/AppError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { Role } from '@prisma/client';

export class IdentityDocumentService {
  static async uploadForUser(userId, file) {
    if (!file?.buffer) {
      throw new AppError('Identity document image is required', HTTP_STATUS.BAD_REQUEST);
    }
    if (file.buffer.length > (env.IDENTITY_DOC_MAX_BYTES || 5 * 1024 * 1024)) {
      throw new AppError('Identity document exceeds the maximum file size of 5 MB', HTTP_STATUS.BAD_REQUEST);
    }

    const mimeType = sniffImageMime(file.buffer);
    if (!mimeType || !ALLOWED_IDENTITY_MIME_TYPES.includes(mimeType)) {
      throw new AppError('Identity document must be a JPEG, PNG, or WebP image', HTTP_STATUS.BAD_REQUEST);
    }

    const { objectKey } = await ObjectStorageService.putObject({
      userId,
      body: file.buffer,
      contentType: mimeType,
    });

    const doc = await prisma.identityDocument.create({
      data: {
        objectKey,
        uploadedByUserId: userId,
        mimeType,
        sizeBytes: file.buffer.length,
        consumed: false,
      },
    });

    return {
      id: doc.id,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      createdAt: doc.createdAt,
    };
  }

  static async assertOwnedUnconsumed(documentId, userId) {
    const doc = await prisma.identityDocument.findUnique({ where: { id: documentId } });
    if (!doc) {
      throw new AppError('Identity document not found', HTTP_STATUS.NOT_FOUND);
    }
    if (doc.uploadedByUserId !== userId) {
      throw new AppError('Identity document does not belong to your account', HTTP_STATUS.FORBIDDEN);
    }
    if (doc.consumed) {
      throw new AppError('Identity document has already been used on another booking', HTTP_STATUS.BAD_REQUEST);
    }
    return doc;
  }

  static async consumeMany(documentIds, tx = prisma) {
    if (!documentIds.length) return;
    await tx.identityDocument.updateMany({
      where: { id: { in: documentIds } },
      data: { consumed: true, consumedAt: new Date() },
    });
  }

  static async authorizeRead(documentId, user) {
    const doc = await prisma.identityDocument.findUnique({
      where: { id: documentId },
      include: {
        attendees: {
          include: {
            booking: {
              select: {
                id: true,
                customerId: true,
                event: { select: { organizerId: true } },
              },
            },
          },
        },
      },
    });
    if (!doc) {
      throw new AppError('Identity document not found', HTTP_STATUS.NOT_FOUND);
    }

    const isSuperAdmin = user.role === Role.SUPER_ADMIN;
    const isUploader = doc.uploadedByUserId === user.userId;
    const isOrganizer = doc.attendees.some((a) => a.booking?.event?.organizerId === user.userId);

    if (!isSuperAdmin && !isOrganizer) {
      throw new AppError('You are not authorised to view this identity document', HTTP_STATUS.FORBIDDEN);
    }

    // Uploader (the customer) is never given the image back — only staff.
    void isUploader;

    const buffer = await ObjectStorageService.getObjectBuffer(doc.objectKey);
    return { buffer, mimeType: doc.mimeType };
  }
}
