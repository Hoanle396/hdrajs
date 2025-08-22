import { JsonObject } from 'swagger-ui-express';
import { CorsMiddleware, createApp, LoggerMiddleware, ValidationPipe } from '..';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './src/filters/http-exception.filter';

const swaggerDoc: JsonObject = {
    openapi: '3.0.0',
    info: {
        title: 'HDRA.js API',
        version: '1.0.0',
        description: 'API documentation for HDRA.js framework with enhanced features'
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

const app = createApp(
    AppModule,
    {
        globalPrefix: '/api',
        swagger: {
            document: swaggerDoc,
            path: '/api-docs'
        },
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:4200'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        },
        middleware: [
            LoggerMiddleware.create(),
            CorsMiddleware.create({
                origin: true,
                credentials: true
            })
        ],
        globalPipes: [ValidationPipe],
        bodyParser: {
            json: { limit: '10mb' },
            urlencoded: { extended: true, limit: '10mb' }
        },
        staticAssets: [
            {
                path: './public',
                options: { maxAge: '1d' }
            }
        ],
        notFoundHandler: (req, res) => {
            res.status(404).json({ 
                statusCode: 404,
                message: 'Route not found',
                path: req.path,
                timestamp: new Date().toISOString()
            });
        },
        exception: HttpExceptionFilter
    });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 HDRA.js server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🔧 Framework version: 1.0.0 (Enhanced)`);
    console.log(`✨ Features enabled: DI, Validation, Middleware, Interceptors`);
});