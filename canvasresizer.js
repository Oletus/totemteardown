/**
 * A class to help keeping canvas size suitable for the window or parent
 * element resolution.
 * @param {Object} options Object with the following optional keys:
 *  canvas: HTMLCanvasElement (one is created by default)
 *  mode: CanvasResizer.Mode (defaults to filling the window)
 *  width: number
 *  height: number
 *  parentElement: HTMLElement (defaults to the document body)
 */
var CanvasResizer = function(options) {
    var defaults = {
        canvas: null,
        mode: CanvasResizer.Mode.DYNAMIC,
        width: 16,
        height: 9,
        parentElement: document.body
    };

    for(var key in defaults) {
        if (!options.hasOwnProperty(key)) {
            this[key] = defaults[key];
        } else {
            this[key] = options[key];
        }
    }
    if (this.canvas !== null) {
        if (!options.hasOwnProperty('width')) {
            this.width = this.canvas.width;
        }
        if (!options.hasOwnProperty('height')) {
            this.height = this.canvas.height;
        }
    } else {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    this.canvasWidthToHeight = this.width / this.height;

    if (this.mode === CanvasResizer.Mode.FIXED_RESOLUTION) {
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    var that = this;
    var resize = function() {
        that.resize();
    }
    if (this.parentElement === document.body) {
        document.body.style.padding = '0';
        document.body.style.margin = '0';
    } else {
        this.parentElement.style.padding = '0';
    }
    // No need to remove the object from existing parent if it has one
    this.parentElement.appendChild(this.canvas);
    window.addEventListener('resize', resize, false);
    this.resize();
};

CanvasResizer.Mode = {
    // Fixed amount of pixels, rendered pixelated:
    FIXED_RESOLUTION: 0,
    // Fixed amount of pixels, rendered interpolated:
    FIXED_RESOLUTION_INTERPOLATED: 1,
    // Only available for 2D canvas. Set the canvas transform on render to emulate a fixed coordinate system:
    // TODO: FIXED_COORDINATE_SYSTEM: 2,
    // Fix the aspect ratio, but not the coordinate system:
    FIXED_ASPECT_RATIO: 3,
    // Make the canvas fill the containing element completely:
    DYNAMIC: 4
};

CanvasResizer.prototype.resize = function() {
    // Resize only on a render call to avoid flicker from changing canvas
    // size.
    this.resizeOnNextRender = true;
};

CanvasResizer.prototype.update = function() {
    // Do nothing. This function exists just for mainloop compatibility.
};

CanvasResizer.prototype.render = function() {
    if (this.resizeOnNextRender) {
        var parentProperties = this._getParentProperties();
        var parentWidth = parentProperties.width;
        var parentHeight = parentProperties.height;
        var parentWidthToHeight = parentProperties.widthToHeight;
        if (this.mode === CanvasResizer.Mode.FIXED_RESOLUTION ||
            this.mode === CanvasResizer.Mode.FIXED_RESOLUTION_INTERPOLATED) {
            this._resizeFixedResolution();
        } else if (/*this.mode === CanvasResizer.Mode.FIXED_COORDINATE_SYSTEM ||*/
                   this.mode === CanvasResizer.Mode.FIXED_ASPECT_RATIO) {
            if (parentWidthToHeight > this.canvasWidthToHeight) {
                // Parent is wider, so there will be empty space on the left and right
                this.canvas.height = parentHeight;
                this.canvas.width = Math.floor(this.canvasWidthToHeight * this.canvas.height);
                this.canvas.style.marginTop = '0';
                this.canvas.style.marginLeft = Math.round((parentWidth - this.canvas.width) * 0.5) + 'px';
            } else {
                // Parent is narrower, so there will be empty space on the top and bottom
                this.canvas.width = parentWidth;
                this.canvas.height = Math.floor(this.canvas.width / this.canvasWidthToHeight);
                this.canvas.style.marginTop = Math.round((parentHeight - this.canvas.height) * 0.5) + 'px';
                this.canvas.style.marginLeft = '0';
            }
            this.canvas.style.width = this.canvas.width + 'px';
            this.canvas.style.height = this.canvas.height + 'px';
        } else { // CanvasResizer.Mode.DYNAMIC
            this.canvas.width = parentWidth;
            this.canvas.height = parentHeight;
            this.canvas.style.width = parentWidth + 'px';
            this.canvas.style.height = parentHeight + 'px';
            this.canvas.style.marginTop = '0';
            this.canvas.style.marginLeft = '0';
        }
    }
};

/**
 * Get a canvas coordinate space position from a given event.
 * The coordinate space is relative to the width and height properties on
 * this object.
 * @return {Object} Object with x and y keys for horizontal and vertical
 * positions in the canvas coordinate space.
 */
CanvasResizer.prototype.getCanvasPosition = function(event) {
    // TODO
};

/**
 * @return {HTMLCanvasElement} The canvas element this resizer is using.
 * If no canvas element was passed in on creation, one has been created.
 */
CanvasResizer.prototype.getCanvas = function() {
    return this.canvas;
};

/**
 * @param {number} width New width for the canvas element.
 * @param {number} height New height for the canvas element.
 */
CanvasResizer.prototype.changeCanvasDimensions = function(width, height) {
    this.width = width;
    this.height = height;
    this.canvasWidthToHeight = this.width / this.height;
    this.resize();
};

/**
 * Change the resizing mode.
 */
CanvasResizer.prototype.changeMode = function(mode) {
    this.mode = mode;
    if (this.mode === CanvasResizer.Mode.FIXED_RESOLUTION) {
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    } else {
        this.canvas.style.imageRendering = 'auto';
    }
    this.resize();
};

/**
 * @protected
 */
CanvasResizer.prototype._getParentProperties = function() {
    var parentProperties = {};
    if (this.parentElement === document.body) {
        parentProperties.width = window.innerWidth;
        parentProperties.height = window.innerHeight;
    } else {
        parentProperties.width = this.parentElement.clientWidth;
        parentProperties.height = this.parentElement.clientHeight;
    }
    parentProperties.widthToHeight = parentProperties.width / parentProperties.height;
    return parentProperties;
};

/**
 * @protected
 */
CanvasResizer.prototype._resizeFixedResolution = function() {
    if (this.mode !== CanvasResizer.Mode.FIXED_RESOLUTION &&
        this.mode !== CanvasResizer.Mode.FIXED_RESOLUTION_INTERPOLATED) {
        return;
    }
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    var parentProperties = this._getParentProperties();
    var parentWidth = parentProperties.width;
    var parentHeight = parentProperties.height;
    var parentWidthToHeight = parentProperties.widthToHeight;
    var styleWidth = 0;
    var styleHeight = 0;
    if (this.mode === CanvasResizer.Mode.FIXED_RESOLUTION) {
        var maxWidth = parentWidth * window.devicePixelRatio;
        var maxHeight = parentHeight * window.devicePixelRatio;
        if (this.canvas.width > maxWidth || this.canvas.height > maxHeight) {
            if (parentWidthToHeight > this.canvasWidthToHeight) {
                styleHeight = parentHeight;
                styleWidth = Math.floor(this.canvasWidthToHeight * styleHeight);
            } else {
                styleWidth = parentWidth;
                styleHeight = Math.floor(styleWidth / this.canvasWidthToHeight);
            }
        } else {
            var i = 1;
            while ((i + 1) * this.width < maxWidth && (i + 1) * this.height < maxHeight) {
                ++i;
            }
            styleWidth = (this.width * i);
            styleHeight = (this.height * i);
        }
    } else if (this.mode === CanvasResizer.Mode.FIXED_RESOLUTION_INTERPOLATED) {
        if (parentWidthToHeight > this.canvasWidthToHeight) {
            styleHeight = parentHeight;
            styleWidth = Math.floor(this.canvasWidthToHeight * styleHeight);
        } else {
            styleWidth = parentWidth;
            styleHeight = Math.floor(styleWidth / this.canvasWidthToHeight);
        }
    }
    this.canvas.style.width = styleWidth + 'px';
    this.canvas.style.height = styleHeight + 'px';
    this.canvas.style.marginLeft = Math.round((parentWidth - styleWidth) * 0.5) + 'px';
    this.canvas.style.marginTop = Math.round((parentHeight - styleHeight) * 0.5) + 'px';
};
