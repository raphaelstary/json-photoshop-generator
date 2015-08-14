var PSDocument = (function () {
    "use strict";

    function PSDocument(documentInfo) {
        this.__psDoc = documentInfo;

        this.placed = documentInfo.placed;
    }

    PSDocument.prototype.setArtboard = function (artboardRect) {
        this.artboard = artboardRect;
    };

    PSDocument.prototype.getArtboard = function () {
        return this.artboard;
    };

    PSDocument.prototype.getPlaced = function (smartObject) {
        var placedReference;
        var found = this.placed.some(function (placedObject) {
            if (placedObject.placedID == smartObject.ID) {
                placedReference = placedObject;
                return true;
            }
            return false;
        });
        if (found)
            return placedReference;
    };

    PSDocument.prototype.getRootLayers = function () {
        return this.__psDoc.layers;
    };

    PSDocument.prototype.getLayer = function (id) {
        var requestedLayer;

        function findLayer(layer) {
            var foundLayer = layer.id == id;
            if (foundLayer) {
                requestedLayer = layer;
                return true;
            }
            if (layer.layers) {
                foundLayer = layer.layers.some(findLayer);
            }
            return foundLayer;
        }

        var foundIt = this.__psDoc.layers.some(findLayer);
        if (foundIt)
            return requestedLayer;
    };

    return PSDocument;
})();

module.exports = PSDocument;