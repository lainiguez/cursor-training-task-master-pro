import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from './error.middleware';

describe('ErrorMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        mockRequest = {};
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock })) as unknown as jest.Mock;
        mockResponse = {
            status: statusMock,
        };
        nextFunction = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle AppError correctly', () => {
        const error = new AppError('Custom Error', 400);

        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            message: 'Custom Error',
        });
    });

    it('should handle generic Error correctly as 500', () => {
        const error = new Error('Unexpected Error');

        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            message: 'Internal Server Error',
        });
        expect(console.error).toHaveBeenCalled();
    });
});
