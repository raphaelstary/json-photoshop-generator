var Layer = require('./../lib/Layer');

var topLeft = {
    x: 798.59,
    y: 941.79
};
var topRight = {
    x: 899.66,
    y: 900.96
};
var bottomLeft = {
    x: 905.34,
    y: 1206.04
};
var bottomRight = {
    x: 1006.41,
    y: 1165.21
};

console.log(Layer.getRotation(topLeft.x, topLeft.y, topRight.x, topRight.y));
console.log(Layer.getRotation(topRight.x, topRight.y, topLeft.x, topLeft.y));

console.log(Layer.getRotation(bottomLeft.x, bottomLeft.y, bottomRight.x, bottomRight.y));
console.log(Layer.getRotation(bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y));

console.log(Layer.getRotation(topLeft.x, topLeft.y, bottomLeft.x, bottomLeft.y));
console.log(Layer.getRotation(bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y));

console.log(Layer.getRotation(topRight.x, topRight.y, bottomRight.x, bottomRight.y));
console.log(Layer.getRotation(bottomRight.x, bottomRight.y, topRight.x, topRight.y));