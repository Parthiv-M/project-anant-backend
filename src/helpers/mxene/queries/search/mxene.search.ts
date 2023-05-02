import { searchObjects } from "@typeDeclarations/mxene"
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

const fetchMxeneDetails = async (searchParameters: searchObjects) => {
    const currentPage = searchParameters.currentPage;
    const isSuggest = searchParameters.isSuggest;
    const filteredSearchParameters: searchObjects = filterSearchResults(searchParameters);
    const SearchResults: any = await prisma.mxene.findMany({
        skip: !isSuggest ? (currentPage - 1) * 20 : 0,
        take: !isSuggest ? 20 : undefined,
        where: filteredSearchParameters,
        select: {
            id: true,
            mxene: true,
            bandGap: true,
            latticeConstant: true,
            magneticMoment: true,
        }
    })

    const totalResults = await prisma.mxene.count({
        where: filteredSearchParameters,
    })

    const totalPages = Math.ceil(totalResults / 20);

    const SearchResultObject: any = {
        mxenes: SearchResults,
    }

    if (!isSuggest) {
        SearchResultObject.currentPage = currentPage;
        SearchResultObject.totalPages = totalPages;
        SearchResultObject.totalResults = totalResults;
    }

    return SearchResultObject;
}


export default fetchMxeneDetails;
