import { Request, Response, NextFunction } from "express";
import {
  CreateAdminInput,
  AdminLoginInputs,
  CampaignPayload,
  CreateCampaignInput,
  EditCampaignInputs,
  PlatformPayload,
} from "../dto";
import { Campaign, Platform, Admin, User } from "../models";
import { RequestWithUser } from "../middlewares/CommonAuth";
import { ValidatePassword } from "../utility";
import {
  GenerateSalt,
  GeneratePassword,
  GenerateAdminSignature,
} from "../utility/PasswordUtility";
import { addCampaign } from "../utility/campaignUtility";
import { FindCampaign } from "./CampaignController";
import { FindPlatform } from "./PlatformController";
import { Mail } from "../models/Mail";
import { MailInputs } from "../dto/Mail.dto";

export const FindAdmin = async (id: string | undefined, adminID?: string) => {
  if (adminID) {
    const admin = Admin.findOne({ adminID: adminID });
    return admin;
  } else {
    return await Admin.findById(id);
  }
};

export const FindUser = async (id: string | undefined, email?: string) => {
  if (email) {
    const user = User.findOne({ email: email });
    return user;
  } else {
    return await User.findById(id);
  }
};

export const AdminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { adminID, password } = <AdminLoginInputs>req.body;

  const existingAdmin = await FindAdmin(undefined, adminID);

  if (existingAdmin !== null) {
    const validation = await ValidatePassword(
      password,
      existingAdmin.password,
      existingAdmin.salt
    );

    if (validation) {
      const signature = GenerateAdminSignature({
        _id: existingAdmin.id,
        adminID: existingAdmin.adminID,
        name: existingAdmin.name,
        isAdmin: existingAdmin.isAdmin,
      });

      const userCredentials = {
        name: existingAdmin.name,
        token: signature,
      };

      return res.status(200).json(userCredentials);
    } else {
      return res.status(403).json({ message: "Password is not valid" });
    }
  }

  return res.status(403).json({ message: "Login credential not valid" });
};

export const CreateAdmin = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const { name, adminID, password, isAdmin } = <CreateAdminInput>req.body;

  const admin = req.admin;

  // if(admin?.isAdmin){

  //     const existingAdmin = await FindAdmin('', adminID);

  //     if(existingAdmin !== null){
  //         return res.json({"message": "Admin already exists"})
  //     }

  //     //generate salt
  //     const salt = await GenerateSalt()
  //     const userPassword = await GeneratePassword(password, salt);
  //     // encrypt the password using the salt

  //     // save the salt and the encrypted password to the database

  //     const createdAdmin = await Admin.create({
  //         name: name,
  //         adminID: adminID,
  //         password: userPassword,
  //         salt: salt,
  //         isAdmin: isAdmin,
  //         coverImages: [],
  //     });

  //     return res.json(createdAdmin);

  // }else{
  //     return res.status(403).json("SuperUser Yetkin olmadan kimseye admin veremezsin")
  // }
  const existingAdmin = await FindAdmin("", adminID);

  if (existingAdmin !== null) {
    return res.json({ message: "Admin already exists" });
  }

  //generate salt
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);
  // encrypt the password using the salt

  // save the salt and the encrypted password to the database

  const createdAdmin = await Admin.create({
    name: name,
    adminID: adminID,
    password: userPassword,
    salt: salt,
    isAdmin: isAdmin,
    coverImages: [],
  });

  return res.json(createdAdmin);
};

