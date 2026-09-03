import { env } from './env.js';

export const API_PREFIX = `/api/${env.API_VERSION}`;

export const API_PUBLIC_ORIGIN =
  env.API_PUBLIC_URL || `http://localhost:${env.PORT}`;

export const API_BASE_URL = `${API_PUBLIC_ORIGIN}${API_PREFIX}`;

export const LOCAL_API_BASE_URL = `http://localhost:${env.PORT}${API_PREFIX}`;
