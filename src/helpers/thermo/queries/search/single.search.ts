import { PrismaClient } from '@prisma/client'
import { searchById } from '@typeDeclarations/mxene';
const prisma = new PrismaClient();

const singleThermoSearch = async (searchParameters: searchById) => {
    const SearchResults = await prisma.thermoelectric.findMany({
        where: { id: searchParameters.id },
    });
    return SearchResults;
}

export {
    singleThermoSearch,
};