export const CreateCampaign = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const { campaignUrl, platform } = <CreateCampaignInput>req.body;
  const body = <CreateCampaignInput>req.body;
  console.log(campaignUrl, platform)
  //TODO url nin unique olup olmadigi kontrol edilecek if else yazilacak

  if (Object.keys(body).length !== 0 && campaignUrl !== (undefined || "")) {
    const currentPlatform = await Platform.findOne({ platformName: platform });
    const currentUrl = campaignUrl;
    console.log(currentUrl)
    const campaignResult = await Campaign.findOne({ campaignUrl: campaignUrl });
    const campaignNameRes = campaignResult?.campaignName;
    const existingUrl = campaignResult?.campaignUrl;

    if (currentUrl === existingUrl) {
      return res.json({ message: "Bu link hali hazirda var" });
    } else {
      try {
        const campaignData = await addCampaign(campaignUrl, platform);
        console.log(campaignData.data)
        if (currentPlatform !== null) {
          // scraper buraya gelicek datayi cekip pushlicak
          if (campaignData.data !== null) {
            const { campaignName, currentInvestment } = <CampaignPayload>(
              campaignData.data
            );
            const createdCampaign = await Campaign.create({
              campaignName: campaignName,
              campaignUrl: campaignUrl,
              newDayInvestment: currentInvestment,
              currentInvestment: currentInvestment,
              platform: currentPlatform._id,
            });

            currentPlatform.campaigns.push(createdCampaign);
            await currentPlatform.save();

            return res.status(200).json({ message: "ok" });
          }
          return res
            .status(400)
            .json(
              "Kampanya sitesinde boyle bir kampanya yok Linki kontrol ediniz"
            );
        }
      } catch (error) {
        return res.json("Bir hata var aga");
      }
      return res
        .status(400)
        .json({ message: `there is not a platform such ${platform}` });
    }
  } else {
    res.status(400).json("Bos deger yollamayiniz");
  }
};

export const UpdateCampaign = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const {
    campaignLogo,
    campaignName,
    campaignType,
    campaignStartDate,
    campaignEndDate,
    plannedCampaignEndDate,
    currentInvestment,
    campaignState,
    description,
    companyName,
    companyWebsite,
    sector,
    category,
    initiativePhase,
    targetedFunding,
    shareOffered,
    freeShare,
    freeCampaignEndDate,
    additionalFunding,
    shareDistributionMethod,
    unitPriceCra,
  } = <EditCampaignInputs>req.body;

  const id = req.params.id;
  const splitedId = id.substring(0, 24);

  if (splitedId.length < 24) {
    return res.status(400).json({ message: "Syntax error!" });
  } else {
    const campaignId = splitedId.match(/^[0-9a-fA-F]{24}$/);

    if (campaignId !== null) {
      const existingCampaign = await FindCampaign(splitedId);

      if (existingCampaign) {
        (existingCampaign.campaignLogo = campaignLogo),
          (existingCampaign.campaignName = campaignName),
          (existingCampaign.campaignType = campaignType),
          (existingCampaign.campaignStartDate = campaignStartDate),
          (existingCampaign.campaignEndDate = campaignEndDate),
          (existingCampaign.plannedCampaignEndDate = plannedCampaignEndDate),
          (existingCampaign.currentInvestment = currentInvestment),
          //(existingCampaign.newDayInvestment = newDayInvestment),
          (existingCampaign.description = description),
          (existingCampaign.companyName = companyName),
          (existingCampaign.companyWebsite = companyWebsite),
          (existingCampaign.sector = sector),
          (existingCampaign.initiativePhase = initiativePhase),
          (existingCampaign.targetedFunding = targetedFunding),
          (existingCampaign.shareOffered = shareOffered),
          (existingCampaign.freeShare = freeShare),
          (existingCampaign.freeCampaignEndDate = freeCampaignEndDate),
          (existingCampaign.additionalFunding = additionalFunding),
          (existingCampaign.shareDistributionMethod = shareDistributionMethod),
          (existingCampaign.unitPriceCra = unitPriceCra);
        (existingCampaign.category = category);
        (existingCampaign.campaignState = campaignState);

        const savedResult = await existingCampaign.save();

        return res.status(200).json({ message: "ok", campaign: savedResult });
      } else {
        return res.status(400).json({ message: "data not found!" });
      }
    } else {
      return res.status(400).json({ message: "Id tipin yanlis" });
    }
  }
};

export const UpdatePlatform = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const {
    _id,
    description,
    platformLogo,
    platformTitle,
    platformUrl
  } = <PlatformPayload>req.body;

  const splitedId = _id.substring(0, 24);

  if (splitedId.length < 24) {
    return res.status(400).json({ message: "Syntax error!" });
  } else {
    const platformId = splitedId.match(/^[0-9a-fA-F]{24}$/);

    if (platformId !== null) {
      const existingPlatform = await FindPlatform(splitedId);

      if (existingPlatform) {
        (existingPlatform.platformLogo = platformLogo),
          (existingPlatform.platformTitle = platformTitle),
          (existingPlatform.description = description),
          (existingPlatform.platformUrl = platformUrl)

        const savedResult = await existingPlatform.save();

        return res.status(200).json({ message: "ok", platform: savedResult });
      } else {
        return res.status(400).json({ message: "data not found!" });
      }
    } else {
      return res.status(400).json({ message: "Id tipin yanlis" });
    }
  }
};

