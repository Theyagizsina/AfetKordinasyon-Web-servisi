import { Request, Response, NextFunction } from 'express';
import { Campaign, Platform } from '../models';
import { CampaignPayload, CreateCampaignInput, EditCampaignInputs, QueryCampaignInput } from '../dto';
import { addCampaign } from '../utility/campaignUtility';
import { Mail } from '../models/Mail';

//gerekenlere ifAdmin true sorgulanip islem yapilacak!!!

export const FindCampaign = async (id: string | undefined, campaignName?: string) => {

    if (campaignName) {
        const campaign = Campaign.findOne({ campaignName: campaignName })
        return campaign
    } else {
        return await Campaign.findById(id)
    }
}

// export const CreateCampaign = async (req: Request, res: Response, next: NextFunction) => {

//     const {campaignUrl, platform} = <CreateCampaignInput>req.body;
//     const body = <CreateCampaignInput>req.body;

//     //TODO url nin unique olup olmadigi kontrol edilecek if else yazilacak

//     if (Object.keys(body).length !== 0 && campaignUrl !== (undefined || '')) {

//         const currentPlatform = await Platform.findOne({platformName: platform})
//         const currentUrl = campaignUrl;
//         const campaignResult = await Campaign.findOne({campaignUrl: campaignUrl})
//         const campaignNameRes = campaignResult?.campaignName 
//         const existingUrl = campaignResult?.campaignUrl

//         if(currentUrl === existingUrl){
//             return res.json({"message":"Bu link hali hazirda var"}) 
//         }else{
//             try {
//                 const campaignData = await addCampaign(campaignUrl,platform);
//                     if(currentPlatform !== null){

//                         // scraper buraya gelicek datayi cekip pushlicak
//                         if(campaignData.data !== null){

//                             const {campaignName,currentInvestment} = <CampaignPayload>campaignData.data;
//                             const createdCampaign = await Campaign.create({
//                                 campaignName: campaignName,
//                                 campaignUrl: campaignUrl,
//                                 newDayInvestment: currentInvestment,
//                                 platform: currentPlatform._id,

//                             })

//                             currentPlatform.campaigns.push(createdCampaign);
//                             await currentPlatform.save();


//                             return res.status(200).json({"message":"ok"})
//                         }
//                         return res.status(400).json("Kampanya sitesinde boyle bir kampanya yok Linki kontrol ediniz")
//                     }
//             } catch (error) {
//                 return res.json("Bir hata var aga")
//             }
//             return res.status(400).json({"message":`there is not have platform like ${platform}`})   
//         } 
//     } else {
//         res.status(400).json("Bos deger yollamayiniz")
//     }
// }

// export const UpdateCampaign = async (req: Request, res: Response, next: NextFunction) => {

//     const {
//         campaignLogo,
//         campaignType,
//         campaignStartDate,
//         campaignEndDate,
//         plannedCampaignEndDate,
//         currentInvestment,
//         newDayInvestment,
//         description,
//         companyName,
//         companyWebsite,
//         sector,
//         category,
//         initiativePhase,
//         targetedFunding,
//         shareOffered,
//         freeShare,
//         freeCampaignEndDate,
//         additionalFunding,
//         shareDistributionMethod,
//         unitPriceCra,
//         campaignState
//     } = <EditCampaignInputs>req.body;

//     const id = req.params.id;
//     const splitedId = id.substring(0,24)

//     if (splitedId.length < 24) {
//         return res.status(400).json({ message: "Syntax error!"})
//     }else{
//         const campaignId = splitedId.match(/^[0-9a-fA-F]{24}$/)

//         if (campaignId !== null) {

//             const existingCampaign = await FindCampaign(splitedId)

//             if(existingCampaign){

//                 existingCampaign.campaignLogo = campaignLogo,
//                 existingCampaign.campaignType = campaignType,
//                 existingCampaign.campaignStartDate = campaignStartDate,
//                 existingCampaign.campaignEndDate = campaignEndDate,
//                 existingCampaign.plannedCampaignEndDate = plannedCampaignEndDate,
//                 existingCampaign.currentInvestment = currentInvestment,
//                 existingCampaign.description = description,
//                 existingCampaign.companyName = companyName,
//                 existingCampaign.companyWebsite = companyWebsite,
//                 existingCampaign.sector = sector,
//                 existingCampaign.category = category,
//                 existingCampaign.initiativePhase = initiativePhase,
//                 existingCampaign.targetedFunding = targetedFunding,
//                 existingCampaign.shareOffered = shareOffered,
//                 existingCampaign.freeShare = freeShare,
//                 existingCampaign.freeCampaignEndDate = freeCampaignEndDate,
//                 existingCampaign.additionalFunding = additionalFunding,
//                 existingCampaign.shareDistributionMethod = shareDistributionMethod,
//                 existingCampaign.unitPriceCra = unitPriceCra
//                 existingCampaign.campaignState = campaignState

//                 const savedResult = await existingCampaign.save()

//                 return res.status(200).json({ message: "ok"})
//             }else{

//                 return res.status(400).json({ message: "data not found!"})
//             }

//         } else {
//             return res.status(400).json({ message: "Id tipin yanlis"})
//         }
//     }
// }

export const GetCampaigns = async (req: Request, res: Response, next: NextFunction) => {

    const Campaigns = await Campaign.find().sort({campaignStartDate: -1})
    if (Campaigns !== null) {
        return res.json(Campaigns)
    }

    return res.json({ "message": "Campaign data not available" })

}
export const RenderMail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const mailName = req.params.name
    const mail = await Mail.findOne({ mailName: mailName })
    if (mail) {
        res.send(JSON.parse(mail.mailHtml))
    } else {
        res.json("error")
    }
}

export const LandingCampaigns = async (req: Request, res: Response, next: NextFunction) => {
    const Campaigns = await Campaign.find()
    const Platforms = await Platform.find()

    if (Campaigns !== null) {
        const ttl = Campaigns.filter((e) => Number(e.campaignState) === 0);
        const aktif = Campaigns.filter((e) => Number(e.campaignState) === 0).splice(0, 5);
        const basarili = Campaigns.filter((e) => Number(e.campaignState) === 2).splice(0, 5);
        const yakinda = Campaigns.filter((e) => Number(e.campaignState) === 3).splice(0, 5);

        return res.json([aktif, basarili, yakinda, {
            totalkampanya: ttl.length,
            totalplatform: Platforms.length
        }])
    }
    

}
export const GetCampaignById = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const id = req.params.id;
        const splitedId = id.substring(0, 24)
        if (splitedId.length < 24) {
            return res.status(400).json({ message: "Syntax error!" })
        } else {

            const matchedId = splitedId.match(/^[0-9a-fA-F]{24}$/)
            if (matchedId !== null) {

                const existingCampaign = await FindCampaign(splitedId)

                if (existingCampaign) {
                    return res.status(200).json(existingCampaign)
                } else {

                    return res.status(400).json({ message: "data not found!" })
                }
            } else {

                return res.status(400).json({ message: "Id tipin yanlis" })
            }
        }
    } catch (err) {
        return res.status(400).json({ message: "bir hata olustu" })
    }


}

export const GetCampaignByUrl = async (req: Request, res: Response, next: NextFunction) => {

    const { campaignUrl } = <QueryCampaignInput>req.body;


    const existingCampaign = await Campaign.findOne({ campaignUrl: campaignUrl })

    if (existingCampaign !== null) {
        return res.json(existingCampaign)
    }

    return res.json({ "message": `Boyle bir kampanya bulunamadi` });

}


