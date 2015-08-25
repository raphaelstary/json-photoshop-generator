var PSDocument = require('./PSDocument');
var LayerParser = require('./LayerParser');

var transformSmartObjects = (function (PSDocument, LayerParser) {
    "use strict";

    function transformToFrame(smartObject, currentTime) {
        return {
            id: smartObject.referenceId,
            frame: {
                time: currentTime,
                x: smartObject.x,
                y: smartObject.y,
                scale: smartObject.scale,
                rotation: smartObject.rotation
            }
        };
    }

    return function (ids, psDocumentInfo, placedInfo, currentTime) {
        psDocumentInfo.placed = placedInfo;
        var document = new PSDocument(psDocumentInfo);
        var parser = new LayerParser(document);

        var smartObjectFrames = [];
        ids.forEach(function (idWrapper) {
            var layer = document.getLayer(idWrapper.id);
            document.setArtboard(idWrapper.artboard);

            var parsedSmartObject = parser.parseSmartObject(layer);
            var frameWrapper = transformToFrame(parsedSmartObject, currentTime);
            smartObjectFrames.push(frameWrapper);
        });

        return smartObjectFrames;
    };
})(PSDocument, LayerParser);

module.exports = transformSmartObjects;