var Vectors = require('./Vectors');

function startsWith(actualString, searchString) {
    return actualString.indexOf(searchString, 0) === 0;
}

function includes(actualString, searchString) {
    return actualString.indexOf(searchString) !== -1;
}

function componentToHex(color) {
    var hex = Math.floor(color).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(red, green, blue) {
    return "#" + componentToHex(red || 0) + componentToHex(green || 0) + componentToHex(blue || 0);
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

    function setOpacity(layer, drawable) {
        if (isOpacitySet(layer)) {
            drawable.alpha = layer.blendOptions.opacity.value / 100;
        }
    }

    function setRotation(layer, drawable, topLeft_x, topLeft_y, topRight_x, topRight_y, optionalVector) {
        var isRotation = !((topLeft_x == layer.bounds.left || topLeft_x + 1 == layer.bounds.left) &&
        (topLeft_y == layer.bounds.top || topLeft_y + 1 == layer.bounds.top));

        if (isRotation) {
            var vector = optionalVector || Vectors.get(topLeft_x, topLeft_y, topRight_x, topRight_y);
            drawable.rotation = Vectors.getAngle(vector.x, vector.y);
        }

        return isRotation;
    }

    function setMatrixRotation(drawable, transformMatrix) {
        if (!transformMatrix || (transformMatrix.xy == 0 && transformMatrix.yy == 1))
            return;

        drawable.rotation = Math.atan2(transformMatrix.xy, transformMatrix.yy);
    }

    function setTaggedId(layer, drawable) {
        if (includes(layer.name, '#id')) {
            layer.name.split(' ').some(function (part) {
                if (includes(part, '#id')) {
                    drawable.viewId = part.split(':')[1];
                    return true;
                }
                return false;
            });
        }
    }

    function setTaggedZIndex(layer, drawable) {
        if (includes(layer.name, '#zIndex')) {
            layer.name.split(' ').some(function (part) {
                if (includes(part, '#zIndex')) {
                    drawable.zIndex = parseInt(part.split(':')[1]);
                    return true;
                }
                return false;
            });
        }
    }

    function setGroupTaggedZIndex(drawable, tags) {
        var zIndex;
        if (tags.some(function (tag) {
                var foundSmth = tag.zIndex !== undefined;
                if (foundSmth)
                    zIndex = tag.zIndex;
                return foundSmth;
            }) && !drawable.zIndex) {
            drawable.zIndex = parseInt(zIndex);
        }
    }

    function referenceAnimationTagging(drawable, tags, animations) {
        if (tags.some(function (tag) {
                return tag == 'animation';
            })) {
            animations.push(drawable.referenceId);
        }
    }

    function parseTags(nameParts) {
        var tags = [];
        nameParts.forEach(function (part) {
            if (includes(part, '#')) {
                var tagParts = part.split(':');
                if (tagParts.length > 1) {
                    var tag = {};
                    tag[tagParts[0].substr(1)] = tagParts[1];
                    tags.push(tag);
                } else {
                    tags.push(tagParts[0].substr(1));
                }
            }
        });
        return tags;
    }

    function parseBasicImage(layer, animations) {
        var width = layer.bounds.right - layer.bounds.left;
        var height = layer.bounds.bottom - layer.bounds.top;

        var nameParts = layer.name.split(' ');

        var tags = parseTags(nameParts);

        var drawable = {
            type: 'image',
            x: Math.floor(layer.bounds.left + width / 2 - artboard.left),
            y: Math.floor(layer.bounds.top + height / 2 - artboard.top),
            width: width,
            height: height,
            referenceId: layer.id
        };

        if (includes(nameParts[0], '.png')) {
            drawable.filename = nameParts[0];
        }
        if (tags.length > 0) {
            drawable.tags = tags;
            setTaggedId(layer, drawable);
            setTaggedZIndex(layer, drawable);
            referenceAnimationTagging(drawable, tags, animations);
        }

        return drawable;
    }

    function parseRectangle(layer, animations) {
        var drawable = parseBasicImage(layer, animations);
        drawable.type = 'rectangle';

        setOpacity(layer, drawable);
        drawable.filled = layer.fill !== undefined;
        if (layer.strokeStyle) {
            drawable.filled = layer.strokeStyle.fillEnabled;
        }
        var color = drawable.filled ? layer.fill.color : layer.strokeStyle.strokeStyleContent.color;
        drawable.color = rgbToHex(color.red, color.green, color.blue);

        return drawable;
    }

    function parseText(layer, animations) {
        var drawable = parseBasicImage(layer, animations);
        drawable.type = 'text';
        drawable.msg = layer.text.textKey;

        setOpacity(layer, drawable);
        setMatrixRotation(drawable, layer.text.transform);
        var style = layer.text.textStyleRange[0].textStyle; // apply only style of 1st style range
        drawable.font = style.fontName;
        drawable.size = style.size.value; // maybe px vs pt issues
        drawable.color = rgbToHex(style.color.red, style.color.green, style.color.blue);

        return drawable;
    }

    function parseSmartObject(layer, animations) {
        var drawable = parseBasicImage(layer, animations);

        var topLeft_x = Math.floor(layer.smartObject.transform[0]);
        var topLeft_y = Math.floor(layer.smartObject.transform[1]);
        var topRight_x = Math.floor(layer.smartObject.transform[2]);
        var topRight_y = Math.floor(layer.smartObject.transform[3]);
        var vector = Vectors.get(topLeft_x, topLeft_y, topRight_x, topRight_y);

        var isRotation = setRotation(layer, drawable, topLeft_x, topLeft_y, topRight_x, topRight_y, vector);

        var original = getPlaced(layer.smartObject);
        // var originalHeight = original.bounds.bottom - original.bounds.top; // not used, atm scale affects w&h equally
        var originalWidth = original.bounds.right - original.bounds.left;

        if (isRotation) {
            drawable.scale = Vectors.magnitude(vector.x, vector.y) / originalWidth;
        } else {
            drawable.scale = drawable.width / originalWidth;
        }
        drawable.scale = Math.round(drawable.scale * 100) / 100;

        setOpacity(layer, drawable);

        return drawable;
    }

    function parseLayer(layer, animations) {
        if (layer.smartObject) {
            return parseSmartObject(layer, animations);

        } else if (includes(layer.name, '.png')) {
            return parseBasicImage(layer, animations);

        } else if (layer.type == 'textLayer') {
            return parseText(layer, animations);

        } else if (layer.type == 'shapeLayer') {
            return parseRectangle(layer, animations);
        }
    }

    function parseButton(layerGroup, animations) {
        var button = {};
        button.type = 'button';
        setTaggedId(layerGroup, button);

        layerGroup.layers.forEach(function (layer) {
            if (layer.type == 'textLayer') {
                button.text = parseText(layer, animations);
            } else if (includes(layer.name, '#input')) {
                button.input = parseRectangle(layer, animations);
            } else if (includes(layer.name, '#background')) {
                button.background = parseLayer(layer, animations);
            }
        });

        return button;
    }

    function parseTaggedLayerGroup(layerGroup, animations) {
        var drawables = [];
        if (includes(layerGroup.name, '#ignore')) {
            return drawables;

        } else if (includes(layerGroup.name, '#button')) {
            drawables.push(parseButton(layerGroup, animations));

        } else if (includes(layerGroup.name, '#')) {
            var tags = parseTags(layerGroup.name.split(' '));
            parseLayerGroup(layerGroup, animations).forEach(function (elem, index, array) {
                if (elem.tags) {
                    elem.tags.push.apply(elem.tags, tags);
                } else {
                    elem.tags = tags.slice();
                }
                referenceAnimationTagging(elem, tags, animations);
                setGroupTaggedZIndex(elem, tags);

                drawables.push(elem);
            });
        }

        return drawables;
    }

    function parseLayerGroup(layerGroup, animations) {
        var drawables = [];
        layerGroup.layers.forEach(function (layer) {
            if (layer.type == 'layer' || layer.type == 'textLayer' || layer.type == 'shapeLayer') {
                var drawable = parseLayer(layer, animations);
                if (drawable)
                    drawables.push(drawable);

            } else if (layer.type == 'layerSection') {
                drawables.push.apply(drawables, parseGroup(layer, animations));
            }
        });

        return drawables;
    }

    function parseGroup(layerGroup, animations) {
        if (includes(layerGroup.name, '#')) {
            return parseTaggedLayerGroup(layerGroup, animations);

        } else if (includes(layerGroup.name, '.png')) {
            return [parseBasicImage(layerGroup, animations)];

        } else {
            return parseLayerGroup(layerGroup, animations);
        }
    }

    function initialParse(document) {
        var h5Document = {};

        document.layers.forEach(function (layer) {
            if (layer.artboard) {
                artboard = layer.artboard.artboardRect;

                var currentScene = {};
                h5Document[layer.name] = currentScene;
                currentScene.screen = {
                    top: artboard.top,
                    left: artboard.left,
                    width: artboard.right - artboard.left,
                    height: artboard.bottom - artboard.top
                };
                var animations = [];

                currentScene.drawables = parseGroup(layer, animations);

                if (animations.length > 0)
                    currentScene.animations = animations;

            } // else skip
        });

        return h5Document;
    }

    return initialParse(psDocument);
}

module.exports = transformPSDoc;