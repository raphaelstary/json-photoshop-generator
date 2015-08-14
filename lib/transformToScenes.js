var PSDocument = require('./PSDocument');
var LayerParser = require('./LayerParser');

function transformPSDocToScenes(psDocumentInfo) {
    "use strict";

    var doc = new PSDocument(psDocumentInfo);
    var animations = [];
    var parser = new LayerParser(doc, animations);

    var h5Document = {};

    doc.getRootLayers().forEach(function (layer) {
        if (!layer.artboard)
            return;

        doc.setArtboard(layer.artboard.artboardRect);

        var currentScene = {};
        h5Document[layer.name] = currentScene;
        currentScene.screen = {
            top: doc.getArtboard().top,
            left: doc.getArtboard().left,
            bottom: doc.getArtboard().bottom,
            right: doc.getArtboard().right,

            width: doc.getArtboard().right - doc.getArtboard().left,
            height: doc.getArtboard().bottom - doc.getArtboard().top
        };


        currentScene.drawables = parser.parseGroup(layer);


    });
    if (animations.length > 0)
        h5Document.animations = animations;

    return h5Document;
}

module.exports = transformPSDocToScenes;