
import { fullDownload } from '@helpers/extras';
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { verifySession } from "supertokens-node/recipe/session/framework/express";

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
        } catch (error) {
            // microservice for logging. Use winston or other logging library
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json(error);
        }
    })



export default downloadRouter;
