var ps_document = require('./document');
var fs = require('fs');

function writeJSONFile(fileName, data) {
    fs.writeFile(fileName, JSON.stringify(data, null, 4), 'utf8', function (err) {
        if (err) throw err;
        console.log('success task: write ' + fileName);
    });
}

var DocumentParser = require('./../lib/DocumentParser');
var parser = new DocumentParser();

writeJSONFile('out.json', ps_document);