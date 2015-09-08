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

function hasVectorMask() {
    try {
        var ref = new ActionReference();
        var keyVectorMaskEnabled = app.stringIDToTypeID('vectorMask');
        var keyKind = app.charIDToTypeID('Knd ');
        ref.putEnumerated(app.charIDToTypeID('Path'), app.charIDToTypeID('Ordn'), keyVectorMaskEnabled);
        var desc = executeActionGet(ref);
        if (desc.hasKey(keyKind)) {
            var kindValue = desc.getEnumerationValue(keyKind);
            return kindValue == keyVectorMaskEnabled;
        }
    } catch (e) {
        alert('exception');
        return false;
    }
}

function hasFilterMask() {
    var ref = new ActionReference();
    var keyFilterMask = app.stringIDToTypeID("hasFilterMask");
    ref.putProperty(app.charIDToTypeID('Prpr'), keyFilterMask);
    ref.putEnumerated(app.charIDToTypeID('Lyr '), app.charIDToTypeID('Ordn'), app.charIDToTypeID('Trgt'));
    var desc = executeActionGet(ref);
    return desc.hasKey(keyFilterMask) && desc.getBoolean(keyFilterMask);
}

function hasVectorMask2() {
    var ref = new ActionReference();
    var keyVectorMask = app.stringIDToTypeID('hasVectorMask');
    ref.putProperty(app.charIDToTypeID('Prpr'), keyVectorMask);
    ref.putEnumerated(app.charIDToTypeID('Lyr '), app.charIDToTypeID('Ordn'), app.charIDToTypeID('Trgt'));
    return executeActionGet(ref).getBoolean(keyVectorMask);
}

//var soDesc = getSmartObject();
//var placedDesc = soDesc.getEnumerationValue(stringIDToTypeID('placed'));
//var theName = soDesc.getString(stringIDToTypeID("fileReference"));
//
//alert("name: " + theName + " "  + typeIDToStringID(placedDesc));
var layer = app.activeDocument.activeLayer;
alert(hasVectorMask2());
//if (layer.kind == LayerKind.TEXT) {
//    var transform = getTextTransformData();
//    alert(getScale(transform));
//}