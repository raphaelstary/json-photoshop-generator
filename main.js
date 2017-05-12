var transformToScenes = require('./lib/transformToScenes');
var fs = require('fs');
var transformSmartObjects = require('./lib/transformSmartObjects');
var normalizeSceneData = require('./lib/normalizeSceneData');
var storeFrames = require('./lib/storeFrames');

(function (transformToScenes, fs, transformSmartObjects, normalizeSceneData, storeFrames, JSON, Math) {
    'use strict';

    // var PLUGIN_ID = require('./package.json').name;
    var MENU_ID = 'json';
    var MENU_LABEL = 'export JSON once';

    var SRC_PATH_POSTFIX = '-code';
    var OUTPUT_PATH = '/src/resources/data-gen';
    var OUTPUT_FILE_NAME = '/scenes';
    var OUTPUT_EXTENSION = '.json';

    var _generator = null, _currentDocumentId = null, _config = null;

    function init(generator, config) {
        _generator = generator;
        _config = config;

        console.log('initializing generator highfive.js JSON with config %j', _config);

        _generator.addMenuItem(MENU_ID, MENU_LABEL, true, false).then(function () {
            console.log('Menu created', MENU_ID);
        }, function () {
            console.error('Menu creation failed', MENU_ID);
        });

        _generator.onPhotoshopEvent('generatorMenuChanged', handleGeneratorMenuClicked);
        _generator.onPhotoshopEvent('currentDocumentChanged', handleCurrentDocumentChanged);
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
        var veryStart = Date.now();
        //noinspection JSPotentiallyInvalidConstructorUsage
        console.log(Date() + ' generate JSON started');

        var jsonFileName;
        var placedInfo;
        var h5doc;
        var once = true;
        var start = Date.now();
        _generator.getDocumentInfo(undefined, {
            expandSmartObjects: true,
            getPathData: true
        }).then(function (document) {
            console.log('initial document info ' + (Date.now() - start) + ' ms');
            start = Date.now();

            var fileNamePlusExtension = document.file.substring(document.file.lastIndexOf('\\'));
            var fileName = fileNamePlusExtension.substring(0, fileNamePlusExtension.lastIndexOf('.'));

            var assetsSubFolder = document.file.substring(0, document.file.lastIndexOf('\\'));
            var parentProjectFolder = assetsSubFolder.substring(0, assetsSubFolder.lastIndexOf('\\'));
            var folderName = parentProjectFolder.substring(parentProjectFolder.lastIndexOf('\\'));

            jsonFileName = parentProjectFolder + folderName + SRC_PATH_POSTFIX + OUTPUT_PATH + OUTPUT_FILE_NAME;

            if (fileName.includes('-')) {
                jsonFileName += fileName.substring(fileName.lastIndexOf('-'));
            }

            jsonFileName += OUTPUT_EXTENSION;

            // needed for cellular automata puzzle
            // jsonFileName = document.file.substring(0, document.file.lastIndexOf('\\')) + OUTPUT_PATH +
            //     document.file.substring(document.file.lastIndexOf('\\'), document.file.lastIndexOf('.')) + '.json';

            placedInfo = document.placed;

            return transformToScenes(document);

        }).then(function (h5Document) {
            console.log('scene transform ' + (Date.now() - start) + ' ms');
            start = Date.now();

            h5doc = h5Document;

            if (!h5Document.animations) {
                writeJSONFile(jsonFileName, h5doc, function () {
                    console.log('write file ' + (Date.now() - start) + ' ms');

                    var totalTime = Date.now() - veryStart;
                    console.log(
                        'generate JSON successful ' + Math.floor(totalTime / 60000) + ' min (' + totalTime + ' ms)');
                });
                return;
            }

            var keyFramesJSX = __dirname + '\\lib\\jsx\\GetKeyframes.jsx';
            var keyFramesParams = {
                ids: h5Document.animations
            };

            _generator.evaluateJSXFile(keyFramesJSX, keyFramesParams).then(function (keyFrameResult) {
                console.log('get keyframes ' + (Date.now() - start) + ' ms');
                start = Date.now();

                var frames = Object.keys(keyFrameResult.transformFrames);
                var frameData = {};

                function nextFrame(frameNumberKey) {
                    var toFrameJSX = __dirname + '\\lib\\jsx\\GoToFrame.jsx';
                    var toFrameParams = {
                        frameNumber: parseInt(frameNumberKey)
                    };
                    var ids = keyFrameResult.transformFrames[frameNumberKey];
                    _generator.evaluateJSXFile(toFrameJSX, toFrameParams).then(function () {
                        return _generator.getDocumentInfo();

                    }).then(function (document) {
                        return transformSmartObjects(ids, document, placedInfo, toFrameParams.frameNumber);

                    }).then(function (smartObjectFrames) {
                        storeFrames(smartObjectFrames, frameData);

                        if (frames.length > 0) {
                            nextFrame(frames.shift());
                        } else {
                            return true;
                        }

                    }).then(function (ready) {
                        if (ready && once) { // maybe cleaner if extracted to a finally block
                            once = false;

                            console.log('get smart object keyframes ' + (Date.now() - start) + ' ms');
                            start = Date.now();

                            var output = normalizeSceneData(h5doc, keyFrameResult, frameData);

                            console.log('normalize data ' + (Date.now() - start) + ' ms');
                            start = Date.now();

                            writeJSONFile(jsonFileName, output, function () {
                                console.log('write file ' + (Date.now() - start) + ' ms');

                                var totalTime = Date.now() - veryStart;
                                console.log(
                                    'generate JSON successful ' + Math.floor(totalTime / 60000) + ' min (' + totalTime +
                                    ' ms)');
                            });
                        }
                    });
                }

                nextFrame(frames.shift());
            });

        });
    }

    function writeJSONFile(name, objectData, callback) {
        fs.writeFile(name, JSON.stringify(objectData), function (err) {
            if (err) {
                throw err;
            }
            console.log('file saved to: ' + name);
            if (callback) {
                callback();
            }
            //noinspection JSPotentiallyInvalidConstructorUsage
            console.log(Date() + ' generate JSON finished');
        });
    }

    exports.init = init;
})(transformToScenes, fs, transformSmartObjects, normalizeSceneData, storeFrames, JSON, Math);