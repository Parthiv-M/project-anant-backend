import { searchObjects } from "@typeDeclarations/mxene"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

// function to remove empty keys from the object
const filterSearchResults = (searchParameters: searchObjects) => {
    Object.keys(searchParameters).forEach((key: string) => {
        if (searchParameters[key as keyof searchObjects] === '') {
            delete searchParameters[key as keyof searchObjects];
        }
    });
    return searchParameters;
}

const fetchMxeneDetails = async (searchParameters: searchObjects) => {
    const filteredSearchParameters: searchObjects = filterSearchResults(searchParameters);
    console.log("Reached here")
    const SearchResults: any = await prisma.mxene.findMany({
        where: filteredSearchParameters,
        select: {
            id: true,
            M1: true,
            M2: true,
            X: true,
            T1: true,
            T2: true,
            mxene: true,
            bandGap: true,
            latticeConstant: true,
            magneticMoment: true,
            isMetallic: true,
        }
    })
    return SearchResults;
}


export default fetchMxeneDetails;
