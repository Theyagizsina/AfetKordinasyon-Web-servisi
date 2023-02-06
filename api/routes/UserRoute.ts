import express, {Request, Response, NextFunction} from 'express';
import { GetUserProfile, CreateUser, UserLogin, SaveAlarm, DeleteAlarm, GetAlarm, Follow, Invest, UpdateUserClient } from '../controllers/UserController';
import { Authenticate } from '../middlewares';


const router = express.Router();


router.post('/register', CreateUser);
router.post('/login', UserLogin);


router.use(Authenticate)
router.get('/profile', GetUserProfile)
router.post('/update', UpdateUserClient)
router.post('/alarm/save', SaveAlarm)
router.post('/alarm/delete', DeleteAlarm)
router.post('/follow', Follow)
router.post('/invest', Invest)
router.get('/alarm/get/:id', GetAlarm)


router.get('/', (req: Request, res: Response, next: NextFunction) => {


    res.json({message: 'hello from admin route'})

})




export {router as UserRoute};