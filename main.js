var transformToScenes = require('./lib/transformToScenes');
var fs = require('fs');

(function (transformToScenes, fs) {
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
        var jsonFileName;

        _generator.getDocumentInfo(undefined, {expandSmartObjects: true}).then(function (document) {
            jsonFileName = document.file.substring(0, document.file.lastIndexOf('.')) + '.json';
            return transformToScenes(document);

        }).then(function (h5Document) {
            var keyFramesJSX = __dirname + '\\lib\\jsx\\GetKeyframes.jsx';
            var keyFramesParams = {
                ids: h5Document.animations
            };

            return _generator.evaluateJSXFile(keyFramesJSX, keyFramesParams);

        }).then(function (result) {
            var frames = Object.keys(result.transformFrames);
            var frameData = {};

            function nextFrame(frameNumberKey) {
                var toFrameJSX = __dirname + '\\lib\\jsx\\GoToFrame.jsx';
                var toFrameParams = {
                    frameNumber: parseInt(frameNumberKey)
                };
                var ids = frames[frameNumberKey];
                _generator.evaluateJSXFile(toFrameJSX, toFrameParams).then(function () {
                    return _generator.getDocumentInfo();

                }).then(function (document) {
                    return transformToScenes(document);
                });
            }

            nextFrame(frames.pop());
        });
    }

    function writeJSONFile(name, objectData) {
        fs.writeFile(name, JSON.stringify(objectData), function (err) {
            if (err) throw err;
            console.log('file saved to: ' + name);
        });
    }

    exports.init = init;
})(transformToScenes, fs);