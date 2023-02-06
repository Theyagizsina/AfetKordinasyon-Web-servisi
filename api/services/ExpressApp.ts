import express,{ Application } from "express";
import bodyParser from "body-parser";
import path from "path";
import cors from "cors";
import MailService from './mailService';

import { AdminRoute, PlatformRoute, CampaignRoute, UserRoute } from "../routes";

const allowedOrigins = [
    "http://kitlefonlama.market",
    "https://kitlefonlama.market",
    "http://kitlefonlama.market",
    "https://admin.kitlefonlama.market",
]

export default async (app: Application) => {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }))
    /**{
      origin: function(origin, callback){
          // allow requests with no origin 
          // (like mobile apps or curl requests)
          if(!origin) return callback(null, true);
          if(allowedOrigins.indexOf(origin) === -1){
            var msg = 'The CORS policy for this site does not ' +
                      'allow access from the specified Origin.';
            return callback(new Error(msg), false);
          }
          return callback(null, true);
        }
  } */
    app.use(cors())

    app.use('/admin', AdminRoute);
    app.use('/user', UserRoute)
    app.use('/platform', PlatformRoute)
    app.use('/campaign', CampaignRoute)

    return app;
}

