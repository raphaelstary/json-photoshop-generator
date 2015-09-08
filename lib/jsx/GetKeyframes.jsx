/*global stringIDToTypeID, charIDToTypeID, ActionDescriptor, ActionReference, executeAction, executeActionGet, DialogModes, params, app, LayerKind */

var JSON = {};
/* cloned from https://github.com/douglascrockford/JSON-js */
(function () {
    'use strict';

    var rx_one = /^[\],:{}\s]*$/, rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rx_four = /(?:^|:|,)(?:\s*\[)+/g, rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf()) ?
            this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' +
            f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap, indent, meta, rep;

    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string) ? '"' + string.replace(rx_escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length, mind = gap, partial, value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            // If the type is 'object', we might be dealing with an object or an array or
            // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                        '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                        gap ? ': ' : ':'
                                    ) + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                        gap ? ': ' : ':'
                                    ) + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', {'': value});
        };
    }

    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (rx_one.test(text.replace(rx_two, '@').replace(rx_three, ']').replace(rx_four, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ? walk({'': j}, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
var Vectors = (function (Math) {
    "use strict";

    return {
        get: function (pointA_X, pointA_Y, pointB_X, pointB_Y) {
            return {
                x: pointB_X - pointA_X,
                y: pointB_Y - pointA_Y
            };
        },

        magnitude: function (x, y) {
            return Math.sqrt(x * x + y * y);
        },

        squaredMagnitude: function (x, y) {
            return x * x + y * y;
        },

        normalize: function (x, y) {
            var magnitude = this.magnitude(x, y);

            return this.normalizeWithMagnitude(x, y, magnitude);
        },

        normalizeWithMagnitude: function (x, y, magnitude) {
            return {
                x: x / magnitude,
                y: y / magnitude
            };
        },

        normalRight: function (x, y) {
            return {
                x: -y,
                y: x
            };
        },

        normalLeft: function (x, y) {
            return {
                x: y,
                y: -x
            };
        },

        dotProduct: function (vectorA_X, vectorA_Y, vectorB_X, vectorB_Y) {
            return vectorA_X * vectorB_X + vectorA_Y * vectorB_Y;
        },

        toRadians: function (degrees) {
            return degrees * Math.PI / 180;
        },

        getX: function (pointX, magnitude, angle) {
            return pointX + magnitude * Math.cos(angle);
        },

        getY: function (pointY, magnitude, angle) {
            return pointY + magnitude * Math.sin(angle);
        },

        getAngle: function (x, y) {
            return Math.atan2(y, x);
        },

        getIntersectionPoint: function (a1_x, a1_y, a2_x, a2_y, b1_x, b1_y, b2_x, b2_y) {
            var denominator = ( b2_y - b1_y) * (a2_x - a1_x) - (b2_x - b1_x) * (a2_y - a1_y);
            var ua = ((b2_x - b1_x) * (a1_y - b1_y) - (b2_y - b1_y) * (a1_x - b1_x)) / denominator;
            return {
                x: a1_x + ua * (a2_x - a1_x),
                y: a1_y + ua * (a2_y - a1_y)
            }
        }
    };
})(Math);

var currentArtboard;

function sign(number) {
    number = +number; // convert to a number
    if (number === 0 || isNaN(number)) {
        return number;
    }
    return number > 0 ? 1 : -1;
}

function getCurrentFrame() {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID('Prpr'), stringIDToTypeID("currentFrame"));
    ref.putClass(stringIDToTypeID("timeline"));
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID('null'), ref);
    var resultDesc = executeAction(charIDToTypeID('getd'), desc, DialogModes.NO);

    return resultDesc.getInteger(stringIDToTypeID("currentFrame"));
}

function getFrameCount() {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID('Prpr'), stringIDToTypeID("frameCount"));
    ref.putClass(stringIDToTypeID("timeline"));
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID('null'), ref);
    var resultDesc = executeAction(charIDToTypeID('getd'), desc, DialogModes.NO);

    return resultDesc.getInteger(stringIDToTypeID("frameCount"));
}

