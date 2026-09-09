import { api } from '../api.js';

export const identityDocumentService = {
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/identity-documents', form);
  },
  downloadUrl: (documentId) => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    return `${base}/identity-documents/${documentId}`;
  },
};
