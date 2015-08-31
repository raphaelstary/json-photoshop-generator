var h5Document = require('./h5Document');
var keyFrameResult = require('./keyFrameResult');
var frameData = require('./frameData');

var fs = require('fs');

function writeJSONFile(fileName, data) {
    fs.writeFile(fileName, JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
        console.log('file saved to: ' + fileName);
    });
}

var normalize = require('./../lib/normalizeSceneData');

writeJSONFile('out_normalizeSceneData.json', normalize(h5Document, keyFrameResult, frameData));