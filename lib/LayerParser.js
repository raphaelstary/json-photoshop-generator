var Vectors = require('./Vectors');
var StringUtils = require('./StringUtils');
var rgbToHex = require('./rgbToHex');
var Layer = require('./Layer');
var Tagger = require('./Tagger');

var LayerParser = (function (Vectors, StringUtils, rgbToHex, Layer, Tagger, Math) {
    "use strict";

    function LayerParser(psDocument, animations) {
        this.doc = psDocument;
        this.animations = animations;
    }

    function setOpacity(layer, drawable) {
        if (Layer.isOpacitySet(layer)) {
            drawable.alpha = Layer.getOpacity(layer);
        }
    }

    function setSmartObjectRotation(layer, drawable, topLeft_x, topLeft_y, topRight_x, topRight_y, optionalVector) {
        var isRotation = Layer.isRotated(layer, topLeft_x, topLeft_y);

        if (isRotation) {
            drawable.rotation = Layer.getRotation(optionalVector || topLeft_x, topLeft_y, topRight_x, topRight_y);
        } else {
            drawable.rotation = 0;
        }

        return isRotation;
    }

    function setMatrixRotation(drawable, transformMatrix) {
        if (Layer.isMatrixRotation(transformMatrix)) {
            drawable.rotation = Layer.getMatrixRotation(transformMatrix);
        } else {
            drawable.rotation = 0;
        }
    }

    function setMatrixScale(drawable, transformMatrix) {
        if (transformMatrix)
            drawable.scale = Layer.getMatrixScale(transformMatrix);
    }

    LayerParser.prototype.parseBasicImage = function (layer) {
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

        setOpacity(layer, drawable);

        if (StringUtils.includes(nameParts[0], '.png')) {
            drawable.filename = nameParts[0];
        }
        if (tags.length > 0) {
            drawable.tags = tags;
            Tagger.setTaggedId(layer, drawable);
            Tagger.setTaggedZIndex(layer, drawable);
            if (this.animations) {
                Tagger.referenceAnimationTagging(drawable, tags, this.animations, this.doc.getArtboard());
            }
        }

        if (layer.type != 'shapeLayer' && layer.path && layer.path.pathComponents[0].origin.type == 'rect') {
            var mask = {};

            var a = layer.path.pathComponents[0].subpathListKey[0].points[0].anchor;
            var b = layer.path.pathComponents[0].subpathListKey[0].points[1].anchor;
            var c = layer.path.pathComponents[0].subpathListKey[0].points[2].anchor;

            var a_b = Vectors.get(a.x, a.y, b.x, b.y);
            mask.width = Math.floor(Vectors.magnitude(a_b.x, a_b.y));

            var b_c = Vectors.get(b.x, b.y, c.x, c.y);
            mask.height = Math.floor(Vectors.magnitude(b_c.x, b_c.y));

            mask.rotation = Layer.getRotation(a_b);

            var bounds = layer.path.pathComponents[0].origin.bounds;
            var boundsWidth = bounds.right - bounds.left;
            var boundsHeight = bounds.bottom - bounds.top;

            mask.x = Math.floor(bounds.left + boundsWidth / 2 - this.doc.getArtboard().left);
            mask.y = Math.floor(bounds.top + boundsHeight / 2 - this.doc.getArtboard().top);

            drawable.mask = mask;
        }

        return drawable;
    };

    LayerParser.prototype.parseShape = function (layer) {
        var type;
        if (layer.path.pathComponents[0].origin.type == 'line') {
            type = 'line';

        } else if (layer.path.pathComponents[0].origin.type == 'rect') {
            type = 'rectangle';
        }

        var drawable = this.parseBasicImage(layer);
        drawable.type = type;

        if (type == 'line') {
            var a = layer.path.pathComponents[0].subpathListKey[0].points[1].anchor;
            var b = layer.path.pathComponents[0].subpathListKey[0].points[2].anchor;
            var v = Vectors.get(a.x, a.y, b.x, b.y);
            drawable.length = Math.floor(Vectors.magnitude(v.x, v.y));
            drawable.rotation = Layer.getRotation(v);
        }

        drawable.filled = layer.fill !== undefined;
        if (layer.strokeStyle) {
            drawable.filled = layer.strokeStyle.fillEnabled;
            if (layer.strokeStyle.strokeEnabled)
                drawable.lineWidth = layer.strokeStyle.strokeStyleLineWidth.value;
        }
        var color = drawable.filled ? layer.fill.color : layer.strokeStyle.strokeStyleContent.color;
        drawable.color = rgbToHex(color.red, color.green, color.blue);

        return drawable;
    };

    LayerParser.prototype.parseText = function (layer) {
        var drawable = this.parseBasicImage(layer);
        drawable.type = 'text';
        drawable.msg = layer.text.textKey;

        setMatrixRotation(drawable, layer.text.transform);
        setMatrixScale(drawable, layer.text.transform);

        var style = layer.text.textStyleRange[0].textStyle; // apply only style of 1st style range
        drawable.font = style.fontName;
        drawable.fontStyle = style.fontStyleName;
        drawable.size = style.size.value; // maybe px vs pt issues
        drawable.color = style.color ? rgbToHex(style.color.red, style.color.green, style.color.blue) : '#000000';

        return drawable;
    };

    LayerParser.prototype.parseSmartObject = function (layer) {
        var drawable = this.parseBasicImage(layer);

        var topLeft_x = Math.floor(layer.smartObject.transform[0]);
        var topLeft_y = Math.floor(layer.smartObject.transform[1]);
        var topRight_x = Math.floor(layer.smartObject.transform[2]);
        var topRight_y = Math.floor(layer.smartObject.transform[3]);
        var vector = Vectors.get(topLeft_x, topLeft_y, topRight_x, topRight_y);

        var isRotation = setSmartObjectRotation(layer, drawable, topLeft_x, topLeft_y, topRight_x, topRight_y, vector);

        var original = this.doc.getPlaced(layer.smartObject);
        // var originalHeight = original.bounds.bottom - original.bounds.top; // not used, atm scale affects w&h equally
        var originalWidth = original.bounds.right - original.bounds.left;

        if (isRotation) {
            drawable.scale = Vectors.magnitude(vector.x, vector.y) / originalWidth;
        } else {
            drawable.scale = drawable.width / originalWidth;
        }
        drawable.scale = Math.round(drawable.scale * 100) / 100;

        return drawable;
    };

    LayerParser.prototype.parseLayer = function (layer) {
        if (layer.smartObject) {
            return this.parseSmartObject(layer);

        } else if (StringUtils.includes(layer.name, '.png')) {
            return this.parseBasicImage(layer);

        } else if (layer.type == 'textLayer') {
            return this.parseText(layer);

        } else if (layer.type == 'shapeLayer') {
            return this.parseShape(layer);
        }
    };

    LayerParser.prototype.parseButton = function (layerGroup) {
        var button = {};
        button.type = 'button';
        Tagger.setTaggedId(layerGroup, button);
        Tagger.setTaggedZIndex(layerGroup, button);

        layerGroup.layers.forEach(function (layer) {
            if (layer.type == 'textLayer') {
                button.text = this.parseText(layer);
            } else if (StringUtils.includes(layer.name, '#input')) {
                button.input = this.parseShape(layer);
            } else if (StringUtils.includes(layer.name, '#background')) {
                button.background = this.parseLayer(layer);
            }
        }, this);

        return button;
    };

    LayerParser.prototype.parseTaggedLayerGroup = function (layerGroup) {
        var drawables = [];
        if (StringUtils.includes(layerGroup.name, '#ignore')) {
            return drawables;

        } else if (StringUtils.includes(layerGroup.name, '#button')) {
            drawables.push(this.parseButton(layerGroup));

        } else if (StringUtils.includes(layerGroup.name, '#')) {
            var tags = Tagger.parseTags(layerGroup.name.split(' '));
            this.parseLayerGroup(layerGroup).forEach(function (elem) {
                if (elem.tags) {
                    elem.tags.push.apply(elem.tags, tags);
                } else {
                    elem.tags = tags.slice();
                }
                if (this.animations) {
                    Tagger.referenceAnimationTagging(elem, tags, this.animations, this.doc.getArtboard());
                }
                Tagger.setGroupTaggedZIndex(elem, tags);

                drawables.push(elem);
            }, this);
        }

        return drawables;
    };

    LayerParser.prototype.parseLayerGroup = function (layerGroup) {
        var drawables = [];
        layerGroup.layers.forEach(function (layer) {
            if (layer.type == 'layer' || layer.type == 'textLayer' || layer.type == 'shapeLayer') {
                var drawable = this.parseLayer(layer);
                if (drawable)
                    drawables.push(drawable);

            } else if (layer.type == 'layerSection') {
                drawables.push.apply(drawables, this.parseGroup(layer));
            }
        }, this);

        return drawables;
    };

    LayerParser.prototype.parseGroup = function (layerGroup) {
        if (StringUtils.includes(layerGroup.name, '.png')) {
            return [this.parseBasicImage(layerGroup)];

        } else if (StringUtils.includes(layerGroup.name, '#')) {
            return this.parseTaggedLayerGroup(layerGroup);

        } else {
            return this.parseLayerGroup(layerGroup);
        }
    };

    return LayerParser;
})(Vectors, StringUtils, rgbToHex, Layer, Tagger, Math);

module.exports = LayerParser;