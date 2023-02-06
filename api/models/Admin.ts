import mongoose, { Schema, Document, Model} from "mongoose";


interface AdminDoc extends Document{
    name: string;
    adminID: string;
    password: string;
    salt: string;
    isAdmin: boolean;
    coverImages: [string];
}

const AdminSchema = new Schema({
    name:{type: String, required: true},
    adminID:{type: String, required: true},
    password:{type: String, required: true},
    salt:{type: String, required: true},
    isAdmin:{type: Boolean, required: true},
    coverImages:{type: [String]}

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

const Admin = mongoose.model<AdminDoc>("Admin", AdminSchema);

export { Admin }