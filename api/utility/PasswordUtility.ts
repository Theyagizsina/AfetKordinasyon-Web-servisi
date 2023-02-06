import {Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { APP_SECRET } from '../config';
import { UserAuthPayload, AdminAuthPayload } from '../dto/Auth.dto';

import { RequestWithUser } from '../middlewares';



export const GenerateSalt = async () => {
    return await bcrypt.genSalt()
}


export const GeneratePassword = async (password: string, salt: string) =>{
    return await bcrypt.hash(password, salt);
    
}

export const ValidatePassword = async (enteredPassword: string, savedPassword: string, salt: string) => {

    return await GeneratePassword(enteredPassword, salt) === savedPassword;
    
}

export const GenerateSignature = (payload: UserAuthPayload) => {

    return jwt.sign(payload,APP_SECRET, { expiresIn: '1d'} )

}

export const GenerateAdminSignature = (payload: AdminAuthPayload) => {

    return jwt.sign(payload,APP_SECRET, { expiresIn: '1d'} )
}

export const isTokenExpired = (signature: string) => {

    const token = signature;

    if(token){
        
        const splitedSignature = token.split(' ')[1]
        const tokenCheck = jwt.verify(splitedSignature , APP_SECRET, (err, result) => {
            if(err){
                return false;
            }else{
                return true;
            }
        });
        return tokenCheck;
    }else{
        return false;
    }


}

export const ValidateSignature  = async(req: RequestWithUser, res: Response) => {

    const signature = req.get('Authorization');
    if(signature){
        
        const isExpired = await isTokenExpired(signature);

        if(isExpired === false){
            console.log("EXPIRED")
            return false;
        }else{
    
            const splitedSignature = signature.split(' ')[1]
            const Signature = await jwt.verify(splitedSignature, APP_SECRET)
            const userPayload = Signature as UserAuthPayload; 
            const adminPayload = Signature as AdminAuthPayload; 
            req.user = userPayload;
            req.admin = adminPayload;
            return true;
        }

            
    }
    return false;
};