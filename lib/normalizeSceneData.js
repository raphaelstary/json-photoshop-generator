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

    function normalizeFrames(frames, equalsFn, propertyKey, optionalPropertyKey) {
        var startRangeIndex = 0;
        var comparePointerIndex = startRangeIndex + 1;
        var currentMatchesCounter = 0;

        while (comparePointerIndex < frames.length) {

            if (equalsFn(frames[startRangeIndex][propertyKey], frames[comparePointerIndex][propertyKey]) &&
                (!optionalPropertyKey || (equalsFn(frames[startRangeIndex][optionalPropertyKey],
                    frames[comparePointerIndex][optionalPropertyKey])))) {

                currentMatchesCounter++;
                if (currentMatchesCounter > 1 ||
                    (currentMatchesCounter == 1 && comparePointerIndex == frames.length - 1)) {
                    frames.splice(startRangeIndex + 1, 1);
                    currentMatchesCounter--;

                } else if (currentMatchesCounter == 1 && startRangeIndex == 0) {
                    frames.splice(startRangeIndex, 1);
                    currentMatchesCounter--;
                } else {
                    comparePointerIndex++;
                }

            } else {
                startRangeIndex = comparePointerIndex;
                comparePointerIndex++;
                currentMatchesCounter = 0;
            }
        }

        if (currentMatchesCounter == 1 && comparePointerIndex == frames.length) {
            frames.splice(startRangeIndex + 1, 1);
        }
    }

    function extractPosition(transform, returnObject) {
        var position = [];

        transform.forEach(function (frame) {
            if (frame.x != undefined && frame.y != undefined)
                position.push({
                    time: frame.time,
                    x: frame.x,
                    y: frame.y
                });

        });

        if (position.length > 0) {
            normalizeFrames(position, function (a, b) {
                return a == b;
            }, 'x', 'y');
            if (position.length > 1)
                returnObject.position = position;
        }

    }

    function extractRotationAndScale(transform, returnObject) {
        var rotation = [];
        var scale = [];
        transform.forEach(function (frame) {

            if (frame.rotation != undefined)
                rotation.push({
                    time: frame.time,
                    rotation: frame.rotation
                });
            if (frame.scale != undefined)
                scale.push({
                    time: frame.time,
                    scale: frame.scale
                });
        });

        if (rotation.length > 0) {
            normalizeFrames(rotation, function (a, b) {
                return Math.abs(a - b) < 0.018;
            }, 'rotation');
            if (rotation.length > 1)
                returnObject.rotation = rotation;
        }
        if (scale.length > 0) {
            normalizeFrames(scale, function (a, b) {
                return Math.abs(a - b) < 0.02;
            }, 'scale');
            if (scale.length > 1)
                returnObject.scale = scale;
        }
    }

    function normalizeSceneData(h5Document, keyFrameResult, frameData) {
        delete h5Document.animations;

        Object.keys(keyFrameResult.animations).forEach(function (id) {
            var wrapper = keyFrameResult.animations[id];

            Object.keys(wrapper).forEach(function (key) {
                if (key == 'psType')
                    return;

                var first = wrapper[key][0].time;
                if (wrapper.firstFrame === undefined) {
                    wrapper.firstFrame = first;
                } else if (first < wrapper.firstFrame) {
                    wrapper.firstFrame = first;
                }
                var last = wrapper[key][wrapper[key].length - 1].time;
                if (wrapper.lastFrame === undefined) {
                    wrapper.lastFrame = last;
                } else if (last > wrapper.lastFrame) {
                    wrapper.lastFrame = last;
                }
            });

            if (wrapper.transform) {
                if (frameData[id] && wrapper.psType == 'smartObject') {
                    // use frameData
                    extractRotationAndScale(frameData[id], wrapper);
                    extractPosition(wrapper.transform, wrapper);
                    delete wrapper.transform;

                } else if (wrapper.psType == 'text') {
                    extractRotationAndScale(wrapper.transform, wrapper);
                    extractPosition(wrapper.transform, wrapper);
                    delete wrapper.transform;

                } else if (wrapper.psType == 'shape') {
                    extractPosition(wrapper.transform, wrapper);
                    delete wrapper.transform;
                }
            }

            var drawable = getDrawable(h5Document, id);
            drawable.animations = wrapper;
        });

        return h5Document;
    }

    return normalizeSceneData;
})(Object);

module.exports = normalizeSceneData;