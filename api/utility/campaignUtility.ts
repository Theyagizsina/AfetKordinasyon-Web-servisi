import axios from 'axios';
import { API } from '../config';


export const addCampaign = async (campaignUrl: string, platform: string) => {
    const endpoint = API + "/campaign/add"
    const res = await axios.post(endpoint, {campaignUrl: campaignUrl, platform:platform});
    return res
}