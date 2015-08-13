module.exports = {
    startsWidth: function (actualString, searchString) {
        return actualString.indexOf(searchString, 0) === 0;
    },

    includes: function (actualString, searchString) {
        return actualString.indexOf(searchString) !== -1;
    }
};