function getFrameRate() {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID('Prpr'), stringIDToTypeID("documentTimelineSettings"));
    ref.putClass(stringIDToTypeID("timeline"));
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID('null'), ref);
    var resultDesc = executeAction(charIDToTypeID('getd'), desc, DialogModes.NO);

    return resultDesc.getDouble(stringIDToTypeID('frameRate'));
}

function jumpToFrame0() {
    var ref6 = new ActionReference();
    ref6.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("time"));
    ref6.putClass(stringIDToTypeID("timeline"));

    var desc19 = new ActionDescriptor();
    desc19.putInteger(stringIDToTypeID("seconds"), 0); // time nr
    desc19.putInteger(stringIDToTypeID("frame"), 0); // frame nr
    desc19.putDouble(stringIDToTypeID("frameRate"), 30.000000); // frame rate

    var desc18 = new ActionDescriptor();
    desc18.putReference(charIDToTypeID("null"), ref6);
    desc18.putObject(charIDToTypeID("T   "), stringIDToTypeID("timecode"), desc19);

    executeAction(charIDToTypeID("setd"), desc18, DialogModes.NO);
}

function __jumpToNextKeyframe(track, navigateAction) {
    var transDesc = new ActionDescriptor();
    transDesc.putEnumerated(stringIDToTypeID("trackID"), stringIDToTypeID("stdTrackID"), stringIDToTypeID(track));

    var animDesc = new ActionDescriptor();
    animDesc.putObject(stringIDToTypeID("trackID"), stringIDToTypeID("animationTrack"), transDesc);

    executeAction(stringIDToTypeID(navigateAction + "Keyframe"), animDesc, DialogModes.NO);
}

function jumpToNextKeyframeOfTransformTrack() {
    __jumpToNextKeyframe("sheetTransformTrack", "next");
}

function jumpToPreviousKeyframeOfTransformTrack() {
    __jumpToNextKeyframe("sheetTransformTrack", "previous");
}

function jumpToNextKeyframeOfOpacityTrack() {
    __jumpToNextKeyframe("opacityTrack", "next");
}

function jumpToPreviousKeyframeOfOpacityTrack() {
    __jumpToNextKeyframe("opacityTrack", "previous");
}

function jumpToNextKeyframeOfStyleTrack() {
    __jumpToNextKeyframe("styleTrack", "next");
}

function jumpToPreviousKeyframeOfStyleTrack() {
    __jumpToNextKeyframe("styleTrack", "previous");
}

function jumpToNextKeyframeOfPositionTrack() {
    __jumpToNextKeyframe("sheetPositionTrack", "next");
}

function jumpToPreviousKeyframeOfPositionTrack() {
    __jumpToNextKeyframe("sheetPositionTrack", "previous");
}

function jumpToNextKeyframeOfLayerMaskPositionTrack() {
    __jumpToNextKeyframe("userMaskPositionTrack", "next");
}

function jumpToPreviousKeyframeOfLayerMaskPositionTrack() {
    __jumpToNextKeyframe("userMaskPositionTrack", "previous");
}

function jumpToNextKeyframeOfVectorMaskPositionTrack() {
    __jumpToNextKeyframe("vectorMaskPositionTrack", "next");
}

function jumpToPreviousKeyframeOfVectorMaskPositionTrack() {
    __jumpToNextKeyframe("vectorMaskPositionTrack", "previous");
}

function hasVectorMask() {
    var ref = new ActionReference();
    var keyVectorMask = app.stringIDToTypeID('hasVectorMask');
    ref.putProperty(app.charIDToTypeID('Prpr'), keyVectorMask);
    ref.putEnumerated(app.charIDToTypeID('Lyr '), app.charIDToTypeID('Ordn'), app.charIDToTypeID('Trgt'));
    return executeActionGet(ref).getBoolean(keyVectorMask);
}

