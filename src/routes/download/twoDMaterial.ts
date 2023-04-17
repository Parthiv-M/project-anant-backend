import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import download2DData from '@helpers/twoD/queries/download/twoD.download';
// import { verifySession } from "supertokens-node/recipe/session/framework/express";

const twoDDownloadRouter = Router();

// @route   GET /download2D/:id
// @desc    route to download 2D material
// @access  Protected
twoDDownloadRouter.get('/',
    param('id').isEmpty().withMessage('ID value is required'),
    // verifySession(),
    async (req: Request, res: Response) => {
        console.log(req.query)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ errors: errors.array() });
        }
        try {
            const { id } = req.query;
            const downloadResults = await download2DData(id.toString());
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



export default twoDDownloadRouter;
