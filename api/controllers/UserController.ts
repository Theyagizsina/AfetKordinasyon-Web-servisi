import { Request, Response, NextFunction, response } from "express";
import { EditUserInputs, UserLoginInputs, CreateUserInput } from "../dto";
import { ValidatePassword } from "../utility";
import { FindUser } from "./AdminController";
import {
  GenerateSalt,
  GeneratePassword,
  GenerateSignature,
} from "../utility/PasswordUtility";
import { RequestWithUser } from "../middlewares/CommonAuth";
import { User, Mail } from "../models";
import { MailService } from "../services/mailService";
import { FindCampaign } from "./CampaignController";
import jwtDecode, { JwtPayload } from "jwt-decode";
import { OAuth2Client } from "google-auth-library";
import handlebars from "handlebars";
type customJwtPayload = JwtPayload & { email: string, name: string };
type customPayload = string;
const CLIENT_ID = "953406131331-6rt9inquhrsdbdl454864fla99vef5vf.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);




export const UpdateUserClient = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    phone,
    email,
    password,
    mailPermission,
    chgpass
  } = req.body.data;
  const user = req.user
  if (user) {
    const existingUser = await FindUser(user._id);
    console.log(existingUser)
    if (existingUser) {
      if (chgpass && password) {
        const salt = await GenerateSalt();
        const userPassword = await GeneratePassword(password, salt);
          (existingUser.name = name),
          (existingUser.phone = phone),
          (existingUser.email = email),
          (existingUser.password = userPassword),
          (existingUser.salt = salt),
          (existingUser.mailPermission = mailPermission);
      } else {
        (existingUser.name = name),
          (existingUser.phone = phone),
          (existingUser.email = email),
          (existingUser.mailPermission = mailPermission);
      }

      const savedResult = await existingUser.save();

      return res.status(200).json({ message: savedResult });
    } else {
      return res.status(400).json({ message: "data not found!" });
    }
  }
};

export const UserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.isGoogleUser) {
    const { googleUserObject } = <CreateUserInput>(
      req.body
    );
    if (googleUserObject) {

      const ticket = await client.verifyIdToken({
        idToken: googleUserObject,
        audience: CLIENT_ID,
      });
      if (ticket.getPayload()) {
        const payload = ticket.getPayload();

        const decodedGoogleUser = jwtDecode<customJwtPayload>(googleUserObject)


        if (JSON.stringify(payload) === JSON.stringify(decodedGoogleUser)) {
          const existingUser = await FindUser("", decodedGoogleUser.email);
          if (existingUser !== null) {
            const signature = GenerateSignature({
              _id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
            });

            const userCredentials = {
              name: existingUser.name,
              token: signature,
            };

            return res.status(200).json(userCredentials);
          } else {
            const createdUser = await User.create({
              googleUserObject: googleUserObject,
              isGoogleUser: true,
              name: decodedGoogleUser.name,
              email: decodedGoogleUser.email,
              phone: "",
              password: "",
              salt: "",
              coverImage: "",
              isPremium: true,
              mailPermission: false,
              investments: [],
              follows: [],
              alarms: [],
            });
            console.log("YENİ GOOGLE ÜYESİ " + createdUser.email)
            const mailService = MailService.getInstance();
            const mailler = await Mail.findOne({ mailName: "welcome" })
            if(mailler){
              const html = JSON.parse(mailler.mailHtml)
              const template = handlebars.compile(html)
              const replacement = {username: createdUser.name}
              const htmlToSend = template(replacement)
              await mailService.sendMail(createdUser._id.toString() + "hosgeldin", {
                to: createdUser.email,
                subject: "Kitlefonlama.co | HOŞ GELDİNİZ",
                html: htmlToSend,
                text: `Kitlefonlamaya hoş geldiniz !`
              });
            }
            const signature = GenerateSignature({
              _id: createdUser.id,
              email: createdUser.email,
              name: createdUser.name,
            });

            const userCredentials = {
              name: createdUser.name,
              token: signature,
            };

            return res.status(200).json(userCredentials);

          }
        }
      }


    } else {
      res.status(400).json({ message: "notoken" })
    }

  } else {
    const { email, password } = <UserLoginInputs>req.body;
    console.log(req.body);

    const existingUser = await FindUser(undefined, email);
    if (existingUser !== null) {
      if (existingUser.isGoogleUser) {
        return res.status(400).json({ message: "only google" })
      } else {
        const validation = await ValidatePassword(
          password,
          existingUser.password,
          existingUser.salt
        );
        console.log(validation)

        if (validation) {
          const signature = GenerateSignature({
            _id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
          });

          const userCredentials = {
            name: existingUser.name,
            token: signature,
          };

          return res.status(200).json(userCredentials);
        } else {
          return res.status(403).json({ message: "Password is not valid" });
        }
      }
    } else {
      return res.status(403).json({ message: "Login credential not valid" });
    }


  }
};

