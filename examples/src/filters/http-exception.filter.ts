import { Response } from 'express';
import { ExceptionFilter, HttpException } from '../../../decorators';

export const HttpExceptionFilter: ExceptionFilter = (error: Error | HttpException, res: Response) => {
    if ('status' in error) {
        res.status(error.status).json({
            statusCode: error.status,
            message: error.message,
            code: (error as HttpException).code
        });
    } else {
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
};