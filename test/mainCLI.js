var ps_document = require('./document4');
var fs = require('fs');

function writeJSONFile(fileName, data) {
    fs.writeFile(fileName, JSON.stringify(data, null, 4), 'utf8', function (err) {
        if (err) throw err;
        console.log('success task: write ' + fileName);
    });
}

var transformPSDocumentToH5Scenes = require('./../lib/transformPSDocumentToH5Scenes');

writeJSONFile('out.json', transformPSDocumentToH5Scenes(ps_document));