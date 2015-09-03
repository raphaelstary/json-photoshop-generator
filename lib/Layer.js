var Vectors = require('./Vectors');

function isOpacitySet(layer) {
    return layer.blendOptions && layer.blendOptions.opacity;
}

function getOpacity(layer) {
    return layer.blendOptions.opacity.value / 100;
}

function isRotation(layer, topLeft_x, topLeft_y) {
    return !(Math.abs(topLeft_x - layer.bounds.left) < 1.5 && Math.abs(topLeft_y - layer.bounds.top) < 1.5);
}

function getRotation(optionalVector_orTopLeft_x, topLeft_y, topRight_x, topRight_y) {
    var vector = optionalVector_orTopLeft_x.x !== undefined ? optionalVector_orTopLeft_x :
        Vectors.get(optionalVector_orTopLeft_x, topLeft_y, topRight_x, topRight_y);

    return Vectors.getAngle(vector.x, vector.y);
}

function isMatrixRotation(transformMatrix) {
    return !(!transformMatrix || (transformMatrix.xy == 0 && transformMatrix.yy == 1));
}

function getMatrixRotation(transformMatrix) {
    return Math.atan2(transformMatrix.xy, transformMatrix.yy); // todo maybe wrong (xy <-> yy)
}

module.exports = {
    isOpacitySet: isOpacitySet,
    getOpacity: getOpacity,
    isRotated: isRotation,
    getRotation: getRotation,
    isMatrixRotation: isMatrixRotation,
    getMatrixRotation: getMatrixRotation
};