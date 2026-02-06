import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './auth.middleware';
import { AppError } from './error.middleware';

// Mock config/env
jest.mock('../config/env', () => ({
    env: {
        API_KEY: 'test-api-key',
    },
}));

describe('AuthMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            json: jest.fn(),
            status: jest.fn(),
        };
        nextFunction = jest.fn();
    });

    it('should call next if API key is valid', () => {
        mockRequest.headers = {
            'x-api-key': 'test-api-key',
        };

        authMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should throw Unauthorized error if API key is missing', () => {
        authMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
        const error = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Unauthorized: Invalid API Key');
    });

    it('should throw Unauthorized error if API key is invalid', () => {
        mockRequest.headers = {
            'x-api-key': 'wrong-api-key',
        };

        authMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
        const error = (nextFunction as jest.Mock).mock.calls[0][0] as AppError;
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Unauthorized: Invalid API Key');
    });
});
