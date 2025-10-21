import { Request, Response } from 'express';

export const contentType = (req: Request, res:Response, next): void => {
    res.type('json');
    next();
} 