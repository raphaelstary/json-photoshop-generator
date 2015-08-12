#target photoshop
#include "utils/json2.js"

var animationLayers = [
    63,
    21,
    61,
    62,
    64,
    33,
    32,
    31,
    30,
    29
];

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

function __jumpToNextKeyframe(track) {
    var transDesc = new ActionDescriptor();
    transDesc.putEnumerated(stringIDToTypeID("trackID"), stringIDToTypeID("stdTrackID"), stringIDToTypeID(track));

    var animDesc = new ActionDescriptor();
    animDesc.putObject(stringIDToTypeID("trackID"), stringIDToTypeID("animationTrack"), transDesc);

    executeAction(stringIDToTypeID("nextKeyframe"), animDesc, DialogModes.NO);
}

function jumpToNextKeyframeOfTransformTrack() {
    __jumpToNextKeyframe("sheetTransformTrack");
}

function jumpToNextKeyframeOfOpacityTrack() {
    __jumpToNextKeyframe("opacityTrack");
}

function jumpToNextKeyframeOfStyleTrack() {
    __jumpToNextKeyframe("styleTrack");
}

function jumpToNextKeyframeOfPositionTrack() {
    __jumpToNextKeyframe("sheetPositionTrack");
}

function jumpToNextKeyframeOfMaskTrack() {
    __jumpToNextKeyframe("userMaskPositionTrack");
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

    var layerDesc = executeActionGet(ref);

    return layerDesc.hasKey(stringIDToTypeID('textKey'));
}

function collectKeyframes(layer, nextKeyframe, equals, getData, maxFrames, transformFrames) {
    var keyFrames = [];

    jumpToFrame0();

    var last = getData(layer);
    var next;
    keyFrames.push(last);

    for(var i = 0; i < maxFrames; i++) {
        nextKeyframe();

        next = getData(layer);
        if (last.time == next.time) {
            if (keyFrames.length == 1) {
                // in case there are no keyframes remove the 1st
                keyFrames.pop();
            }
            return keyFrames;
        }
        if (last.time == 0 && equals(last, next)) {
            keyFrames.pop();
        }

        if (transformFrames) {
            if (transformFrames[next.time]) {
                transformFrames[next.time].push(layer.id);
            } else {
                transformFrames[next.time] = [layer.id];
            }
        }
        keyFrames.push(next);
        last = next;
    }
}

function equalsTransformKeyframe(last, next) {
    return last && next.bounds.left == last.bounds.left && next.bounds.top == last.bounds.top &&
        next.bounds.right == last.bounds.right && next.bounds.bottom == last.bounds.bottom;
}

function getBounds(layer) {
    return {
        bounds: {
            left: layer.bounds[0].value,
            top: layer.bounds[1].value,
            right: layer.bounds[2].value,
            bottom: layer.bounds[3].value
        },
        time: getCurrentFrame()
    };
}

function getOpacity(layer) {
    return {
        opacity: layer.opacity,
        time: getCurrentFrame()
    };
}

function equalsOpacityKeyframe(last, next) {
    return last && next.opacity == last.opacity;
}

function equalsStyleKeyframe(last, next) {
    return last && next.blendMode == last.blendMode;
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

    if (isSmartObject()) {

        frames = collectKeyframes(layer, jumpToNextKeyframeOfTransformTrack, equalsTransformKeyframe, getBounds, 50,
            transformFrames);
        if (frames.length > 1) {
            current.transform = frames;
        }

        frames = collectKeyframes(layer, jumpToNextKeyframeOfOpacityTrack, equalsOpacityKeyframe, getOpacity, 50);
        if (frames.length > 1) {
            current.opacity = frames;
        }

        frames = collectKeyframes(layer, jumpToNextKeyframeOfStyleTrack, equalsStyleKeyframe, getStyle, 50);
        if (frames.length > 1) {
            current.style = frames;
        }

    }

    return current;
}

function saveFile(str) {
    var fileName = app.activeDocument.name.substring(0, app.activeDocument.name.lastIndexOf("."));
    var path = app.activeDocument.path.fsName;
    var fullPath = path + "/" + fileName + ".json";
    var file = new File(fullPath);
    file.open('w');
    file.write(str);
    file.close();
    alert("file saved to " + fullPath);
}

function run() {
    var animationData = {
        frameRate: getFrameRate(),
        frameCount: getFrameCount(),
        transformFrames: {},
        animations: {}
    };

    for (var i = 0; i < animationLayers.length; i++) {
        var animId = animationLayers[i];
        var layer = selectLayer(animId);

        animationData.animations[layer.id] = collectKeyframeData(layer, animationData.transformFrames);
    }
    saveFile(JSON.stringify(animationData, null, "    "));

    return true;
}

run();