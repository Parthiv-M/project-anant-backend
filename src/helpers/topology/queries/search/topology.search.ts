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

const fetchTopologyDetails = async (searchParameters: searchObjects) => {
    const currentPage = searchParameters.currentPage;
    const isSuggest = searchParameters.isSuggest;
    const filteredSearchParameters: searchObjects = filterSearchResults(searchParameters);
    const SearchResults: any = await prisma.topology.findMany({
        skip: !isSuggest ? (currentPage - 1) * 20 : 0,
        take: !isSuggest ? 20 : undefined,
        where: filteredSearchParameters,
        select: {
            id: true,
            latticeConstant: true,
            socBandGap: true,
            mxene: {
                select: {
                    id: true,
                    mxene: true,
                    M1: true,
                    M2: true,
                    X: true,
                    T1: true,
                    T2: true,
                    bandGap: true,
                }
            }
        },
    })

    const totalResults = SearchResults.filter((result: any) => result.mxene !== null);

    const totalPages = Math.ceil(totalResults.length / 20);

    const SearchResultObject: any = {
        topologyMxenes: SearchResults.filter((result: any) => result.mxene !== null)
    }

    if (!isSuggest) {
        SearchResultObject.totalResults = totalResults.length;
        SearchResultObject.currentPage = currentPage;
        SearchResultObject.totalPages = totalPages;
    }

    return SearchResultObject;
}

export default fetchTopologyDetails;