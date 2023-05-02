import fetch2DDetails from "@helpers/twoD/queries/search/twoD.search";
import { fetchTopologyDetails } from "@helpers/topology/queries";
import { fetchMxeneDetails } from "@helpers/mxene/queries";
import SuggestSearchProps from "@typeDeclarations/suggestSearch";

const suggestSearch = async (suggestSearchProps: SuggestSearchProps) => {
    const { searchParameters, responseElementName, toSuggestFieldName, maxIndex } = suggestSearchProps;
    // array to store the suggestions
    let suggestArray: any = [];
    // array that shows which indexes do not require suggestion
    let indexesFull: any = [];
    // array that contains the original indexes for each type
    let origIndexes: any = [];
    // array that held each suggested item 
    let itemsArray: any = [];
    // array that held all search results
    let searchResults: any = null;

    switch (responseElementName) {
        case "mxenes":
            origIndexes = ["M1", "M2", "X", "T1", "T2"];
            if (searchParameters.M1 && searchParameters.M1 !== "") {
                indexesFull.push(1);
            }
            if (searchParameters.M2 && searchParameters.M2 !== "") {
                indexesFull.push(2);
            }
            if (searchParameters.X && searchParameters.X !== "") {
                indexesFull.push(3);
            }
            if (searchParameters.T1 && searchParameters.T1 !== "") {
                indexesFull.push(4);
            }
            if (searchParameters.T2 && searchParameters.T2 !== "") {
                indexesFull.push(5);
            }
            searchResults = await fetchMxeneDetails(searchParameters);
            searchResults[responseElementName].forEach((item: any) => {
                itemsArray.push(item[toSuggestFieldName]);
            });
            delete searchResults[responseElementName];
            break;
        case "topologyMxenes":
            origIndexes = ["M1", "M2", "X", "T1", "T2"];
            if (searchParameters.M1 && searchParameters.M1 !== "") {
                indexesFull.push(1);
            }
            if (searchParameters.M2 && searchParameters.M2 !== "") {
                indexesFull.push(2);
            }
            if (searchParameters.X && searchParameters.X !== "") {
                indexesFull.push(3);
            }
            if (searchParameters.T1 && searchParameters.T1 !== "") {
                indexesFull.push(4);
            }
            if (searchParameters.T2 && searchParameters.T2 !== "") {
                indexesFull.push(5);
            }
            searchResults = await fetchTopologyDetails(searchParameters);
            searchResults[responseElementName].forEach((item: any) => {
                itemsArray.push(item[toSuggestFieldName].mxene);
            });
            delete searchResults[responseElementName];
            break;
        case "twoDmaterials":
            origIndexes = ["F1", "F2", "M"];
            if (searchParameters.F1 && searchParameters.F1 !== "") {
                indexesFull.push(1);
            }
            if (searchParameters.F2 && searchParameters.F2 !== "") {
                indexesFull.push(2);
            }
            if (searchParameters.M && searchParameters.M !== "") {
                indexesFull.push(3);
            }
            searchResults = await fetch2DDetails(searchParameters);
            searchResults[responseElementName].forEach((item: any) => {
                itemsArray.push(item[toSuggestFieldName]);
            });
            delete searchResults[responseElementName];
            break;
        default:
            indexesFull = [];
            break;
    }

    let index = 1;
    // traverse all possible indexes
    while (index <= maxIndex) {
        // if the index requires suggestion (i.e not a filled index)
        if (!indexesFull.includes(index)) {
            let indexSuggest: any = {};
            indexSuggest[index] = [];
            // get every possible value for that index for the list of items
            itemsArray.forEach((item: any) => {
                if (indexSuggest[index].indexOf(item.split("-")[index - 1]) === -1)
                    indexSuggest[index].push(item.split("-")[index - 1]);
            });
            // replace the index number with the required "key" for the frontend
            delete Object.assign(indexSuggest, { [origIndexes[index - 1]]: indexSuggest[index] })[index];
            suggestArray.push(indexSuggest);
        }
        index++;
    }

    searchResults["suggestions"] = {}

    // destructure the array of objects into different objects
    // [ { key1: [ value ] }, { key2: [ value1, value2 ] } ]
    // changes to => { key: [ value ], key2: [ value1, value2 ] }
    suggestArray.forEach((obj: any) => {
        searchResults.suggestions[Object.keys(obj)[0]] = obj[Object.keys(obj)[0]];
    });
    return searchResults;
}

export default suggestSearch;