import { downloadTopologyData } from '@helpers/topology/queries';
import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import { verifySession } from "supertokens-node/recipe/session/framework/express";

const topologyDownloadRouter = Router();

// @route   GET /downloadtopology/:id
// @desc    route to download topology data
// @access  Protected
topologyDownloadRouter.get('/',
    param('id').isEmpty().withMessage('ID value is required'),
    verifySession(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ errors: errors.array() });
        }
        try {
            const { id } = req.query;
            const downloadResults = await downloadTopologyData(id.toString());
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



export default topologyDownloadRouter;
