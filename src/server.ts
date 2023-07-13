import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

// imports related to supertokens
import supertokens from "supertokens-node";
import { backendConfig } from "@services/Supertokens/config";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { middleware } from "supertokens-node/framework/express";
import { errorHandler } from "supertokens-node/framework/express";

//importing routes for mxene
import mxeneSearchRouter from "@routes/search/mxene";
import mxeneDownloadRouter from "@routes/download/mxene";
import mutateMxeneRouter from "@routes/mutate/mxene";
//importing routes for other services
import publicationsRouter from "@routes/extras/publications";
import updatesRouter from "@routes/extras/updates";
import faqRouter from "@routes/extras/faqs";
import emailRouter from "@routes/extras/email";
//importing helthcheck route
import healthCheckRouter from "@routes/extras/healthcheck";
import topologySearchRouter from "@routes/search/topology";
import topologyDownloadRouter from "@routes/download/topology";
import twoDSearchRouter from "@routes/search/twoD";
import twoDDownloadRouter from "@routes/download/twoDMaterial";
import suggestSearchRouter from "@routes/search/suggest";
import downloadRouter from "@routes/download/fullDbDownload";
import thermoSearchRouter from "@routes/search/thermo";
import thermoDownloadRouter from "@routes/download/thermo";

// iniitalizing express server
const server: Application = express();

// initialize supertokens for authentication
backendConfig();

// defining cors options
server.use(cors({
    origin: process.env.FRONTEND_URL,
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));
server.use(middleware());
server.use(mongoSanitize());
server.use(express.json({ limit: "10kb", strict: true, type: "application/json" }));
server.use(helmet());

// giving access to the pdb and the image forlder of the database folder publically
const pdb_file_locations = process.env.MXENE_DOWNLOAD_RESOLVER + "/pdb";
const band_images_locations = process.env.MXENE_DOWNLOAD_RESOLVER + "/band_plots";
const soc_bands_locations = process.env.TOPOLOGY_DATA_RESOLVER + "/soc_bands";
const surf_berry_locations = process.env.TOPOLOGY_DATA_RESOLVER + "/surf_berry";
const mxene_db_location = process.env.FULL_DB_LOCATION + "/mxene_database.zip";

// thermoelectric DB paths
const deform_poten = process.env.THERMO_DATA_RESOLVER + "/deform_poten";
const elec_bands = process.env.THERMO_DATA_RESOLVER + "/elec_bands";
const elect_dos = process.env.THERMO_DATA_RESOLVER + "/elec_dos";
const elf = process.env.THERMO_DATA_RESOLVER + "/elf";
const group_velo = process.env.THERMO_DATA_RESOLVER + "/group_velocity";
const gru_param = process.env.THERMO_DATA_RESOLVER + "/gru_params";
const lattic_conduc = process.env.THERMO_DATA_RESOLVER + "/lattice_conduc";
// const lattice_conduc_data = process.env.THERMO_DATA_RESOLVER + "/Lattice_Thermal_Conductivity_Data_Files";
const phonon_bands = process.env.THERMO_DATA_RESOLVER + "/phonon_bands";
const phonon_dos = process.env.THERMO_DATA_RESOLVER + "/phonon_dos";
const figure_of_merit = process.env.THERMO_DATA_RESOLVER + "/fig_of_merit";

const staticOptions = {
    dotfiles: 'deny',
    etag: true,
    immutable: true,
    maxAge: '1d',
}
server.use('/static/pdb', express.static(pdb_file_locations, staticOptions));
server.use('/static/image', express.static(band_images_locations, staticOptions));
server.use('/static/image/soc_bands', express.static(soc_bands_locations, staticOptions));
server.use('/static/image/surf_berry', express.static(surf_berry_locations, staticOptions));
server.use('/static/fulldb/mxene', express.static(mxene_db_location, staticOptions));
// thermoelectric DB paths
server.use('/static/image/elec_bands', express.static(elec_bands, staticOptions));
server.use('/static/image/deform_poten', express.static(deform_poten, staticOptions));
server.use('/static/image/elec_dos', express.static(elect_dos, staticOptions));
server.use('/static/image/elf', express.static(elf, staticOptions));
server.use('/static/image/group_velocity', express.static(group_velo, staticOptions));
server.use('/static/image/gru_params', express.static(gru_param, staticOptions));
server.use('/static/image/lattice_conduc', express.static(lattic_conduc, staticOptions));
server.use('/static/image/phonon_bands', express.static(phonon_bands, staticOptions));
server.use('/static/image/phonon_dos', express.static(phonon_dos, staticOptions));
server.use('/static/image/fig_of_merit', express.static(figure_of_merit, staticOptions));

// @route   GET /
// @desc    dummy route for testing
// @access  Public
server.get("/", (req: Request, res: Response) => {
    res.status(200).send("The application is healthy");
})

// mxene routes
server.use("/searchmxene", mxeneSearchRouter)
server.use("/downloadmxene", mxeneDownloadRouter)
server.use("/mutatemxene", mutateMxeneRouter)
// topology routes
server.use("/searchtopology", topologySearchRouter)
server.use("/downloadtopology", topologyDownloadRouter)
// 2D material routes
server.use("/search2D", twoDSearchRouter)
server.use("/download2D", twoDDownloadRouter)
// thermoelectric routes
server.use("/searchthermo", thermoSearchRouter);
server.use("/downloadthermo", thermoDownloadRouter);
// extra routes
server.use("/suggestsearch", suggestSearchRouter);
server.use("/publications", publicationsRouter)
server.use("/updates", updatesRouter)
server.use("/faqs", faqRouter)
server.use("/healthcheck", healthCheckRouter)
server.use("/email", emailRouter);
server.use("/dbdownload", downloadRouter);

// authentication routes
// @route   GET /sessioninfo
// @desc    information about the current session
// @access  Protected
server.get("/", verifySession(), async (req: Request, res: Response) => {
    let session = req.session;
    res.status(200).json({
        session: session,
        sessionHandle: session.getHandle(),
        userId: session.getUserId(),
        accessTokenPayload: session.getAccessTokenPayload(),
    });
});

server.use(errorHandler());

server.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send(err);
});

// @route   GET *
// @desc    Handle routing when no defined route is called
// @access  Public
server.get('*', (req: Request, res: Response) => {
    console.log("Something seems to be the issue")
    res.status(404).send("Nothing was found")
})

const port = process.env.PORT || 3002;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
