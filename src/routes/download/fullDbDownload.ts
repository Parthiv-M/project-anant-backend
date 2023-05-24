import { fullDownload } from '@helpers/extras';
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import ThirdParty from "supertokens-node/recipe/thirdparty";

const downloadRouter = Router();

// @route   GET /dbdownload/:dbType
// @desc    route to download db
// @access  Protected
downloadRouter.get('/:dbType',
    verifySession(),
    body('fullName').isString().withMessage('Valid name is required'),
    body('email').isString().withMessage('Valid email is required'),
    body('designation').isString().withMessage('Valid designation is required'),
    body('organisation').isString().withMessage('Valid organisation is required'),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ errors: errors.array() });
        }

        try {
            const { dbType } = req.params;
            const downloadResults = await fullDownload(
                dbType,
                req.body.email,
                req.body.fullName,
                req.body.organisation,
                req.body.designation
            );
            res.writeHead(200, {
                'Content-Type': "application/zip",
            })
            res.end(downloadResults);
        } catch (error) {
            // microservice for logging. Use winston or other logging library
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json(error);
        }
    })



export default downloadRouter;
