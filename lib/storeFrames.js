var storeFrames = (function () {
    "use strict";

    function storeFrames(smartObjectFrames, frameDataStore) {
        smartObjectFrames.forEach(function (frameWrapper) {
            if (frameDataStore[frameWrapper.id]) {
                frameDataStore[frameWrapper.id].push(frameWrapper.frame);
            } else {
                frameDataStore[frameWrapper.id] = [frameWrapper.frame];
            }
        });
    }

    return storeFrames;
})();

module.exports = storeFrames;