import suggestSearch from "@helpers/functions/suggestive_search/suggest.search";
import SuggestSearchProps from "@typeDeclarations/suggestSearch";
import { Router } from "express";

const suggestSearchRouter = Router();

suggestSearchRouter.post("/", async (req, res) => {
    try {
        const searchParameters = req.body;
        const type = searchParameters.type;
        delete searchParameters.type;
        const suggestParams: SuggestSearchProps = {
            searchParameters,
            responseElementName: "",
            toSuggestFieldName: "",
            maxIndex: null
        }
        if (type === "mxene") {
            suggestParams.responseElementName = "mxenes";
            suggestParams.toSuggestFieldName = "mxene";
            suggestParams.maxIndex = 5;
        } else if (type === "topology") {
            suggestParams.responseElementName = "topologyMxenes";
            suggestParams.toSuggestFieldName = "mxene";
            suggestParams.maxIndex = 5;
        } else if (type === "2d") {
            suggestParams.responseElementName = "twoDmaterials";
            suggestParams.toSuggestFieldName = "compound";
            suggestParams.maxIndex = 3;
        } else if (type === "thermo") {
            suggestParams.responseElementName = "thermoMaterials";
            suggestParams.toSuggestFieldName = "materialForSearch";
            suggestParams.maxIndex = 5;
        }
        const suggestSearchResults
            = await suggestSearch(suggestParams);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(suggestSearchResults);
    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json(error);
    }
});

export default suggestSearchRouter;