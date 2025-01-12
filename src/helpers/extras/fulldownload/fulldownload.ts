import emailjs, { EmailJSResponseStatus } from "@emailjs/nodejs";
import { downloadTopologyData } from "@helpers/topology/queries";
import download2DData from "@helpers/twoD/queries/download/twoD.download";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

emailjs.init({
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY
});

const sendEmail = async (emailType: string, emailJSData: any, dbType: string) => {
    let extra_info 
        = dbType.toLowerCase() === "mxene"
            ? "Password of zip file that will be downloaded is "
            + process.env.MXENE_DB_PASSWORD : "NA";
    try {
        await emailjs.send(
            emailJSData.serviceID,
            emailJSData.templateID,
            {
                from_email: emailJSData.fromEmail,
                from_name: emailJSData.fromName,
                to_email: emailType === "user" ? emailJSData.toEmail : emailJSData.fromEmail,
                reply_to: emailType === "user" ? emailJSData.toEmail : "",
                full_name: emailJSData.fullName,
                designation: emailJSData.designation,
                organisation: emailJSData.organisation,
                db_type: dbType,
                extra_information: dbType.toLowerCase() === "mxene"
                                    ? (emailType === "user" ? extra_info : "Password for MXene database sent to user")
                                    : "NA"
            },
        );
    } catch (err) {
        if (err instanceof EmailJSResponseStatus) {
            console.log('EMAILJS FAILED...', err);
            return;
        }
    }
}

const updateUserInfo = async (userInfo: { fullName: string, organisation: string, designation: string }, email: string, dbType: string, reason: string) => {
    const emailExists = await prisma.users.findMany({
        where: { email: email },
        select: {
            id: true,
        }
    });

    let createdUser, updatedUser;
    let userData = {
        email: email,
        fullName: userInfo.fullName,
        organisation: userInfo.organisation,
        designation: userInfo.designation,
        mxeneDownloadCount: 0,
        topoDownloadCount: 0,
        twoDDownloadCount: 0,
        thermoDownloadCount: 0,
        reason: [reason]
    }
    if (emailExists.length === 0) {
        if (dbType === "mxene") {
            userData.mxeneDownloadCount = 1;
        } else if (dbType === "topology") {
            userData.topoDownloadCount = 1;
        } else if (dbType === "2d") {
            userData.twoDDownloadCount = 1;
        } else if (dbType === "thermo") {
            userData.thermoDownloadCount = 1;
        }
        createdUser = await prisma.users.create({
            data: userData
        });
        return createdUser;
    } else {
        updatedUser = await prisma.users.update({
            where: {
                email: email
            },
            data: {
                mxeneDownloadCount: {
                    increment: dbType === "mxene" ? 1 : 0
                },
                topoDownloadCount: {
                    increment: dbType === "topology" ? 1 : 0
                },
                twoDDownloadCount: {
                    increment: dbType === "2d" ? 1 : 0
                },
                thermoDownloadCount: {
                    increment: dbType === "thermo" ? 1 : 0
                },
                reason: {
                    push: reason
                }
            }
        })
        return updatedUser;
    }
}

const fullDownload = async (
    dbType: string,
    email: string,
    fromName: string,
    org: string,
    designation: string,
    reason: string
) => {
    let emailJSData = {
        templateID: "template_gpd4r8n",
        serviceID: "service_evvcvey",
        fromEmail: "anantiiscmrc@gmail.com",
        toEmail: email,
        fromName: "Team aNANt",
        fullName: fromName,
        organisation: org,
        designation: designation
    }
    let modDbType, downloadResults;
    switch (dbType) {
        case "mxene":
            modDbType = "MXene";
            downloadResults = "Downloaded";
            break;
        case "topology":
            modDbType = "Topology";
            downloadResults = await downloadTopologyData("fulldb");
            break;
        case "2d":
            modDbType = "2D Materials";
            downloadResults = await download2DData("fulldb");
            break;
        case "thermo":
            modDbType = "Thermoelectric";
            // uncomment when required
            // downloadResults = await download2DData("fulldb");
            break;
        default:
            modDbType = undefined;
            break;
    }
    if (modDbType !== undefined) {
        await sendEmail("admin", emailJSData, modDbType);
        await sendEmail("user", emailJSData, modDbType);
        const user = await updateUserInfo({
            fullName: fromName,
            organisation: org,
            designation: designation,
        }, email, dbType, reason);
        if (user) {
            return downloadResults;
        }
    }
    return null;
}

export { fullDownload };