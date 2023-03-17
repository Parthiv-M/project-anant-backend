import { generate_pdb_file } from '@helpers/functions';
import { fetchTopologyDetails, singleTopologySearch, singleTopologySearchByMxene } from '@helpers/topology/queries';
import { Router, Request, Response } from 'express';
import { body, param, validationResult } from "express-validator";
import fs from "fs";

const topologySearchRouter = Router();

topologySearchRouter.post('/',
    body('M1').isString().withMessage('Valid M1 value is required'),
    body('M2').isString().withMessage('Valid M2 value is required'),
    body('X').isString().withMessage('Valid X value is required'),
    body('T1').isString().withMessage('Valid T1 value is required'),
    body('T2').isString().withMessage('Valid T2 value is required'),
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).json({ errors: errors.array() });
            }
            const searchParameters = req.body;
            const searchResults = await fetchTopologyDetails(searchParameters);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(searchResults);
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json(error);
        }
    });

topologySearchRouter.get('/searchbyid/:id',
    param('id').isString().withMessage('Valid id is required'),
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).json({ errors: errors.array() });
            }
            const searchResults = await singleTopologySearch({ id: req.params.id });
            const poscar_data = fs.readFileSync(`${process.env.MXENE_DOWNLOAD_RESOLVER}/${searchResults[0].mxene.poscar_file}`, 'utf8');
            const pdb_file_content = await generate_pdb_file(`${process.env.MXENE_DOWNLOAD_RESOLVER}/${searchResults[0].mxene.poscar_file}`, process.env.PDB_FILE_RESOLVER);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({
                mxene: searchResults[0].mxene.mxene,
                mxeneId: searchResults[0].mxene.id,
                bandGap: searchResults[0].mxene.bandGap,
                magneticMoment: searchResults[0].mxene.magneticMoment,
                magneticState: searchResults[0].mag_state,
                topologicalProperties: searchResults[0].top_props,
                isSoc: searchResults[0].soc_calculated,
                socBandGap: searchResults[0].socBandGap,
                latticeConstant: searchResults[0].latticeConstant,
                socMagneticMoment: searchResults[0].magneticMoment,
                bandImage: "/static/image/" + searchResults[0].mxene.bands_png.split("/")[1],
                socBandImage: "/static/image/soc_bands/" + searchResults[0].soc_band.split("/")[1],
                berryStateImage: "/static/image/surf_berry/" + searchResults[0].berry_img.split("/")[1] + "/" + searchResults[0].berry_img.split("/")[2],
                surfStateImage: "/static/image/surf_berry/" + searchResults[0].surf_img.split("/")[1] + "/" + searchResults[0].surf_img.split("/")[2],
                poscar_data: poscar_data,
                pdb_file_content: pdb_file_content
            });
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json(error);
        }
    });

topologySearchRouter.get('/searchbymxeneid/:id',
    param('id').isString().withMessage('Valid id is required'),
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).json({ errors: errors.array() });
            }
            const searchResults = await singleTopologySearchByMxene(req.params.id);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({
                id: searchResults[0].id
            });
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json(error);
        }
    });
export default topologySearchRouter;