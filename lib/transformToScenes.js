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
        var artboard = doc.getArtboard();
        currentScene.screen = {
            top: artboard.top,
            left: artboard.left,
            bottom: artboard.bottom,
            right: artboard.right,

            width: artboard.right - artboard.left,
            height: artboard.bottom - artboard.top
        };


        currentScene.drawables = parser.parseGroup(layer);


    });
    if (animations.length > 0)
        h5Document.animations = animations;

    return h5Document;
}

module.exports = transformPSDocToScenes;