export const CreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const { name, email, password, mailPermission, phone } = <CreateUserInput>(
    req.body
  );

  const existingUser = await FindUser("", email);

  if (existingUser !== null) {
    return res.json({ message: "User already exists" });
  }

  //generate salt
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);
  // encrypt the password using the salt

  // save the salt and the encrypted password to the database

  const createdUser = await User.create({
    name: name,
    email: email,
    phone: phone,
    password: userPassword,
    salt: salt,
    coverImage: "",
    isPremium: true,
    mailPermission: mailPermission,
    investments: [],
    follows: [],
    alarms: [],
  });
  console.log("YENİ ÜYE" + createdUser.email)
  const mailService = MailService.getInstance();
  const mailler = await Mail.findOne({ mailName: "welcome" })
  if(mailler){
    const html = JSON.parse(mailler.mailHtml)
    const template = handlebars.compile(html)
    const replacement = {username: createdUser.name}
    const htmlToSend = template(replacement)
    await mailService.sendMail(createdUser._id.toString() + "hosgeldin", {
      to: createdUser.email,
      subject: "Kitlefonlama.co | HOŞ GELDİNİZ",
      html: htmlToSend,
      text: `Kitlefonlamaya hoş geldiniz !`
    });
  }

  return res.status(200).json("Kullanıcı Başarıyla Oluşturuldu");

};

export const GetUserProfile = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingUser = await FindUser(user._id);

    if (existingUser) {
      return res.json(existingUser);
    }
  }

  return res.json({ message: "User not found!" });
};

export const GetAlarm = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const id = req.params.id;

  if (user) {
    const existingUser = await FindUser(user._id);
    if (existingUser) {
      if (id) {
        const existingCampaign = await FindCampaign(id);
        if (existingCampaign) {
          const alarmIndex = existingUser.alarms.findIndex(
            (e) => e.campaignId === id
          );
          if (alarmIndex !== -1) {
            res.json({ alarm: existingUser.alarms[alarmIndex] });
          } else {
            res.json({ message: "No Alarm" })
          }
        } else {
          res.json({ message: "NO SUCH CAMPAIGN" });
        }
      } else {
        return res.json({ message: "NO ALARM DATA PROVIDED" });
      }
    } else {
      return res.json({ message: "NO CAMPAIGN DATA" });
    }
  } else {
    return res.json({ message: "NO USER DATA" });
  }
};

export const Follow = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const id = req.body.id;

  if (user) {
    const existingUser = await FindUser(user._id);
    if (existingUser) {
      if (id) {
        const followIndex = existingUser.follows.findIndex(
          (e: any) => e === id
        );
        if (followIndex !== -1) {
          existingUser.follows.splice(followIndex, 1)
        } else {
          existingUser.follows.push(id)
        }
        const savedUser = await existingUser.save()
        res.json({ message: "OK", savedUser });
      } else {
        res.json({ message: "NO ID" });
      }
    } else {
      return res.json({ message: "NO USER FOUND" });
    }
  } else {
    return res.json({ message: "NO USER ID" });
  }
}

export const Invest = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const id = req.body.id;

  if (user) {
    const existingUser = await FindUser(user._id);
    if (existingUser) {
      if (id) {
        const followIndex = existingUser.investments.findIndex(
          (e: any) => e === id
        );
        if (followIndex !== -1) {
          existingUser.investments.splice(followIndex, 1)
        } else {
          existingUser.investments.push(id)
        }
        const savedUser = await existingUser.save()
        res.json({ message: "OK", savedUser });
      } else {
        res.json({ message: "NO ID" });
      }
    } else {
      return res.json({ message: "NO USER FOUND" });
    }
  } else {
    return res.json({ message: "NO USER ID" });
  }
}

export const DeleteAlarm = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const id = req.body.id;

  if (user) {
    const existingUser = await FindUser(user._id);
    if (existingUser) {
      if (id) {
        const existingCampaign = await FindCampaign(id);
        if (existingCampaign) {
          const alarmIndex = existingUser.alarms.findIndex(
            (e) => e.campaignId === id
          );
          if (alarmIndex !== -1) {
            existingUser.alarms.splice(alarmIndex, 1)
          }
          await existingUser.save();
          res.json({ message: "OK" });
        } else {
          res.json({ message: "NO SUCH CAMPAIGN" });
        }
      } else {
        return res.json({ message: "NO ALARM DATA PROVIDED" });
      }
    } else {
      return res.json({ message: "NO CAMPAIGN DATA" });
    }
  } else {
    return res.json({ message: "NO USER DATA" });
  }
};

export const SaveAlarm = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.body.id;
    const alarm = req.body.alarm;

    if (user) {

      const existingUser = await FindUser(user._id);
      if (existingUser) {
        if (id) {
          const existingCampaign = await FindCampaign(id);
          if (existingCampaign) {
            if (alarm) {
              const alarmIndex = existingUser.alarms.findIndex(
                (e) => e.campaignId === id
              );
              if (alarmIndex !== -1) {
                existingUser.alarms[alarmIndex].amount = Number(alarm.fon);
                existingUser.alarms[alarmIndex].date = alarm.gun;
              } else {
                existingUser.alarms.push({
                  campaignId: id,
                  amount: alarm.fon,
                  date: alarm.gun,
                });
              }
              try {
                existingUser.save();
              } catch (err) {
                return res.json({ message: "INVALID ONPUT" })
              }
              return res.json({ message: "OK" });
            } else {
              return res.json({ message: "NO SUCH CAMPAIGN" });
            }
          } else {
            return res.json({ message: "NO SUCH CAMPAIGN" });
          }
        } else {
          return res.json({ message: "NO ALARM DATA PROVIDED" });
        }
      } else {
        return res.json({ message: "NO CAMPAIGN DATA" });
      }
    } else {
      return res.json({ message: "NO USER DATA" });
    }
  } catch (err) {
    console.log(err)
    return res.json({ message: "INVALID ONPUT" });

  }
};


