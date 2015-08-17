var h5Document = require('./h5Document');
var keyFrameResult = require('./keyFrameResult');
var smartObjectFrames = require('./smartObjectFrames');

var fs = require('fs');

function writeJSONFile(fileName, data) {
    fs.writeFile(fileName, JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
        console.log('file saved to: ' + fileName);
    });
}

var storeFrames = require('./../lib/storeFrames');
var normalize = require('./../lib/normalizeSceneData');

var frameData = {};
storeFrames(smartObjectFrames, frameData);

writeJSONFile('out_normalizeSceneData.json', normalize(h5Document, keyFrameResult, frameData));