function selectLayer(id) {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), id);

    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref);
    desc.putBoolean(charIDToTypeID("MkVs"), false);

    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);

    return app.activeDocument.activeLayer;
}

function getTextTransformData() {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));
    if (desc.hasKey(stringIDToTypeID('transform'))) {
        desc = desc.getObjectValue(stringIDToTypeID('transform'));
        var xx = desc.getDouble(stringIDToTypeID('xx'));
        var xy = desc.getDouble(stringIDToTypeID('xy'));
        var yx = desc.getDouble(stringIDToTypeID('yx'));
        var yy = desc.getDouble(stringIDToTypeID('yy'));

        return {
            xx: xx,
            xy: xy,
            yx: yx,
            yy: yy
        };
    }
}

function getAngle(xy, yy) {
    return Math.atan2(xy, yy);
}

function getScale(xx, xy) {
    return Math.sqrt(xx * xx + xy * xy) * sign(xx);
}

function collectKeyframes(layer, nextKeyframe, previousKeyframe, getData, maxFrames, transformFrames) {
    var keyFrames = [];

    jumpToFrame0();
    nextKeyframe();
    var thereAreNoKeyframes = getCurrentFrame() == 0;
    if (thereAreNoKeyframes) {
        return keyFrames;
    }

    previousKeyframe();
    var last = getData(layer);
    addKeyframe(last);

    for (var i = 0; i < maxFrames; i++) {
        nextKeyframe();
        var keyframe = getData(layer);
        if (last.time == keyframe.time) {
            return keyFrames;
        }
        addKeyframe(keyframe);
        last = keyframe;
    }

    function addKeyframe(keyframe) {
        if (transformFrames) {
            var idObject = {
                id: layer.id,
                artboard: currentArtboard
            };
            if (transformFrames[keyframe.time]) {
                transformFrames[keyframe.time].push(idObject);
            } else {
                transformFrames[keyframe.time] = [idObject];
            }
        }
        keyFrames.push(keyframe);
    }
}

function getPosition(layer) {
    var bounds = {
        left: layer.bounds[0].value,
        top: layer.bounds[1].value,
        right: layer.bounds[2].value,
        bottom: layer.bounds[3].value
    };
    var width = bounds.right - bounds.left;
    var height = bounds.bottom - bounds.top;

    return {
        x: Math.floor(bounds.left + width / 2 - currentArtboard.left),
        y: Math.floor(bounds.top + height / 2 - currentArtboard.top)
    };
}

function getTextRotation(transform) {
    if (transform)
        return getAngle(transform.xy, transform.yy);
    return 0;
}

function getTextScale(transform) {
    if (transform)
        return getScale(transform.xy, transform.yy);
    return 1;
}

function getTextData(layer) {
    var data = getPosition(layer);
    var transform = getTextTransformData();
    if (transform) {
        data.rotation = getTextRotation(transform);
        data.scale = getTextScale(transform);
    }
    data.time = getCurrentFrame();

    return data;
}

