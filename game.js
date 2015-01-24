var canvas;
var ctx;

var frame = function() {
    window.requestAnimationFrame(frame);
};

var initGame = function() {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    var block = TotemBlock();
    console.log(block);

    frame();
};
