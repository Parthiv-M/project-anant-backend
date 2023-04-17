import JSZip from 'jszip';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { stringify } from 'csv-stringify/sync';

const prisma = new PrismaClient();

const download2DData = async (queryParameters: string) => {
    const query = queryParameters.split(',').map(value => {
        let idObject = { id: value };
        return (
            idObject
        )
    });
    const downloadResults = await prisma.twoDMaterial.findMany({
        where: {
            OR: query
        },
        select: {
            compound: true,
            latticeParam: true,
            formationEnergy: true,
            eHull: true,
            phononFreq: true,
            poscar_data: true
        }
    });
    const zip = await createDownloadZip(downloadResults);
    return zip;
}

const createDownloadZip = async (downloadInformation: any) => {
    const zip = new JSZip();
    for (let searchResult = 0; searchResult < downloadInformation.length; searchResult++) {
        // reading file streams
        const filePOSCAR = fs.readFileSync(`${process.env.TWO_D_MATERIAL_RESOLVER}/${downloadInformation[searchResult].poscar_data}`);

        // creating a ZIP folder
        const zipFile = zip.folder(`${downloadInformation[searchResult].compound}-2D`);

        //adding files to the ZIP folder
        zipFile.file(`${downloadInformation[searchResult].poscar_data}`, filePOSCAR);

        //creating the required CSV file
        const data: any = [
            {
                name: downloadInformation[searchResult].compound,
                lattice_constant: downloadInformation[searchResult].latticeParam,
                formationEnergy: downloadInformation[searchResult].formationEnergy,
                eAboveHull: downloadInformation[searchResult].eHull,
                phononFrequency: downloadInformation[searchResult].phononFreq
            }
        ]
        const csv = stringify(data, { header: true });
        zipFile.file(`${downloadInformation[searchResult].compound}.csv`, csv);
    }
    const zipFile = await zip.generateAsync({ type: 'base64' });
    console.log(zipFile)
    return zipFile;
}


export default download2DData;