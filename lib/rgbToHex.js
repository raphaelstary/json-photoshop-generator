function componentToHex(color) {
    var hex = Math.floor(color).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(red, green, blue) {
    return "#" + componentToHex(red || 0) + componentToHex(green || 0) + componentToHex(blue || 0);
}

module.exports = rgbToHex;