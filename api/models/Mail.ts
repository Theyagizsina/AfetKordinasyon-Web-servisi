import mongoose, { Schema, Document, Model} from "mongoose";


interface MailDoc extends Document{
    mailName: string;
    mailDesign: string;
    mailHtml: string;
}

const MailSchema = new Schema({
    mailName: {type: String},
    mailDesign: {type: String},
    mailHtml: {type: String}
},{
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true
});

const Mail = mongoose.model<MailDoc>("Mail", MailSchema);

export { Mail }