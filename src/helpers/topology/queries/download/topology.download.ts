import JSZip from 'jszip';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { stringify } from 'csv-stringify/sync';

const prisma = new PrismaClient();

const downloadTopologyData = async (queryParameters: string) => {
    let query;
    if (queryParameters === "fulldb") {
        query = undefined;
    } else {
        query = queryParameters.split(',').map(value => {
            let idObject = { id: value };
            return (
                idObject
            )
        });
    }
    const downloadResults = await prisma.topology.findMany({
        where: {
            OR: query
        },
        select: {
            mxene: {
                select: {
                    mxene: true,
                    magneticMoment: true,
                    poscar_file: true,
                    bands_png: true,
                    bandGap: true,
                }
            },
            mag_state: true,
            magneticMoment: true,
            latticeConstant: true,
            socBandGap: true,
            soc_band: true,
            surf_img: true,
            berry_img: true,
            soc_calculated: true
        }
    });
    const zip = await createDownloadZip(downloadResults);
    return zip;
}

const createDownloadZip = async (downloadInformation: any) => {
    const zip = new JSZip();
    for (let searchResult = 0; searchResult < downloadInformation.length; searchResult++) {
        // reading file streams
        const filePOSCAR = fs.readFileSync(`${process.env.MXENE_DOWNLOAD_RESOLVER}/${downloadInformation[searchResult].mxene.poscar_file}`);
        const fileImage = fs.readFileSync(`${process.env.MXENE_DOWNLOAD_RESOLVER}/${downloadInformation[searchResult].mxene.bands_png}`);
        let surfImage = null;
        let berryImage = null;
        if (downloadInformation[searchResult].soc_calculated) {
            surfImage = fs.readFileSync(`${process.env.TOPOLOGY_DATA_RESOLVER}/${downloadInformation[searchResult].surf_img}`);
            berryImage = fs.readFileSync(`${process.env.TOPOLOGY_DATA_RESOLVER}/${downloadInformation[searchResult].berry_img}`);
        }
        const socBandImage = fs.readFileSync(`${process.env.TOPOLOGY_DATA_RESOLVER}/${downloadInformation[searchResult].soc_band}`);

        // creating a ZIP folder
        const zipFile = zip.folder(`${downloadInformation[searchResult].mxene.mxene}-topology`);

        //adding files to the ZIP folder
        zipFile.file(`${downloadInformation[searchResult].mxene.poscar_file}`, filePOSCAR);
        zipFile.file(`${downloadInformation[searchResult].mxene.bands_png}`, fileImage);
        zipFile.file(`${downloadInformation[searchResult].soc_band}`, socBandImage);
        if (surfImage !== null)
            zipFile.file(`${downloadInformation[searchResult].surf_img}`, surfImage);
        if (berryImage !== null)
            zipFile.file(`${downloadInformation[searchResult].berry_img}`, berryImage);

        //creating the required CSV file
        const data: any = [
            {
                name: downloadInformation[searchResult].mxene.mxene,
                band_gap: downloadInformation[searchResult].mxene.bandGap,
                magnetic_moment: downloadInformation[searchResult].mxene.magneticMoment,
                lattice_constant: downloadInformation[searchResult].latticeConstant,
            }
        ]
        if (downloadInformation[searchResult].soc_calculated) {
            data[0]['magnetic_ground_state'] = downloadInformation[searchResult].mag_state;
            data[0]['soc_band_gap'] = downloadInformation[searchResult].socBandGap;
        }
        const csv = stringify(data, { header: true });
        zipFile.file(`${downloadInformation[searchResult].mxene.mxene}.csv`, csv);
    }
    const zipFile = await zip.generateAsync({ type: 'base64' });
    return zipFile;
}


export default downloadTopologyData;