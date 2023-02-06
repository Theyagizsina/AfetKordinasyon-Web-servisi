import { Request, Response, NextFunction } from 'express';
import { CreatePlatformInput } from '../dto';
import { Campaign, Platform } from '../models';
import { GetCampaigns } from './CampaignController';

export const FindPlatform = async (id: string | undefined, platformName?: string) => {

    if (platformName) {
        const platform = Platform.findOne({ platformName: platformName })
        return platform
    } else {
        return await Platform.findById(id)
    }
}

export const CreatePlatform = async (req: Request, res: Response, next: NextFunction) => {

    const { platformName, platformUrl } = <CreatePlatformInput>req.body;
    const body = <CreatePlatformInput>req.body;

    if (Object.keys(body).length !== 0 && platformName !== (undefined || '') && platformUrl !== (undefined || '')) {


        const existingPlatform = await FindPlatform(undefined, platformName);

        if (existingPlatform !== null) {
            return res.json({ "message": "Platform already exists" })
        }

        const createdPlatform = await Platform.create({
            platformName: platformName,
            platformUrl: platformUrl
        });
        return res.json(createdPlatform);

    } else {

        return res.json("Bos deger yollamayiniz")
    }

}

export const GetPlatforms = async (req: Request, res: Response, next: NextFunction) => {

    const Platforms = await Platform.find()

    if (Platforms !== null) {
        return res.json(Platforms)
    }

    return res.json({ "message": "Vendors data not available" })

}

export const GetPlatform = async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.platform !== undefined && req.params.platform !== "undefined") {
        const platform = req.params.platform;
        const CampaignsWhole = await Campaign.find({ platform: platform })

        const CampaignsSuccess = await Campaign.find({ platform: platform, campaignState: "2" })
        const CampaignsSoon = await Campaign.find({ platform: platform, campaignState: "3" })
        const CampaignsUnsuccess = await Campaign.find({ platform: platform, campaignState: "1" })
        const CampaignsActive = await Campaign.find({ platform: platform, campaignState: "0" })
        let resultfind = await Platform.findOne({ _id: platform })

        let today = 0
        let kalan = 0
        let toplamfon = 0

        CampaignsWhole.forEach((e,i) => {
            let tempToday = e.newDayInvestment && e.currentInvestment ? (Number(e.currentInvestment.toString().replaceAll(".", "")) - Number(e.newDayInvestment.toString().replaceAll(".", ""))) : 0
            let tempFon = e.currentInvestment? Number(e.currentInvestment.toString().replaceAll(".", "")) : 0
            let tempKalan= e.currentInvestment && e.targetedFunding ? Math.abs(Number(e.targetedFunding.toString().replaceAll(".", ""))-Number(e.currentInvestment.toString().replaceAll(".", ""))):0
            if(tempToday < 0) {
                return tempToday = 0;
            }
            if(tempFon < 0) {
                return tempFon = 0;
            }
            today = today+tempToday
            kalan= kalan+tempKalan
            toplamfon = toplamfon+tempFon
        })
        if (resultfind) {
            let resss = {
                resultfind,
                campaignObj: {
                    CampaignsActive: CampaignsActive,
                    CampaignsSoon: CampaignsSoon,
                    CampaignsSuccess: CampaignsSuccess,
                    CampaignsUnsuccess: CampaignsUnsuccess,
                    today: today,
                    kalan: kalan,
                    toplamfon: toplamfon
                }
            }
            return res.status(200).json(resss)
        }
        return res.status(400).json({ message: "data not found!" })
    } else {
        return res.status(400).json({ message: "data not found!" })

    }
}
