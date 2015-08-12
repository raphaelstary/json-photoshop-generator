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

function selectLayer(id) {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), id);

    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref);
    desc.putBoolean( charIDToTypeID("MkVs"), false);

    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);

    return app.activeDocument.activeLayer;
}

//var soDesc = getSmartObject();
//var placedDesc = soDesc.getEnumerationValue(stringIDToTypeID('placed'));
//var theName = soDesc.getString(stringIDToTypeID("fileReference"));

//alert(typeIDToStringID(placedDesc));

alert(selectLayer(63).id);

//var idnull = charIDToTypeID("null");
//var layerReference = new ActionReference();
//layerReference.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
//var layerDescriptor = new ActionDescriptor();
//layerDescriptor.putReference(idnull, layerReference);
//layerDescriptor.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
//var transformDescriptor = app.executeAction(charIDToTypeID("Trnf"), layerDescriptor, DialogModes.ALL);

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

function angleFromMatrix(yy, xy) {
    var toDegs = 180 / Math.PI;
    return Math.atan2(yy, xy) * toDegs - 90;
}