/*global stringIDToTypeID, charIDToTypeID, ActionDescriptor, ActionReference, executeAction, DialogModes, params */

function jumpToFrame(number, frameRate) {
    var rate = frameRate || 30;

    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("time"));
    ref.putClass(stringIDToTypeID("timeline"));

    var frameDesc = new ActionDescriptor();
    frameDesc.putInteger(stringIDToTypeID("frame"), number);
    frameDesc.putDouble(stringIDToTypeID("frameRate"), rate);

    var timeDesc = new ActionDescriptor();
    timeDesc.putReference(charIDToTypeID("null"), ref);
    timeDesc.putObject(charIDToTypeID("T   "), stringIDToTypeID("timecode"), frameDesc);

    executeAction(charIDToTypeID("setd"), timeDesc, DialogModes.NO);
}

jumpToFrame(params.frameNumber, params.frameRate);