var Cursor = function(options) {
    var defaults = {
        pole: 0,
        block: 0,
        width: 50,
        height: 50,
        selected: false
    };

    for(var key in defaults) {
        if(!options.hasOwnProperty(key)) {
            this[key] = defaults[key];
        } else {
            this[key] = options[key];
        }
    }
};
