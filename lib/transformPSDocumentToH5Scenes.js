var Vectors = require('./Vectors');

function startsWith(actualString, searchString) {
    return actualString.indexOf(searchString, 0) === 0;
}

function includes(actualString, searchString) {
    return actualString.indexOf(searchString) !== -1;
}

function transformPSDoc(psDocument) {

    var artboard;
    var placed = psDocument.placed;

    function getPlaced(smartObject) {
        var placedReference;
        var found = placed.some(function (placedObject) {
            if (placedObject.placedID == smartObject.ID) {
                placedReference = placedObject;
                return true;
            }
            return false;
        });
        if (found)
            return placedReference;
    }

    function isOpacitySet(layer) {
        return layer.blendOptions && layer.blendOptions.opacity;
    }

    function parseBasicImage(layer) {
        var width = layer.bounds.right - layer.bounds.left;
        var height = layer.bounds.bottom - layer.bounds.top;
        return {
            type: 'image',
            name: layer.name,
            x: Math.floor(layer.bounds.left + width / 2 - artboard.left),
            y: Math.floor(layer.bounds.top + height / 2 - artboard.top),
            width: width,
            height: height
        };
    }

    function parseSmartObject(layer) {
        var drawable = parseBasicImage(layer);

        var topLeft_x = Math.floor(layer.smartObject.transform[0]);
        var topLeft_y = Math.floor(layer.smartObject.transform[1]);
        var topRight_x = Math.floor(layer.smartObject.transform[2]);
        var topRight_y = Math.floor(layer.smartObject.transform[3]);

        var noRotation = (topLeft_x == layer.bounds.left || topLeft_x + 1 == layer.bounds.left) &&
            (topLeft_y == layer.bounds.top || topLeft_y + 1 == layer.bounds.top);

        if (!noRotation) {
            var vector = Vectors.get(topLeft_x, topLeft_y, topRight_x, topRight_y);
            drawable.rotation = Vectors.getAngle(vector.x, vector.y);
        }

        var original = getPlaced(layer.smartObject);
        var originalHeight = original.bounds.bottom - original.bounds.top;
        //var originalWidth = original.bounds.right - original.bounds.left;
        drawable.scale = drawable.height / originalHeight;

        if (isOpacitySet(layer)) {
            drawable.alpha = layer.blendOptions.opacity.value / 100;
        }

        return drawable;
    }

    function parseLayer(layer) {
        if (layer.smartObject) {
            return parseSmartObject(layer);

        } else if (layer.type == 'textLayer') {
            // text layer

        } else if (layer.type == 'shapeLayer') {
            // shape

        } else if (includes(layer.name, '.png')) {
            return parseBasicImage(layer);

        } else if (includes(layer.name, '#')) {
            // tagged layer - maybe input or other event
        }
    }

    function parseTaggedLayerGroup(layerGroup) {
        if (includes(layerGroup.name, '#button')) {
            // handle button

        } else if (includes(layerGroup.name, '#group')) {
            // handle anchor group
        }
        return [];
    }

    function parseLayerGroup(layerGroup) {
        var drawables = [];
        layerGroup.layers.forEach(function (layer) {
            if (layer.type == 'layer') {
                drawables.push(parseLayer(layer));

            } else if (layer.type == 'layerSection') {
                drawables.push.apply(drawables, parseGroup(layer));
            }
        });

        return drawables;
    }

    function parseGroup(layerGroup) {
        if (includes(layerGroup.name, '#')) {
            return parseTaggedLayerGroup(layerGroup);

        } else if (includes(layerGroup.name, '.png')) {
            return [parseBasicImage(layerGroup)];

        } else {
            return parseLayerGroup(layerGroup);
        }
    }

    function initialParse(document) {
        var h5Document = {};

        document.layers.forEach(function (layer) {
            if (layer.artboard) {
                artboard = layer.artboard.artboardRect;

                var currentScene = {};
                h5Document[layer.name] = currentScene;

                layer.layers.forEach(function (layer) {
                    if (layer.type == 'layerSection' && startsWith(layer.name, 'layer')) {
                        currentScene[layer.name] = parseLayerGroup(layer);
                    } // else skip
                });

            } // else skip
        });

        return h5Document;
    }

    return initialParse(psDocument);
}

module.exports = transformPSDoc;