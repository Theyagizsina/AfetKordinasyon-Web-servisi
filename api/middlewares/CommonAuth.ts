import { Request, Response, NextFunction } from 'express';
import { UserAuthPayload, AdminAuthPayload } from '../dto';
import { ValidateSignature } from '../utility';


export interface RequestWithUser extends Request {
    user?: UserAuthPayload,
    admin?: AdminAuthPayload,

}

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    console.log(`\x1b[0m \x1b[30m REQUEST HANDLER - \x1b[31m IP: ${req.socket.remoteAddress} \x1b[32m URL: ${req.originalUrl} \x1b[35m HOST: ${req.headers.host} \x1b[37m ORIGIN: ${req.headers.origin} \x1b[0m`)
    const validate = await ValidateSignature(req, res);

    if(validate){
        next()
    }else{
        return res.status(401).json({"err": "user Not Authorized"})
    }
}