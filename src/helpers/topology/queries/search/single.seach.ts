import { PrismaClient } from '@prisma/client'
import { searchById } from '@typeDeclarations/mxene';
const prisma = new PrismaClient();

const singleTopologySearch = async (searchParameters: searchById) => {
    const SearchResults = await prisma.topology.findMany({
        where: { id: searchParameters.id },
        select: {
            id: true,
            mxene: true,
            berry_img: true,
            surf_img: true,
            soc_band: true,
            mag_state: true,
            latticeConstant: true,
            magneticMoment: true,
            socBandGap: true,
            top_props: true,
            soc_calculated: true,
        }
    });
    return SearchResults;
}

const singleTopologySearchByMxene = async (id: string) => {
    const SearchResults = await prisma.topology.findMany({
        where: { mxeneId: id },
        select: {
            id: true,
        }
    });
    return SearchResults;
}

export {
    singleTopologySearch,
    singleTopologySearchByMxene
};