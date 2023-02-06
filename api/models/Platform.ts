import mongoose, { Schema, Document, Model} from "mongoose";


interface PlatformDoc extends Document{
    platformUrl: string;
    description: string;
    platformName: string;
    platformLogo: string;
    platformTitle: string;
    campaigns: any;
    campaignObj: any;


}

const PlatformSchema = new Schema({
    platformUrl: {type: String},
    description: {type: String},
    platformName: {type: String, require: true},
    platformLogo: {type: String},
    platformTitle: {type: String},
    campaigns: [{type: mongoose.Schema.Types.ObjectId, ref: "Campaign"}]

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

const Platform = mongoose.model<PlatformDoc>("Platform", PlatformSchema);

export { Platform }