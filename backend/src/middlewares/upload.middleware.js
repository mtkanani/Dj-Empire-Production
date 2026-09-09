import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: env.IDENTITY_DOC_MAX_BYTES || 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const mime = String(file.mimetype || '').toLowerCase();
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(mime)) {
      return cb(new AppError('Identity document must be a JPEG, PNG, or WebP image', HTTP_STATUS.BAD_REQUEST));
    }
    cb(null, true);
  },
});

export const identityDocumentUpload = upload.single('file');
