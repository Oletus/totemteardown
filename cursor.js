var Cursor = function(options) {
    var defaults = {
        x: 0,
        y: 0,
        width: 55,
        height: 55,
        index: 0
    };

    for(var key in defaults) {
        if(!options.hasOwnProperty(key)) {
            this[key] = defaults[key];
        } else {
            this[key] = options[key];
        }
    }
};
