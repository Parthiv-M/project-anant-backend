
import { fullDownload, sendEmail, updateUserInfo } from '@helpers/extras';
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import fs from "fs";

const downloadRouter = Router();

// @route   GET /dbdownload/:dbType
// @desc    route to download db
// @access  Protected
downloadRouter.post('/:dbType',
    verifySession(),
    body('fullName').isString().withMessage('Valid name is required'),
    body('email').isString().withMessage('Valid email is required'),
    body('designation').isString().withMessage('Valid designation is required'),
    body('organisation').isString().withMessage('Valid organisation is required'),
    body('reason').isString().withMessage('Valid reason is required'),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { dbType } = req.params;
            if (dbType === "mxene") {
                var stat = fs.statSync(process.env.MXENE_DB_ZIP_LINK);
                res.writeHead(200, {
                    'Content-Type': 'application/zip',
                    'Content-Length': stat.size
                });
                let emailJSData = {
                    templateID: "template_gpd4r8n",
                    serviceID: "service_evvcvey",
                    fromEmail: "anantiiscmrc@gmail.com",
                    toEmail: req.body.email,
                    fromName: "Team aNANt",
                    fullName: req.body.fullName,
                    organisation: req.body.organisation,
                    designation: req.body.designation
                }
                var readStream = fs.createReadStream(process.env.MXENE_DB_ZIP_LINK);
                readStream.pipe(res);
                await sendEmail("admin", emailJSData, "MXene");
                await sendEmail("user", emailJSData, "MXene");
                await updateUserInfo({
                    fullName: req.body.fullName,
                    organisation: req.body.organisation,
                    designation: req.body.designation,
                }, req.body.email, dbType, req.body.reason);
                return res.status(200).json({ message: "All good" });
            } else {
                const downloadResults = await fullDownload(
                    dbType,
                    req.body.email,
                    req.body.fullName,
                    req.body.organisation,
                    req.body.designation,
                    req.body.reason
                );
                res.writeHead(200, {
                    'Content-Type': 'application/zip',
                });
                return res.end(downloadResults);
            }
        } catch (error) {
            // microservice for logging. Use winston or other logging library
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json(error);
        }
    })



export default downloadRouter;
