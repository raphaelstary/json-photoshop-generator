(function () {
    "use strict";

    var PLUGIN_ID = require("./package.json").name;
    var MENU_ID = "json";
    var MENU_LABEL = "export JSON once";

    var _generator = null,
        _currentDocumentId = null,
        _config = null;

    function init(generator, config) {
        _generator = generator;
        _config = config;

        console.log("initializing generator highfive.js JSON with config %j", _config);

        _generator.addMenuItem(MENU_ID, MENU_LABEL, true, false).then(
            function () {
                console.log("Menu created", MENU_ID);
            }, function () {
                console.error("Menu creation failed", MENU_ID);
            }
        );

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


    }

    function requestEntireDocument(documentId) {
        if (!documentId) {
            console.log("Determining the current document ID");
        }

        _generator.getDocumentInfo(documentId, {expandSmartObjects:true}).then(
            function (document) {
                console.log("Received complete document:", stringify(document));
            },
            function (err) {
                console.error("Error in getDocumentInfo:", err);
            }
        ).done();
    }

    exports.init = init;
})();