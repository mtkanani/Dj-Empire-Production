import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.js';
import { API_BASE_URL, LOCAL_API_BASE_URL } from './api.js';

const servers = [
  {
    url: API_BASE_URL,
    description: env.API_PUBLIC_URL ? 'Public API' : 'Local API',
  },
];

if (API_BASE_URL !== LOCAL_API_BASE_URL) {
  servers.push({
    url: LOCAL_API_BASE_URL,
    description: 'Local API',
  });
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${env.APP_NAME} API`,
      version: '1.0.0',
      description: 'Production-ready REST API foundation for Event Booking Platform',
      contact: {
        name: 'Backend Architecture Team',
      },
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.js', './src/swagger/**/*.js'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
