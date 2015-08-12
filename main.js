var transformPSDocumentToH5Scenes = require('./lib/transformPSDocumentToH5Scenes');
var fs = require('fs');

(function (transformPSDocumentToH5Scenes, fs) {
    "use strict";

    var PLUGIN_ID = require("./package.json").name;
    var MENU_ID = "json";
    var MENU_LABEL = "export JSON once";

    var _generator = null, _currentDocumentId = null, _config = null;

    function init(generator, config) {
        _generator = generator;
        _config = config;

        console.log("initializing generator highfive.js JSON with config %j", _config);

        _generator.addMenuItem(MENU_ID, MENU_LABEL, true, false).then(function () {
            console.log("Menu created", MENU_ID);
        }, function () {
            console.error("Menu creation failed", MENU_ID);
        });

        _generator.onPhotoshopEvent("generatorMenuChanged", handleGeneratorMenuClicked);
        _generator.onPhotoshopEvent("currentDocumentChanged", handleCurrentDocumentChanged);
    }

    function handleCurrentDocumentChanged(id) {
        if (_currentDocumentId === id) {
            return;
        }
        _currentDocumentId = id;
    }

    function handleGeneratorMenuClicked(event) {
        // Ignore changes to other menus
        var menu = event.generatorMenuChanged;
        if (!menu || menu.name !== MENU_ID) {
            return;
        }

        generateJSON();
    }

    function generateJSON() {
        _generator.getDocumentInfo(undefined, {expandSmartObjects: true}).then(function (document) {
            var h5Document = transformPSDocumentToH5Scenes(document);
            var fileName = document.file.substring(0, document.file.lastIndexOf('.')) + '.json';
            fs.writeFile(fileName, JSON.stringify(h5Document), 'utf8', function (err) {
                if (err) throw err;
                console.log('success task: write ' + fileName);
            });

        }, function (err) {
            console.error("Error in getDocumentInfo:", err);
        }).done();
    }

    exports.init = init;
})(transformPSDocumentToH5Scenes, fs);