function getVectorMaskData() {
    var mask = {};

    var paths = app.activeDocument.pathItems;
    var myPath = paths[0];
    var mySubPath = myPath.subPathItems[0];
    var a = mySubPath.pathPoints[0].anchor;
    var b = mySubPath.pathPoints[1].anchor;
    var c = mySubPath.pathPoints[2].anchor;

    var bounds = {
        left: a[0],
        top: a[1],
        right: a[0],
        bottom: a[1]
    };
    for (var i = 0; i < mySubPath.pathPoints.length; i++) {
        var pathPoint = mySubPath.pathPoints[i].anchor;
        if (pathPoint[0] < bounds.left) {
            bounds.left = pathPoint[0];
        }
        if (pathPoint[0] > bounds.right) {
            bounds.right = pathPoint[0];
        }
        if (pathPoint[1] < bounds.top) {
            bounds.top = pathPoint[1];
        }
        if (pathPoint[1] > bounds.bottom) {
            bounds.bottom = pathPoint[1];
        }
    }
    var widthHalf = (bounds.right - bounds.left) / 2;
    var heightHalf = (bounds.bottom - bounds.top) / 2;

    mask.x = Math.floor(bounds.left + widthHalf - currentArtboard.left);
    mask.y = Math.floor(bounds.top + heightHalf - currentArtboard.top);

    var a_b = Vectors.get(a[0], a[1], b[0], b[1]);
    mask.width = Math.floor(Vectors.magnitude(a_b.x, a_b.y));

    var b_c = Vectors.get(b[0], b[1], c[0], c[1]);
    mask.height = Math.floor(Vectors.magnitude(b_c.x, b_c.y));

    mask.rotation = Vectors.getAngle(a_b.x, a_b.y);

    mask.time = getCurrentFrame();
    return mask;
}

function getSmartObjectData(layer) {
    var data = getPosition(layer);
    data.time = getCurrentFrame();

    return data;
}

function getOpacity(layer) {
    return {
        opacity: Math.round(layer.opacity) / 100,
        time: getCurrentFrame()
    };
}

function getStyle(layer) {
    return {
        blendMode: layer.blendMode.toString(),
        time: getCurrentFrame()
    };
}

function collectKeyframeData(layer, transformFrames) {
    var current = {};
    var frames;

    frames = collectKeyframes(layer, jumpToNextKeyframeOfOpacityTrack, jumpToPreviousKeyframeOfOpacityTrack, getOpacity,
        50);
    if (frames.length > 1) {
        current.opacity = frames;
    }

    frames = collectKeyframes(layer, jumpToNextKeyframeOfStyleTrack, jumpToPreviousKeyframeOfStyleTrack, getStyle, 50);
    if (frames.length > 1) {
        current.style = frames;
    }

    if (layer.kind != LayerKind.SOLIDFILL && hasVectorMask()) {
        frames = collectKeyframes(layer, jumpToNextKeyframeOfVectorMaskPositionTrack,
            jumpToPreviousKeyframeOfVectorMaskPositionTrack, getVectorMaskData, 50);
        if (frames.length > 1) {
            current.mask = frames;
        }
    }

    if (layer.kind == LayerKind.SMARTOBJECT) {
        current.psType = 'smartObject';

        frames = collectKeyframes(layer, jumpToNextKeyframeOfTransformTrack, jumpToPreviousKeyframeOfTransformTrack,
            getSmartObjectData, 50, transformFrames);
        if (frames.length > 1) {
            current.transform = frames;
        }

    } else if (layer.kind == LayerKind.TEXT) {
        current.psType = 'text';

        frames = collectKeyframes(layer, jumpToNextKeyframeOfTransformTrack, jumpToPreviousKeyframeOfTransformTrack,
            getTextData, 50);
        if (frames.length > 1) {
            current.transform = frames;
        }

    } else if (layer.kind == LayerKind.SOLIDFILL) {
        current.psType = 'shape';

        frames = collectKeyframes(layer, jumpToNextKeyframeOfVectorMaskPositionTrack,
            jumpToPreviousKeyframeOfVectorMaskPositionTrack, getSmartObjectData, 50);
        if (frames.length > 1) {
            current.transform = frames;
        }

    }

    return current;
}

function run() {
    var animationData = {
        frameRate: getFrameRate(),
        frameCount: getFrameCount(),
        transformFrames: {},
        animations: {}
    };

    for (var i = 0; i < params.ids.length; i++) {
        var animId = params.ids[i].id;
        currentArtboard = params.ids[i].artboard;
        var layer = selectLayer(animId);

        animationData.animations[layer.id] = collectKeyframeData(layer, animationData.transformFrames);
    }

    return animationData;
}

var data = run();
// return value for generator
JSON.stringify(data);