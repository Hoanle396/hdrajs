import { JsonObject } from 'swagger-ui-express';
import { createApp } from './core';
import './user.controller';
import './user.service';

const swaggerDoc: JsonObject = {
    openapi: '3.0.0',
    info: {
        title: 'HRA.js API',
        version: '1.0.0',
        description: 'API documentation for HRA.js framework'
    },
    paths: {},
    components: {
        schemas: {},
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
};

const app = createApp({
    swagger: {
        document: swaggerDoc,
        path: '/api-docs'
    },
    notFoundHandler: (req, res) => res.status(404).json({ message: 'Not Found' })
});

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
})