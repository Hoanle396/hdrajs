import { JsonObject } from 'swagger-ui-express';
import { createApp } from '../core';
import './src/users/user.controller';
import './src/users/user.service';
import { HttpExceptionFilter } from './src/filters/http-exception.filter';

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
    notFoundHandler: (req, res) => res.status(404).json({ message: 'Not Found' }),
    exception: HttpExceptionFilter
});

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
})