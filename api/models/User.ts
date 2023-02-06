import mongoose, { Schema, Document, Model} from "mongoose";


interface UserDoc extends Document{
    name: string;
    phone: string;
    email: string;
    password: string;
    salt: string;
    isPremium: boolean;
    mailPermission: boolean;
    isGoogleUser: boolean;
    googleUserObject: string;
    coverImage: string;
    investments: any;
    follows: any;
    alarms: [any]
}

const UserSchema = new Schema({
    name:{type: String}, // , required: true
    phone:{type: String},
    email:{type: String}, // , required: true
    password:{type: String}, // , required: true
    salt:{type: String}, // , required: true
    isPremium:{type: Boolean},
    mailPermission: {type: Boolean},
    isGoogleUser: {type: Boolean},
    googleUserObject: {type: String},
    coverImage:{type: String},
    investments:[{type: String}],
    follows:[{type: String}],
    alarms:[
        {
            campaignId: {type: String},
            amount: {type: Number},
            date: {type: Date}  
        }
    ]

},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.updatedAt;
        }
    },
    timestamps: true
});

const User = mongoose.model<UserDoc>("User", UserSchema);

export { User }