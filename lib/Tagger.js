var StringUtils = require('./StringUtils');

function setTaggedId(layer, drawable) {
    if (StringUtils.includes(layer.name, '#id')) {
        layer.name.split(' ').some(function (part) {
            if (StringUtils.includes(part, '#id')) {
                drawable.viewId = part.split(':')[1];
                return true;
            }
            return false;
        });
    }
}

function setTaggedZIndex(layer, drawable) {
    if (StringUtils.includes(layer.name, '#zIndex')) {
        layer.name.split(' ').some(function (part) {
            if (StringUtils.includes(part, '#zIndex')) {
                drawable.zIndex = parseInt(part.split(':')[1]);
                return true;
            }
            return false;
        });
    }
}

function setGroupTaggedZIndex(drawable, tags) {
    var zIndex;
    if (tags.some(function (tag) {
            var foundSmth = tag.zIndex !== undefined;
            if (foundSmth)
                zIndex = tag.zIndex;
            return foundSmth;
        }) && !drawable.zIndex) {
        drawable.zIndex = parseInt(zIndex);
    }
}

function referenceAnimationTagging(drawable, tags, animations) {
    if (tags.some(function (tag) {
            return tag == 'animation';
        })) {
        animations.push(drawable.referenceId);
    }
}

function parseTags(nameParts) {
    var tags = [];
    nameParts.forEach(function (part) {
        if (StringUtils.includes(part, '#')) {
            var tagParts = part.split(':');
            if (tagParts.length > 1) {
                var tag = {};
                tag[tagParts[0].substr(1)] = tagParts[1];
                tags.push(tag);
            } else {
                tags.push(tagParts[0].substr(1));
            }
        }
    });
    return tags;
}

module.exports = {
    setTaggedId: setTaggedId,
    setTaggedZIndex: setTaggedZIndex,
    setGroupTaggedZIndex: setGroupTaggedZIndex,
    referenceAnimationTagging: referenceAnimationTagging,
    parseTags: parseTags
};