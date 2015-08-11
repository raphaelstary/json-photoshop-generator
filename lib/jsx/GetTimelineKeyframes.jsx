#target photoshop
#include "utils/json2.js"

var animationLayers = [
    {id: 63, name: "monkey_head.png #id:monkey1"},
    {id: 21, name: "monkey.png #id:monkey2"},
    {id: 61, name: "monkey.png #id:monkey3"},
    {id: 62, name: "monkey.png #id:monkey4"},
    {id: 64, name: "monkey_head.png #id:monkey5"}
];

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

function selectLayer(id) {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), id);

    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref);
    desc.putBoolean( charIDToTypeID("MkVs"), false);

    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);

    return app.activeDocument.activeLayer;
}

function jumpToNextKeyframe() {
    var idtrackID = stringIDToTypeID("trackID");

    var desc1 = new ActionDescriptor();
    desc1.putEnumerated(idtrackID, stringIDToTypeID("stdTrackID"), stringIDToTypeID("sheetTransformTrack"));

    var desc2 = new ActionDescriptor();
    desc2.putObject(idtrackID, stringIDToTypeID("animationTrack"), desc1);

    executeAction(stringIDToTypeID("nextKeyframe"), desc2, DialogModes.NO);
}

function getLayerData(layer) {
    return {
        bounds: {
            left: layer.bounds[0].value,
            top: layer.bounds[1].value,
            right: layer.bounds[2].value,
            bottom: layer.bounds[3].value
        },
        opacity: layer.opacity,
        blendMode: layer.blendMode.toString()
    };
}

function collectKeyframeData(layer, dataDict, maxFrames) {
    var keyFrames = [];
    dataDict[layer.name] = keyFrames;
    keyFrames.push(getLayerData(layer));

    var last;
    var next;
    for(var i = 0; i < maxFrames; i++) {
        jumpToNextKeyframe();

        next = getLayerData(layer);
        if (last && next.bounds.left == last.bounds.left && next.bounds.top == last.bounds.top &&
            next.bounds.right == last.bounds.right && next.bounds.bottom == last.bounds.bottom) {
            return;
        }
        keyFrames.push(next);
        last = next;
    }
}

function saveFile(str) {
    var fileName = app.activeDocument.name.substring(0, app.activeDocument.name.lastIndexOf("."));
    var path = app.activeDocument.path.fsName;
    var fullPath = path + "/" + fileName + ".json";
    var file = new File(fullPath);
    file.open('w');
    file.write(str);
    file.close();
    alert("Style saved to " + fullPath);
}



function run() {
    var drawables = {};

    for (var i = 0; i < animationLayers.length; i++) {
        var anim = animationLayers[i];

        jumpToFrame0();

        var layer = selectLayer(anim.id);

        collectKeyframeData(layer, drawables, 50);
    }

    saveFile(JSON.stringify(drawables, null, "    "));

    return true;
}

run();