export const UpdateUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const {
    _id,
    name,
    phone,
    email,
    isPremium,
    mailPermission,
    chgpass,
    password
  } = req.body;


  if (_id !== null) {
    const existingUser = await FindUser(_id);

    if (existingUser) {
      if (chgpass) {
        const salt = await GenerateSalt();
        const userPassword = await GeneratePassword(password, salt);

        (existingUser.name = name),
          (existingUser.phone = phone),
          (existingUser.email = email),
          (existingUser.isPremium = isPremium),
          (existingUser.mailPermission = mailPermission),
          (existingUser.password = userPassword),
          (existingUser.salt = salt);
        const savedResult = await existingUser.save();

      } else {

        (existingUser.name = name),
          (existingUser.phone = phone),
          (existingUser.email = email),
          (existingUser.isPremium = isPremium),
          (existingUser.mailPermission = mailPermission);
        const savedResult = await existingUser.save();

      }

      return res.status(200).json({ message: "ok" });
    } else {
      return res.status(400).json({ message: "data not found!" });
    }
  } else {
    return res.status(400).json({ message: "Id tipin yanlis" });
  }
};

// export const GetMails = async (req: RequestWithUser, res: Response, next: NextFunction) => {

//   const Mails = Mail.find

// }

export const DeleteCampaign = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const splitedId = id.substring(0, 24);

  if (splitedId.length < 24) {
    return res.status(400).json({ message: "Syntax error!" });
  } else {
    const campaignId = splitedId.match(/^[0-9a-fA-F]{24}$/);

    if (campaignId !== null) {
      const existingCampaign = await FindCampaign(splitedId);

      if (existingCampaign) {
        const deleteCampaign = await existingCampaign.deleteOne({
          _id: splitedId,
        });

        return res.status(200).json({ message: "ok" });
      } else {
        return res.status(400).json({ message: "data not found!" });
      }
    } else {
      return res.status(400).json({ message: "Id tipin yanlis" });
    }
  }
};

export const DeleteUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (req.params.id !== null) {
    const existingUser = await FindUser(req.params.id);

    if (existingUser) {
      const deletedUser = await existingUser.deleteOne({
        _id: req.params.id,
      });

      return res.status(200).json({ message: "ok" });
    } else {
      return res.status(400).json({ message: "data not found!" });
    }
  } else {
    return res.status(400).json({ message: "Id tipin yanlis" });
  }
};

export const GetUsers = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const admin = req.admin;

  if (admin?.isAdmin) {
    const Users = await User.find();

    if (Users !== null) {
      return res.json(Users);
    }

    return res.json({ message: "Users data not available" });
  } else {
    return res
      .status(403)
      .json("Admin Yetkisi Olmadan Yeni Kantin Olusturamazsin!");
  }
};

export const GetUserByID = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const admin = req.admin;

  if (admin?.isAdmin) {
    const UserId = req.params.id;

    const User = await FindUser(UserId);

    if (User !== null) {
      return res.json(User);
    }
  } else {
    return res
      .status(403)
      .json("Admin Yetkisi Olmadan Yeni Kantin Olusturamazsin!");
  }

  return res.json({ message: "User data not available" });
};

export const GetMail = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const all = await Mail.find()
  res.json(all)
}

export const UpdateMail = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const { mailType, design, html } = <MailInputs>req.body
  const mail = await Mail.findOne({ mailName: mailType })
  if (mail) {
    if (design && html) {
      mail.mailDesign = JSON.stringify(design)
      mail.mailHtml = JSON.stringify(html)
      mail.save()
      res.json(mail)
    }
  } else {
    res.json("error")
  }
}
// export const AddMail = async (
//   req: RequestWithUser,
//   res: Response,
//   next: NextFunction
// ) => {
//   const newA = await Mail.create({
//     mailName: req.body.name,
//     mailDesign: req.body.mailDesign,
//     mailHtml: req.body.mailHtml
//   })
//   const all = await Mail.find()
//   res.json(all)
// }