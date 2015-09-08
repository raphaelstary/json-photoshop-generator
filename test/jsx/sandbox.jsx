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

function getSmartObject() {
    var ref = new ActionReference();
    ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("smartObject"));
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

    var layerDesc = executeActionGet(ref);

    return layerDesc.getObjectValue(stringIDToTypeID('smartObject'));
}

function isSmartObject() {
    var ref = new ActionReference();
    ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("smartObject"));
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

    var layerDesc = executeActionGet(ref);

    return layerDesc.hasKey(stringIDToTypeID('smartObject'));
}

function isText() {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    return executeActionGet(ref).hasKey(stringIDToTypeID('textKey'));
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

function sign(number) {
    number = +number; // convert to a number
    if (number === 0 || isNaN(number)) {
        return number;
    }
    return number > 0 ? 1 : -1;
}

function angleFromMatrix(xy, yy) {
    return Math.atan2(xy, yy);
}

function getScale(transform) {
    return Math.sqrt(transform.xx * transform.xx + transform.xy * transform.xy) * sign(transform.xx);
}

function hasLayerMask() {
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    return executeActionGet(ref).hasKey(charIDToTypeID("UsrM"));
}

function hasFilterMask() {
    var ref = new ActionReference();
    var keyFilterMask = app.stringIDToTypeID("hasFilterMask");
    ref.putProperty(app.charIDToTypeID('Prpr'), keyFilterMask);
    ref.putEnumerated(app.charIDToTypeID('Lyr '), app.charIDToTypeID('Ordn'), app.charIDToTypeID('Trgt'));
    var desc = executeActionGet(ref);
    return desc.hasKey(keyFilterMask) && desc.getBoolean(keyFilterMask);
}

//var soDesc = getSmartObject();
//var placedDesc = soDesc.getEnumerationValue(stringIDToTypeID('placed'));
//var theName = soDesc.getString(stringIDToTypeID("fileReference"));
//
//alert("name: " + theName + " "  + typeIDToStringID(placedDesc));
var layer = app.activeDocument.activeLayer;

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

    mask.x = Math.floor(bounds.left + widthHalf - 0);
    mask.y = Math.floor(bounds.top + heightHalf - 0);

    var a_b = Vectors.get(a[0], a[1], b[0], b[1]);
    mask.width = Math.floor(Vectors.magnitude(a_b.x, a_b.y));

    var b_c = Vectors.get(b[0], b[1], c[0], c[1]);
    mask.height = Math.floor(Vectors.magnitude(b_c.x, b_c.y));

    mask.rotation = Vectors.getAngle(a_b.x, a_b.y);

    //mask.time = getCurrentFrame();
    return mask;
}

var myMask = getVectorMaskData();
alert("x: " + myMask.x + " y: " + myMask.y + " w: " + myMask.width + " h: " + myMask.height + " a: " + myMask.rotation);
//if (layer.kind == LayerKind.TEXT) {
//    var transform = getTextTransformData();
//    alert(getScale(transform));
//}