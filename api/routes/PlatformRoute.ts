import express, {Request, Response, NextFunction} from 'express';
import { CreatePlatform, GetPlatforms, GetPlatform } from '../controllers';
import { Authenticate } from '../middlewares';



const router = express.Router();

router.get('/', GetPlatforms)
router.get('/:platform', GetPlatform)

router.use(Authenticate)

router.post('/create', CreatePlatform)







export {router as PlatformRoute};