import { FindCampaign, FindUser } from "../controllers";
import { Campaign, User } from "../models"
import { Mail } from "../models/Mail";
import { MailService } from "./mailService";
import handlebars from "handlebars";

function formatDate(date: Date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}



export const checkAlarms = async () => {

    const users = await User.find()
    //test için end point koyuldu düzeltilecek mail
    // if state yazılacak mail gonderimi için
    //TODO!!!!! look Up 
    // JSON.parse(mailHtml)

    users.forEach(async (user) => {
        const alarms = user.alarms;

        if (Object.keys(alarms).length !== 0) {
            alarms.forEach(async (alarm, alarmIndex) => {

                const currentCampaign = await FindCampaign(alarm.campaignId);
                const today = formatDate(new Date())
                const mailService = MailService.getInstance();
                const existingUser = await User.findById(user._id);

                if (alarm.date != "0") {
                    if (alarm.amount != "0") {
                        if (existingUser) {
                            if (currentCampaign !== null) {
                                var amount = currentCampaign?.currentInvestment.toString().split('.').join('')
                                var userAmount = alarm.amount.toString().split('.').join('')
                                console.log("")
                                console.log(user.name)
                                console.log("==========================")
                                console.log(currentCampaign.campaignName)
                                console.log("==========================")
                                console.log(today)
                                console.log(formatDate(alarm.date))
                                console.log("gun bazli : " + (today === formatDate(alarm.date)))
                                console.log("campaign amount : " + amount)
                                console.log("user amount : " + userAmount)
                                console.log("Kullanici degeri kampanya degerinden kucuk veya esit ise : " + (userAmount <= amount) + " tetik degeri : " + userAmount + " " + "olan deger : " + amount)
                                console.log("today and amount : " + ((today === formatDate(alarm.date)) && (userAmount <= amount)))
                                console.log("==========================")
                                console.log("")
                                console.log("")




                                if ((today === formatDate(alarm.date)) && (userAmount <= amount)) {
                                    console.log("ALARM1")
                                    console.log(user.email)
                                    const mailler = await Mail.findOne({ mailName: "bothalarm" })
                                    if(mailler){
                                        const html = JSON.parse(mailler.mailHtml)
                                        const template = handlebars.compile(html)
                                        const replacement = {
                                            kampanyaAdi: currentCampaign.campaignName,
                                            kullaniciAdi: user.name,
                                            alarmTarih: alarm.date,
                                            alarmMiktar: userAmount,
                                            kampanyaYatirimMiktari: currentCampaign.currentInvestment,
                                            kampanyaSirketi:currentCampaign.companyName,

                                        }
                                        const htmlToSend = template(replacement)
                                        await mailService.sendMail(currentCampaign._id, {
                                          to: user.email,
                                          subject: "Kitlefonlama.co | HOŞ GELDİNİZ",
                                          html: htmlToSend,
                                          text: `Kitlefonlamaya hoş geldiniz !`
                                        });
                                        console.log(alarmIndex)
                                        if (alarmIndex > -1) {
                                            existingUser.alarms.splice(alarmIndex, 1)
                                            console.log("silindi 1")
                                        }
                                        await existingUser.save();
                                      }
                                    //const deleteAlarm = await existingUser.alarms.campaignId.deleteOne({ _id: alarm._id })




                                } else {




                                    if (amount >= userAmount) {
                                        console.log("ALARM2")
                                        const mailler = await Mail.findOne({ mailName: "fonalarm" })
                                        if (mailler) {
                                            const html = JSON.parse(mailler.mailHtml)
                                        const template = handlebars.compile(html)
                                        const replacement = {
                                            kampanyaAdi: currentCampaign.campaignName,
                                            kullaniciAdi: user.name,
                                            alarmTarih: alarm.date,
                                            alarmMiktar: userAmount,
                                            kampanyaYatirimMiktari: currentCampaign.currentInvestment,
                                            kampanyaSirketi:currentCampaign.companyName,

                                        }
                                        const htmlToSend = template(replacement)
                                        await mailService.sendMail(currentCampaign._id, {
                                          to: user.email,
                                          subject: "Kitlefonlama.co | HOŞ GELDİNİZ",
                                          html: htmlToSend,
                                          text: `Kitlefonlamaya hoş geldiniz !`
                                        });

                                            console.log(alarmIndex)
                                            if (alarmIndex > -1) {
                                                existingUser.alarms[alarmIndex].amount = "0"
                                                console.log("silindi 2")
                                            }
                                            await existingUser.save();
                                        }
                                    }




                                    if (today === formatDate(alarm.date)) {
                                        console.log("ALARM3")

                                        const mailler = await Mail.findOne({ mailName: "datealarm" })
                                        if (mailler) {
                                            const html = JSON.parse(mailler.mailHtml)
                                        const template = handlebars.compile(html)
                                        const replacement = {
                                            kampanyaAdi: currentCampaign.campaignName,
                                            kullaniciAdi: user.name,
                                            alarmTarih: alarm.date,
                                            alarmMiktar: userAmount,
                                            kampanyaYatirimMiktari: currentCampaign.currentInvestment,
                                            kampanyaSirketi:currentCampaign.companyName,

                                        }
                                        const htmlToSend = template(replacement)
                                        await mailService.sendMail(currentCampaign._id, {
                                          to: user.email,
                                          subject: "Kitlefonlama.co | HOŞ GELDİNİZ",
                                          html: htmlToSend,
                                          text: `Kitlefonlamaya hoş geldiniz !`
                                        });

                                            console.log(alarmIndex)
                                            if (alarmIndex > -1) {
                                                existingUser.alarms[alarmIndex].date = "0"
                                                console.log("silindi 3")
                                            }
                                            await existingUser.save();
                                        }
                                    }
                                }
                            }

                        }
                    }
                }



                return "ok"

            })
        } else {
            return console.log("Kullanıcının alarmı yok Kullancı ismi: " + "'" + user.name + "'")
        }
    })

}