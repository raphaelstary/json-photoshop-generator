var PSDocument = require('./PSDocument');
var LayerParser = require('./LayerParser');

var transformSmartObjects = (function (PSDocument, LayerParser) {
    "use strict";

    return function (ids, psDocumentInfo, placedInfo) {
        psDocumentInfo.placed = placedInfo;
        var document = new PSDocument(psDocumentInfo);
        var parser = new LayerParser(document);

        var smartObjects = [];
        ids.forEach(function (idWrapper) {
            var layer = document.getLayer(idWrapper.id);
            document.setArtboard(idWrapper.artboard);

            smartObjects.push(parser.parseSmartObject(layer));
        });
        return smartObjects;
    };
})(PSDocument, LayerParser);

module.exports = transformSmartObjects;