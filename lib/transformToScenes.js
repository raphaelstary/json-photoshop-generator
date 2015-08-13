var PSDocument = require('./PSDocument');
var LayerParser = require('./LayerParser');

function transformPSDoc(psDocumentInfo) {

    var doc = new PSDocument(psDocumentInfo);
    var parser = new LayerParser(doc);

    function initialParse(document) {
        var h5Document = {};

        document.layers.forEach(function (layer) {
            if (layer.artboard) {
                doc.setArtboard(layer.artboard.artboardRect);

                var currentScene = {};
                h5Document[layer.name] = currentScene;
                currentScene.screen = {
                    top: doc.getArtboard().top,
                    left: doc.getArtboard().left,
                    width: doc.getArtboard().right - doc.getArtboard().left,
                    height: doc.getArtboard().bottom - doc.getArtboard().top
                };
                var animations = [];

                currentScene.drawables = parser.parseGroup(layer, animations);

                if (animations.length > 0)
                    currentScene.animations = animations;

            } // else skip
        });

        return h5Document;
    }

    return initialParse(psDocumentInfo);
}

module.exports = transformPSDoc;