import express, {Request, Response, NextFunction} from 'express';
import { CreateCampaign, GetCampaigns, GetCampaignById, GetCampaignByUrl, UpdateCampaign, LandingCampaigns, RenderMail } from '../controllers';
import { Authenticate } from '../middlewares';
import { checkAlarms } from '../services/alarmService';

const router = express.Router();

router.get('/landing', LandingCampaigns)
router.get('/special', GetCampaigns)
router.get('/render/:name', RenderMail)

router.get("/alarms/deneme", checkAlarms)

router.use(Authenticate)


//** ------------------ Platform Campaigns ---------------------- **/
router.post('/details', GetCampaignByUrl )
//** ------------------ Get All Campaigns ---------------------- **/
router.get('/', GetCampaigns)
//** ------------------ Get Campaigns by Id ---------------------- **/
router.get('/:id', GetCampaignById)


//** ------------------ Create ---------------------- **/

//** ------------------ Platform Campaigns ---------------------- **/
// router.post('/details/currentInvestment', GetCurrentInvestmentByUrl )

export {router as CampaignRoute};