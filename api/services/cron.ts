import cron from 'node-cron';
import { Synchronize, SyncNewDay } from './synchronizer';

export const cronJob = async () => {
    console.log("CRON JOB START")
    cron.schedule('*/6 * * * *', async () => {
        console.log("CRON GUNCELLEME START")
        await Synchronize();
        console.log("CRON GUNCELLEME END")
    });
    cron.schedule('59 23 * * *', async () => {
        console.log("NEW DAY INV START")
        await SyncNewDay();
        console.log("NEW DAY INV END")
    })
}

// Alibengu@gmail.com
// cenuta741023qwE*