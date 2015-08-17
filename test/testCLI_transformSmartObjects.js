var ps_document = require('./document');
var fs = require('fs');

function writeJSONFile(fileName, data) {
    fs.writeFile(fileName, JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
        console.log('file saved to: ' + fileName);
    });
}

var transform = require('./../lib/transformSmartObjects');

var placedInfo = ps_document.placed;
delete ps_document.placed;

var ids = [
    {
        "id": 63,
        "artboard": {
            "top": 966,
            "left": 876,
            "bottom": 3174,
            "right": 2118
        }
    },
    {
        "id": 21,
        "artboard": {
            "top": 966,
            "left": 876,
            "bottom": 3174,
            "right": 2118
        }
    },
    {
        "id": 61,
        "artboard": {
            "top": 966,
            "left": 876,
            "bottom": 3174,
            "right": 2118
        }
    },
    {
        "id": 62,
        "artboard": {
            "top": 966,
            "left": 876,
            "bottom": 3174,
            "right": 2118
        }
    },
    {
        "id": 64,
        "artboard": {
            "top": 966,
            "left": 876,
            "bottom": 3174,
            "right": 2118
        }
    }
];

writeJSONFile('out_transformSmart.json', transform(ids, ps_document, placedInfo, 10));