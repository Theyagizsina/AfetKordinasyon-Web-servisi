export interface CreateCampaignInput{
    campaignUrl: string;
    platform: string;
}

export interface QueryCampaignInput{
    campaignUrl: string;
}

export interface EditCampaignInputs{
    campaignLogo: string;
    campaignName: string;
    campaignType: string;
    campaignStartDate: Date;
    campaignEndDate: Date;
    plannedCampaignEndDate: Date;
    currentInvestment: string;
    campaignUrl: string;
    newDayInvestment: string;
    description: string;
    companyName: string;
    companyWebsite: string;
    category: string;
    sector: string;
    initiativePhase: string;
    targetedFunding: string;
    shareOffered: string;
    freeShare: string;
    freeCampaignEndDate: Date;
    additionalFunding: string;
    shareDistributionMethod: string;
    unitPriceCra: string;
    campaignState: string;
}

export interface CampaignPayload {
    campaignName: string;
    currentInvestment: string;
}