import { searchObjects } from "@typeDeclarations/thermo"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

// function to remove empty keys from the object
const filterSearchResults = (searchParameters: searchObjects) => {
    Object.keys(searchParameters).forEach((key: string) => {
        if (key === 'currentPage' || key === 'isSuggest' || searchParameters[key as keyof searchObjects].toString() === '') {
            delete searchParameters[key as keyof searchObjects];
        }
    });
    return searchParameters;
}

const fetchThermoDetails = async (searchParameters: searchObjects) => {
    const currentPage = searchParameters.currentPage;
    const isSuggest = searchParameters.isSuggest;
    const filteredSearchParameters: searchObjects = filterSearchResults(searchParameters);
    const SearchResults: any = await prisma.thermoelectric.findMany({
        skip: !isSuggest ? (currentPage - 1) * 20 : 0,
        take: !isSuggest ? 20 : undefined,
        where: filteredSearchParameters,
        select: {
            id: true,
            materialFull: true,
            materialForSearch: true,
            bandGap: true,
            latticeConstant: true,
            spaceGroup: true
        }
    })

    const totalResults = await prisma.thermoelectric.count({
        where: filteredSearchParameters,
    });

    const totalPages = Math.ceil(totalResults / 20);

    const SearchResultObject: any = {
        thermoMaterials: SearchResults,
    }

    if (!isSuggest) {
        SearchResultObject.currentPage = currentPage;
        SearchResultObject.totalPages = totalPages;
        SearchResultObject.totalResults = totalResults;
    }

    return SearchResultObject;
}


export default fetchThermoDetails;
