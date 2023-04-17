import { generate_pdb_file } from '@helpers/functions';
import { single2DSearch } from '@helpers/twoD/queries/search/single.search';
import fetch2DDetails from '@helpers/twoD/queries/search/twoD.search';
import { Router, Request, Response } from 'express';
import { body, param, validationResult } from "express-validator";
import fs from "fs";

const twoDSearchRouter = Router();

twoDSearchRouter.post('/',
    body('F1').isString().withMessage('Valid F1 value is required'),
    body('F2').isString().withMessage('Valid F2 value is required'),
    body('M').isString().withMessage('Valid M value is required'),
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).json({ errors: errors.array() });
            }
            const searchParameters = req.body;
            const searchResults = await fetch2DDetails(searchParameters);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(searchResults);
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json(error);
        }
    });

twoDSearchRouter.get('/searchbyid/:id',
    param('id').isString().withMessage('Valid id is required'),
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).json({ errors: errors.array() });
            }
            const searchResults = await single2DSearch({ id: req.params.id });
            const poscar_data = fs.readFileSync(`${process.env.TWO_D_MATERIAL_RESOLVER}/${searchResults[0].poscar_data}`, 'utf8');
            const pdb_file_content = await generate_pdb_file(`${process.env.TWO_D_MATERIAL_RESOLVER}/${searchResults[0].poscar_data}`, process.env.PDB_FILE_RESOLVER);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({
                "compound": searchResults[0].compound,
                "eHull": searchResults[0].eHull,
                "latticeParam": searchResults[0].latticeParam,
                "formationEnergy": searchResults[0].formationEnergy,
                "phononFreq": searchResults[0].phononFreq,
                "poscar_data": poscar_data,
                "pdb_file_content": pdb_file_content
            });
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json(error);
        }
    });

export default twoDSearchRouter;