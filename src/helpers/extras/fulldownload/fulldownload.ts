import emailjs, { EmailJSResponseStatus } from "@emailjs/nodejs";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY
});

const sendEmail = async (emailType: string, emailJSData: any, dbType: string) => {
    let emailResult;
    try {
        emailResult = await emailjs.send(
            emailJSData.serviceID,
            emailJSData.templateID,
            {
                from_email: emailJSData.fromEmail,
                to_email: emailType === "user" ? emailJSData.toEmail : emailJSData.fromEmail,
                from_name: emailJSData.fromName,
                designation: emailJSData.designation,
                organisation: emailJSData.organisation,
                db_type: dbType
            },
        );
    } catch (err) {
        if (err instanceof EmailJSResponseStatus) {
            console.log('EMAILJS FAILED...', err);
            return;
        }
    }
    console.log(emailResult)
}

const updateUserInfo = async (userInfo: { fullName: string, organisation: string, designation: string }, email: string) => {
    const emailExists = await prisma.users.findMany({
        where: { email: email },
        select: {
            id: true,
        }
    });

    let createdUser;
    console.log("ee: ", emailExists)
    let userData = {
        email: email,
        fullName: userInfo.fullName,
        organisation: userInfo.organisation,
        designation: userInfo.designation,
        mxeneDownloadCount: "0",
        topoDownloadCount: "0",
        twoDDownloadCount: "0",
        thermoDownloadCount: "0"
    }
    if (emailExists.length === 0) {
        createdUser = await prisma.users.create({
            data: userData
        });
        console.log("cu: ", createdUser);
        return createdUser;
    }

    return false;
}

const fullDownload = async (dbType: string, email: string, fromName: string, org: string, designation: string) => {
    let emailJSData = {
        templateID: "template_gpd4r8n",
        serviceID: "service_evvcvey",
        fromEmail: "anantiiscmrc@gmail.com",
        toEmail: email,
        fromName: "Team aNANt",
        organisation: org,
        designation: designation
    }
    let modDbType;
    switch (dbType) {
        case "mxene":
            modDbType = "MXene";
            break;
        case "topology":
            modDbType = "Topology";
            break;
        case "2d":
            modDbType = "2D Materials";
            break;
        default:
            modDbType = undefined;
            break;
    }
    if (modDbType !== undefined) {
        sendEmail("admin", emailJSData, modDbType);
        sendEmail("user", emailJSData, modDbType);
        const user = await updateUserInfo({
            fullName: fromName,
            organisation: org,
            designation: designation
        }, email);
        return user;
    }
    return null;
}

export default fullDownload;