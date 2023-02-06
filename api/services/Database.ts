import mongoose from "mongoose";
import { MONGO_URI } from '../config/index';

export default async () => {

    try {
        await mongoose.connect(MONGO_URI,()=>{
        console.log('Connected to MongoDB');
        });
        
    } catch (ex) {
        console.log(ex)
    }
}