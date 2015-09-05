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

//var soDesc = getSmartObject();
//var placedDesc = soDesc.getEnumerationValue(stringIDToTypeID('placed'));
//var theName = soDesc.getString(stringIDToTypeID("fileReference"));
//
//alert("name: " + theName + " "  + typeIDToStringID(placedDesc));

if (isText()) {
    var transform = getTextTransformData();
    alert(getScale(transform));
}