import { searchObjects } from "@typeDeclarations/twoDMaterial"
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

const fetch2DDetails = async (searchParameters: searchObjects) => {
    const currentPage = searchParameters.currentPage;
    const isSuggest = searchParameters.isSuggest;
    const filteredSearchParameters: searchObjects = filterSearchResults(searchParameters);
    const SearchResults: any = await prisma.twoDMaterial.findMany({
        skip: !isSuggest ? (currentPage - 1) * 20 : 0,
        take: !isSuggest ? 20 : undefined,
        where: filteredSearchParameters,
        select: {
            id: true,
            compound: true,
            latticeParam: true,
            formationEnergy: true,
            eHull: true,
            phononFreq: true,
            poscar_data: true
        },
    })

    const totalResults = SearchResults.filter((result: any) => result.mxene !== null);

    const totalPages = Math.ceil(totalResults.length / 20);

    const SearchResultObject: any = {
        twoDmaterials: SearchResults.filter((result: any) => result.mxene !== null),
    }

    if (!isSuggest) {
        SearchResultObject.currentPage = currentPage;
        SearchResultObject.totalPages = totalPages;
        SearchResultObject.totalResults = totalResults.length;
    }

    return SearchResultObject;
}

export default fetch2DDetails;