import JSZip from 'jszip';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { stringify } from 'csv-stringify/sync';

const prisma = new PrismaClient();

const downloadThermoData = async (queryParameters: string) => {
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
    const downloadResults = await prisma.thermoelectric.findMany({
        where: {
            OR: query
        },
        select: {
            bandGap: true,
            latticeConstant: true,
            spaceGroup: true,
            poscar_file: true,          
            elect_band_structure: true,      
            deform_potential: true,          
            elect_dos: true,                 
            elf: true,                       
            group_velo: true,                
            gru_param: true,                 
            lattice_conduc: true,            
            lattice_conduc_data: true,       
            phonon_band: true,               
            phonon_dos: true,                
            figure_of_merit: true,           
        }
    });
    const zip = await createDownloadZip(downloadResults);
    return zip;
}

const createDownloadZip = async (downloadInformation: any) => {
    const zip = new JSZip();
    for (let searchResult = 0; searchResult < downloadInformation.length; searchResult++) {
        // reading file streams
        const filePOSCAR = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].poscar_file}`);
        const elecBandStruct = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].elect_band_structure}`);
        const elecBandDOS = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].elect_dos}`);
        
        let deformPoten, elf, group_velo, gru_param, lattic_conduc, phonon_band, phononDOS = null;
        if (downloadInformation[searchResult].deform_potential)
            deformPoten = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].deform_potential}`);
        if (downloadInformation[searchResult].elf)
            elf = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].elf}`);
        if (downloadInformation[searchResult].group_velo)
            group_velo = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].group_velo}`);
        if (downloadInformation[searchResult].gru_param)
            gru_param = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].gru_param}`);
        if (downloadInformation[searchResult].lattic_conduc)
            lattic_conduc = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].lattic_conduc}`);
        if (downloadInformation[searchResult].phonon_band)
            phonon_band = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].phonon_band}`);
        if (downloadInformation[searchResult].phonon_dos)
            phononDOS = fs.readFileSync(`${process.env.THERMO_DATA_RESOLVER}/${downloadInformation[searchResult].phonon_dos}`);

        // creating a ZIP folder
        const zipFile = zip.folder(`Thermoelectric`);

        //adding files to the ZIP folder
        zipFile.file(`${downloadInformation[searchResult].poscar_file}`, filePOSCAR);
        zipFile.file(`${downloadInformation[searchResult].elect_band_structure}`, elecBandStruct);
        zipFile.file(`${downloadInformation[searchResult].elec_dos}`, elecBandDOS);
        if (deformPoten !== null)
            zipFile.file(`${downloadInformation[searchResult].deform_potential}`, deformPoten);
        if (elf !== null)
            zipFile.file(`${downloadInformation[searchResult].elf}`, elf);
        if (group_velo !== null)
            zipFile.file(`${downloadInformation[searchResult].group_velo}`, group_velo);
        if (gru_param !== null)
            zipFile.file(`${downloadInformation[searchResult].gru_param}`, gru_param);
        if (lattic_conduc !== null)
            zipFile.file(`${downloadInformation[searchResult].lattic_conduc}`, lattic_conduc);
        if (phonon_band !== null)
            zipFile.file(`${downloadInformation[searchResult].phonon_band}`, phonon_band);
        if (phononDOS !== null)
            zipFile.file(`${downloadInformation[searchResult].phonon_dos}`, phononDOS);

        //creating the required CSV file
        const data: any = [
            {
                band_gap: downloadInformation[searchResult].bandGap,
                lattice_constant: downloadInformation[searchResult].latticeConstant,
                space_group: downloadInformation[searchResult].space_group
            }
        ]
        const csv = stringify(data, { header: true });
        zipFile.file(`data.csv`, csv);
    }
    const zipFile = await zip.generateAsync({ type: 'base64' });
    return zipFile;
}


export default downloadThermoData;