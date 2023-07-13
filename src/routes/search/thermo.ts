import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { generate_pdb_file } from "@helpers/functions"
import fs from 'fs';
import { fetchThermoDetails, singleThermoSearch } from '@helpers/thermo/queries';

const thermoSearchRouter = Router();

// @route   POST /searchthermo
// @desc    Route to find all mxene in the database that match the search query
// @access  Public
thermoSearchRouter.post('/',
    body('E1').isString().withMessage('Valid E1 value is required'),
    body('E2').isString().withMessage('Valid E1 value is required'),
    body('E3').isString().withMessage('Valid E1 value is required'),
    body('E4').isString().withMessage('Valid E1 value is required'),
    body('E5').isString().withMessage('Valid E1 value is required'),
    body('currentPage').isNumeric().withMessage('Current Page value is required')
    , async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.setHeader('Content-Type', 'application/json');
                res.status(400).json({ errors: errors.array() });
            }
            const searchParameters = req.body;
            const searchResults = await fetchThermoDetails(searchParameters);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(searchResults);
        } catch (error) {
            // microservice for logging. Use winston or other logging library
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json(error);
        }
    })

// @route   GET /searchthermo/searchbyid/:id
// @desc    Route find a single thermoelectric material in the database
// @access  Public
thermoSearchRouter.get('/searchbyid/:id',
    param('id').isString().withMessage('Valid id is required'),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({ errors: errors.array() });
        }
        try {
            const searchResults = await singleThermoSearch({ id: req.params.id });
            const poscar_data = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${searchResults[0].poscar_file}`, 'utf8');
            const pdb_file_content = await generate_pdb_file(`${process.env.THERMO_DATA_RESOLVER}/${searchResults[0].poscar_file}`, process.env.PDB_FILE_RESOLVER);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({
                material: searchResults[0].materialFull,
                latticeConstant: searchResults[0].latticeConstant,
                bandGap: searchResults[0].bandGap,
                spaceGroup: searchResults[0].spaceGroup,
                poscar_data,
                pdb_file_content,
                elect_band_structure: "/static/image/" + searchResults[0].elect_band_structure,
                deform_potential: "/static/image/" + searchResults[0].deform_potential,
                elect_dos: "/static/image/" + searchResults[0].elect_dos,
                elf: "/static/image/" + searchResults[0].elf,
                group_velocity: "/static/image/" + searchResults[0].group_velo,
                gru_param: "/static/image/" + searchResults[0].gru_param,
                lattice_conduc: "/static/image/" + searchResults[0].lattice_conduc,
                phonon_bands: "/static/image/" + searchResults[0].phonon_band,
                phonon_dos: "/static/image/" + searchResults[0].phonon_dos,
                figure_of_merit: "/static/image/" + searchResults[0].figure_of_merit
            });
        } catch (error) {
            // microservice for logging. Use winston or other logging library
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json(error);
        }
    })

export default thermoSearchRouter;
