var TotemBlock = function(options) {
    var defaults = {
        x: 0,
        y: 0,
        width: 50,
        height: 50
    };

    for(var key in defaults) {
        if(!options.hasOwnProperty(key)) {
            this[key] = defaults[key];
        } else {
            this[key] = options[key];
        }
    }
};

