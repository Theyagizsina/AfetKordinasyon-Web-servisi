import mongoose, { Schema, Document, Model} from "mongoose";


interface CampaignDoc extends Document{
    campaignUrl: string;
    campaignName: string;
    campaignLogo: string;
    campaignType: string;
    campaignStartDate: Date;
    campaignEndDate: Date;
    plannedCampaignEndDate: Date;
    currentInvestment: string;
    newDayInvestment: string;
    description: string;
    companyName: string;
    companyWebsite: string;
    platform: any;
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

// daha sonra eklenecek olanlar var
// nitelikli yatirimci sayisi, toplam yatirimlari, yatirim adetei


}

const CampaignSchema = new Schema({
    campaignUrl: {type: String},
    campaignName: {type: String},
    campaignLogo: {type: String},
    campaignType: {type: String},
    campaignStartDate: {type: Date},
    campaignEndDate:{type: Date},
    plannedCampaignEndDate: {type: Date},
    currentInvestment: {type: String},
    newDayInvestment: {type: String},
    description: {type: String},
    companyName: {type: String},
    companyWebsite: {type: String},
    platform: {type: mongoose.Schema.Types.ObjectId, ref: "Platform"},
    sector: {type: String},
    category: {type: String},
    initiativePhase: {type: String},
    targetedFunding: {type: String},
    shareOffered: {type: String},
    freeShare: {type: String},
    freeCampaignEndDate: {type: Date},
    additionalFunding: {type: String},
    shareDistributionMethod: {type: String},
    unitPriceCra: {type: String},
    campaignState: {type: String}

},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true
});

const Campaign = mongoose.model<CampaignDoc>("Campaign", CampaignSchema);

export { Campaign }