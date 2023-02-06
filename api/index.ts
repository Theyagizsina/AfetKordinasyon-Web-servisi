import express from "express";
import App from './services/ExpressApp';
import dbConnection from './services/Database';



const StartServer = async () => {
    
    const app = express()

    await App(app);

    dbConnection();

    app.listen(8000, () => {
        console.log('Listening to port 8000');

    });

}
StartServer();