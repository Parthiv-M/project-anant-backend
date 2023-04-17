import { PrismaClient } from '@prisma/client'
import { searchById } from '@typeDeclarations/mxene';
const prisma = new PrismaClient();

const single2DSearch = async (searchParameters: searchById) => {
    const SearchResults = await prisma.twoDMaterial.findMany({
        where: { id: searchParameters.id },
        select: {
            id: true,
            compound: true,
            latticeParam: true,
            formationEnergy: true,
            eHull: true,
            phononFreq: true,
            poscar_data: true
        },
    });
    return SearchResults;
}

export {
    single2DSearch
};