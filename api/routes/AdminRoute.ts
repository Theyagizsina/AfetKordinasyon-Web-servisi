import express, { Request, Response, NextFunction } from 'express';
import { GetUsers, GetUserByID, CreateAdmin, AdminLogin, DeleteCampaign, DeleteUser, UpdateUser, UpdateCampaign, CreateCampaign, UpdatePlatform, GetMail, UpdateMail} from '../controllers/AdminController';
import { Authenticate } from '../middlewares';


const router = express.Router();

router.post('/login', AdminLogin);
router.post('/create', CreateAdmin)

router.use(Authenticate)

router.get('/mail', GetMail)
router.get('/users', GetUsers)
router.get('/user/:id', GetUserByID)

router.get('/delete/campaign/:id', DeleteCampaign)
router.get('/delete/user/:id', DeleteUser)

router.post('/user/update', UpdateUser)

router.post('/campaign/add', CreateCampaign)
router.post('/campaign/update/:id', UpdateCampaign)
router.post('/platform/update/', UpdatePlatform)
router.post('/mail/update/', UpdateMail)

router.get('/', (req: Request, res: Response, next: NextFunction) => {


    res.json({ message: 'hello from admin route' })

})




export { router as AdminRoute };