function startsWith(actualString, searchString) {
    return actualString.indexOf(searchString, 0) === 0;
}

function includes(actualString, searchString) {
    return actualString.indexOf(searchString) !== -1;
}

function parseLayer(layer) {

}

function parseTaggedLayerGroup(layerGroup) {
    if (includes(layerGroup.name, '#button')) {
        // handle button

    } else if (includes(layerGroup.name, '#group')) {
        // handle anchor group
    }
}

function parseLayerGroup(layerGroup) {
    layerGroup.layers.forEach(function (layer) {
        if (layer.type == 'layer') {
            parseLayer(layer);

        } else if (layer.type == 'layerSection') {
            parseGroup(layer);
        }
    });
}

function parseGroup(layerGroup) {
    if (includes(layerGroup.name, '#')) {
        parseTaggedLayerGroup(layerGroup);

    } else {
        parseLayerGroup(layerGroup);
    }
}


exports.module = function (psDocument) {
    var h5Document = {};
    psDocument.layers.forEach(function (layer) {
        if (layer.artboard) {
            var currentScene = {};
            h5Document[layer.name] = currentScene;

            layer.layers.forEach(function (layer) {
                if (layer.type == 'layerSection' && startsWith(layer.name, 'layer')) {
                    var drawables = [];
                    currentScene[layer.name] = drawables;

                    layer.layers.forEach(function (layer) {
                        if (layer.type == 'layerSection') {
                            parseGroup(layer);
                        } else {
                            parseLayer(layer);
                        }
                    });
                } // else skip
            });

        } // else skip
    });
};