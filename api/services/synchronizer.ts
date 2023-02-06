import axios from "axios"
import { API } from "../config"
import { Campaign } from "../models"
import { checkAlarms } from "./alarmService"

type customType = [any]

export const Synchronize = async () => {
    const RawCampaigns = await axios.get(API + "/campaign")
    RawCampaigns.data.forEach(async (rawcampaign: any) => {
        const matchingCampaign = await Campaign.findOne({ campaignUrl: rawcampaign.campaignUrl })
        if (matchingCampaign) {
            console.log(matchingCampaign.currentInvestment)

            if ((matchingCampaign.platform.toString() === "63bf25a37f92dbd06bc0a459") || (matchingCampaign.platform.toString() === "63bf25957f92dbd06bc0a456")) {
                console.log("paslandi platformdan dolayi")
            } else {
                const oldInv = matchingCampaign.currentInvestment
                const newInv = rawcampaign.currentInvestment
                console.log("NAME " + matchingCampaign.campaignName.slice(0, 10) + " OLD " + oldInv + " NEW " + newInv)
                matchingCampaign.currentInvestment = rawcampaign.currentInvestment
                const result = await matchingCampaign.save()
            }
            console.log(matchingCampaign?.currentInvestment)
        }
    })
    checkAlarms();
}

export const SyncNewDay = async () => {
    const RawCampaigns = await axios.get(API + "/campaign")
    RawCampaigns.data.forEach(async (rawcampaign: any) => {
        const matchingCampaign = await Campaign.findOne({ campaignUrl: rawcampaign.campaignUrl })
        console.log('FIRST ' + matchingCampaign?.currentInvestment)

        if (matchingCampaign) {
            if ((matchingCampaign.platform === "63bf25a37f92dbd06bc0a459") || (matchingCampaign.platform === "63bf25957f92dbd06bc0a456")) {
                console.log("paslandi platformdan dolayi")
            } else {
                const oldInv = matchingCampaign.newDayInvestment
                const newInv = rawcampaign.currentInvestment
                console.log("A NAME " + matchingCampaign.campaignName.slice(0, 10) + " OLD " + oldInv + " NEW " + newInv)
                matchingCampaign.newDayInvestment = rawcampaign.currentInvestment
                const result = await matchingCampaign.save()
            }
        }
        console.log('SFIRST ' + matchingCampaign?.currentInvestment)


    })
}
