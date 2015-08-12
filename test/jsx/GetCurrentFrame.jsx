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

var currentFrameNumber = getCurrentFrame();
var frameCount = getFrameCount();
var frameRate = getFrameRate();

alert("frame: " + currentFrameNumber + " / " + frameCount + " @ " + frameRate + " fps");