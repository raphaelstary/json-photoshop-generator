var ps_document = require('./document');
var fs = require('fs');

function writeJSONFile(fileName, data) {
    fs.writeFile(fileName, JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
        console.log('file saved to: ' + fileName);
    });
}

var transformPSDocumentToH5Scenes = require('./../lib/transformToScenes');

writeJSONFile('out_transformScene.json', transformPSDocumentToH5Scenes(ps_document));