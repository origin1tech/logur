import { IMiddlewareOptions, IMiddlewareTokens, ILevels, IMetadata } from './interfaces';
import { Request, Response, NextFunction } from 'express';
export declare function init(options?: IMiddlewareOptions): {
    findLevelBySeverity: (levels: ILevels, severity: number) => string;
    parseTokens: (tokens: IMiddlewareTokens, req: Request, res: Response) => IMetadata;
    handler: (req: Request, res: Response, next: NextFunction) => void;
};
