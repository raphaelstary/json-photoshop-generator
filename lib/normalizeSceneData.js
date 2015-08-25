var normalizeSceneData = (function (Object) {
    "use strict";

    function getDrawable(h5Document, id) {
        var returnObject;

        var sceneKeys = Object.keys(h5Document);
        sceneKeys.some(function (sceneKey) {
            var scene = h5Document[sceneKey];
            return scene.drawables.some(function (drawable) {
                var foundIt = drawable.referenceId == id;
                if (foundIt)
                    returnObject = drawable;
                return foundIt;
            });
        });

        return returnObject;
    }

    function normalizeSceneData(h5Document, keyFrameResult, frameData) {
        delete h5Document.animations;

        Object.keys(keyFrameResult.animations).forEach(function (id) {
            var wrapper = keyFrameResult.animations[id];
            if (wrapper.transform && frameData[id]) {
                // use frameData
                wrapper.transform = frameData[id];
            }

            var drawable = getDrawable(h5Document, id);
            drawable.animations = wrapper;
        });

        return h5Document;
    }

    return normalizeSceneData;
})(Object);

module.exports = normalizeSceneData;