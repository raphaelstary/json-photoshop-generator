var Vectors = require('./Vectors');
var StringUtils = require('./StringUtils');
var rgbToHex = require('./rgbToHex');
var Layer = require('./Layer');
var Tagger = require('./Tagger');

var LayerParser = (function () {
    "use strict";

    function LayerParser(psDocument) {
        this.doc = psDocument;
    }

    function setOpacity(layer, drawable) {
        if (Layer.isOpacitySet(layer)) {
            drawable.alpha = Layer.getOpacity(layer);
        }
    }

    function setRotation(layer, drawable, topLeft_x, topLeft_y, topRight_x, topRight_y, optionalVector) {
        var isRotation = Layer.isRotated(layer, topLeft_x, topLeft_y);

        if (isRotation) {
            drawable.rotation = Layer.getRotation(optionalVector || topLeft_x, topLeft_y, topRight_x, topRight_y);
        }

        return isRotation;
    }

    function setMatrixRotation(drawable, transformMatrix) {
        if (Layer.isMatrixRotation(transformMatrix))
            drawable.rotation = Layer.getMatrixRotation(transformMatrix);
    }

    LayerParser.prototype.parseBasicImage = function (layer, animations) {
        var width = layer.bounds.right - layer.bounds.left;
        var height = layer.bounds.bottom - layer.bounds.top;

        var nameParts = layer.name.split(' ');

        var tags = Tagger.parseTags(nameParts);

        var drawable = {
            type: 'image',
            x: Math.floor(layer.bounds.left + width / 2 - this.doc.getArtboard().left),
            y: Math.floor(layer.bounds.top + height / 2 - this.doc.getArtboard().top),
            width: width,
            height: height,
            referenceId: layer.id
        };

        if (StringUtils.includes(nameParts[0], '.png')) {
            drawable.filename = nameParts[0];
        }
        if (tags.length > 0) {
            drawable.tags = tags;
            Tagger.setTaggedId(layer, drawable);
            Tagger.setTaggedZIndex(layer, drawable);
            Tagger.referenceAnimationTagging(drawable, tags, animations);
        }

        return drawable;
    };

    LayerParser.prototype.parseRectangle = function (layer, animations) {
        var drawable = this.parseBasicImage(layer, animations);
        drawable.type = 'rectangle';

        setOpacity(layer, drawable);
        drawable.filled = layer.fill !== undefined;
        if (layer.strokeStyle) {
            drawable.filled = layer.strokeStyle.fillEnabled;
        }
        var color = drawable.filled ? layer.fill.color : layer.strokeStyle.strokeStyleContent.color;
        drawable.color = rgbToHex(color.red, color.green, color.blue);

        return drawable;
    };

    LayerParser.prototype.parseText = function (layer, animations) {
        var drawable = this.parseBasicImage(layer, animations);
        drawable.type = 'text';
        drawable.msg = layer.text.textKey;

        setOpacity(layer, drawable);
        setMatrixRotation(drawable, layer.text.transform);
        var style = layer.text.textStyleRange[0].textStyle; // apply only style of 1st style range
        drawable.font = style.fontName;
        drawable.size = style.size.value; // maybe px vs pt issues
        drawable.color = rgbToHex(style.color.red, style.color.green, style.color.blue);

        return drawable;
    };

    LayerParser.prototype.parseSmartObject = function (layer, animations) {
        var drawable = this.parseBasicImage(layer, animations);

        var topLeft_x = Math.floor(layer.smartObject.transform[0]);
        var topLeft_y = Math.floor(layer.smartObject.transform[1]);
        var topRight_x = Math.floor(layer.smartObject.transform[2]);
        var topRight_y = Math.floor(layer.smartObject.transform[3]);
        var vector = Vectors.get(topLeft_x, topLeft_y, topRight_x, topRight_y);

        var isRotation = setRotation(layer, drawable, topLeft_x, topLeft_y, topRight_x, topRight_y, vector);

        var original = this.doc.getPlaced(layer.smartObject);
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
    };

    LayerParser.prototype.parseLayer = function (layer, animations) {
        if (layer.smartObject) {
            return this.parseSmartObject(layer, animations);

        } else if (StringUtils.includes(layer.name, '.png')) {
            return this.parseBasicImage(layer, animations);

        } else if (layer.type == 'textLayer') {
            return this.parseText(layer, animations);

        } else if (layer.type == 'shapeLayer') {
            return this.parseRectangle(layer, animations);
        }
    };

    LayerParser.prototype.parseButton = function (layerGroup, animations) {
        var button = {};
        button.type = 'button';
        Tagger.setTaggedId(layerGroup, button);

        layerGroup.layers.forEach(function (layer) {
            if (layer.type == 'textLayer') {
                button.text = this.parseText(layer, animations);
            } else if (StringUtils.includes(layer.name, '#input')) {
                button.input = this.parseRectangle(layer, animations);
            } else if (StringUtils.includes(layer.name, '#background')) {
                button.background = this.parseLayer(layer, animations);
            }
        }, this);

        return button;
    };

    LayerParser.prototype.parseTaggedLayerGroup = function (layerGroup, animations) {
        var drawables = [];
        if (StringUtils.includes(layerGroup.name, '#ignore')) {
            return drawables;

        } else if (StringUtils.includes(layerGroup.name, '#button')) {
            drawables.push(this.parseButton(layerGroup, animations));

        } else if (StringUtils.includes(layerGroup.name, '#')) {
            var tags = Tagger.parseTags(layerGroup.name.split(' '));
            this.parseLayerGroup(layerGroup, animations).forEach(function (elem) {
                if (elem.tags) {
                    elem.tags.push.apply(elem.tags, tags);
                } else {
                    elem.tags = tags.slice();
                }
                Tagger.referenceAnimationTagging(elem, tags, animations);
                Tagger.setGroupTaggedZIndex(elem, tags);

                drawables.push(elem);
            });
        }

        return drawables;
    };

    LayerParser.prototype.parseLayerGroup = function (layerGroup, animations) {
        var drawables = [];
        layerGroup.layers.forEach(function (layer) {
            if (layer.type == 'layer' || layer.type == 'textLayer' || layer.type == 'shapeLayer') {
                var drawable = this.parseLayer(layer, animations);
                if (drawable)
                    drawables.push(drawable);

            } else if (layer.type == 'layerSection') {
                drawables.push.apply(drawables, this.parseGroup(layer, animations));
            }
        }, this);

        return drawables;
    };

    LayerParser.prototype.parseGroup = function (layerGroup, animations) {
        if (StringUtils.includes(layerGroup.name, '#')) {
            return this.parseTaggedLayerGroup(layerGroup, animations);

        } else if (StringUtils.includes(layerGroup.name, '.png')) {
            return [this.parseBasicImage(layerGroup, animations)];

        } else {
            return this.parseLayerGroup(layerGroup, animations);
        }
    };

    return LayerParser;
})();

module.exports = LayerParser;