import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.js';

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
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Local',
      },
      {
        url: 'https://dj-empire-production.onrender.com/api/v1',
        description: 'Render',
      },
    ],
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
