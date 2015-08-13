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

    return PSDocument;
})();

module.exports = PSDocument;