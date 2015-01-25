Game.HUD_Bar_Red = new Sprite('HUD_Bar_Red.png');
Game.HUD_Bar_Blue = new Sprite('HUD_Bar_Blue.png');
Game.HUD_Bar_Green = new Sprite('HUD_Bar_Green.png');
Game.HUD_Bar_Yellow = new Sprite('HUD_Bar_Yellow.png');

Game.HUD_Bars = [
    Game.HUD_Bar_Red,
    Game.HUD_Bar_Blue,
    Game.HUD_Bar_Green,
    Game.HUD_Bar_Yellow,
];

Game.prototype.drawHud = function() {

    //##
    ctx.save();
    ctx.shadowBlur = 1;
    ctx.shadowColor = '#000';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.font="italic bold 36px Myriad Pro";

    var TotemWinnerX = POLE_DISTANCE_FROM_EDGE;
    var TotemWinnerY = 771;

    var TotemBarX = TotemWinnerX - 125;
    var TotemBarY = 733.5;
    var count = 0;

    var guiColors = ['#ff0000', '#00bcbd', '#18d122', '#dadf00'];

    for(var i = 0; i < this.totemPoles.length; i++) {
        var text = "";
        if (this.state === Game.VICTORY) {
            if (this.totemPoles[i].blocks.length >= VICTORY_BLOCKS){
                text = "WINNER!!";
            }
        } else if (this.state === Game.CHOOSE_PLAYERS) {
            if (!this.totemPoles[i].isInitialized()) {
                if (this.totemPoles[i].blocks[0].type == TotemBlock.Type.INIT) {
                    text = "PRESS X";
                } else if (this.cursors[i].selected) {
                    text = "DRAG TO TOP";
                } else {
                    text = "HOLD A";
                }
            } else {
                count += 1
                text = "READY!"
            }
        } else {
            text = "TOTEMS:   " + this.totemPoles[i].blocks.length;
        }

        Game.HUD_Bars[i].draw(ctx, TotemBarX, TotemBarY);
        ctx.fillStyle = guiColors[i];
        ctx.textAlign="center";
        ctx.strokeText(text, TotemWinnerX, TotemWinnerY);
        ctx.fillText(text, TotemWinnerX, TotemWinnerY);

        if (this.state === Game.CHOOSE_PLAYERS) {
            var ptext = 'P' + (i + 1);
            var PNy = this.totemPoles[i].blocks[0].y - 130;
            ctx.save();
            ctx.translate(0, Math.sin(this.stateTime * 2) * 10);
            ctx.strokeText(ptext, TotemWinnerX, PNy);
            ctx.fillText(ptext, TotemWinnerX, PNy);
            ctx.translate(0, 25);
            ctx.beginPath();
            ctx.moveTo(TotemWinnerX, PNy + 10);
            ctx.lineTo(TotemWinnerX + 10, PNy);
            ctx.lineTo(TotemWinnerX - 10, PNy);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        }

        TotemWinnerX += POLE_DISTANCE;
        TotemBarX += POLE_DISTANCE;
    }

    // Centered UI
    
    ctx.translate(ctx.canvas.width * 0.5, 0);
    ctx.fillStyle = '#ff0000';
    
    if (this.state === Game.CHOOSE_PLAYERS)
    {
        if( count >= MIN_PLAYERS )
        {
            ctx.lineWidth = 2;
            ctx.font="italic bold 50px Myriad Pro";
            ctx.fillText('PRESS START WHEN ALL PLAYERS ARE READY!', 0, 80);
            ctx.strokeText('PRESS START WHEN ALL PLAYERS ARE READY!', 0, 80);
        } else {
            ctx.lineWidth = 2;
            ctx.font="italic bold 50px Myriad Pro";
            ctx.strokeText("SUMMON YOUR TOTEM USING YOUR GAMEPAD", 0, 80);
            ctx.fillText("SUMMON YOUR TOTEM USING YOUR GAMEPAD", 0, 80);
        }
    }
    

    // UI that's scaled according to resolution:
    
    ctx.translate(0, ctx.canvas.height * 0.35);
    ctx.scale(ctx.canvas.width / 1200, ctx.canvas.width / 1200);
    
    ctx.lineWidth = 5;
    ctx.font="italic bold 100px Myriad Pro";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.state === Game.PRE_COUNTDOWN) {
        var numTime = this.stateTime / PRE_COUNTDOWN_DURATION;
        var s = 1.3 - numTime * 0.3;
        ctx.scale(s, s);
        var txt = 'BE THE FIRST';
        ctx.fillText(txt, 0, -50);
        ctx.strokeText(txt, 0, -50);
        var txt2 = 'TO REACH THE TOP';
        ctx.fillText(txt2, 0, 50);
        ctx.strokeText(txt2, 0, 50);
    } else if (this.state === Game.START_COUNTDOWN) {
        var NUM_TIME_STEPS = 3;
        var numTime = this.stateTime / START_COUNTDOWN_DURATION * NUM_TIME_STEPS;
        var currentNumberTime = mathUtil.fmod(numTime, 1.0);
        var num = NUM_TIME_STEPS - Math.floor(numTime);
        var s = 1.6 - currentNumberTime * 0.6;
        ctx.scale(s, s);
        ctx.fillText(num, 0, 0);
        ctx.strokeText(num, 0, 0);
    } else if (this.state === Game.PLAYING) {
        if (this.stateTime < 1) {
            var s = this.stateTime + 1;
            ctx.scale(s, s);
            ctx.globalAlpha = 1 - this.stateTime;
            ctx.fillText('TAKEDOWN!', 0, 0);
            ctx.strokeText('TAKEDOWN!', 0, 0);
        }
    } else if (this.state === Game.VICTORY) {
        ctx.fillText(this.winnersText, 0, -50);
        ctx.strokeText(this.winnersText, 0, -50);
        if (this.stateTime > MIN_VICTORY_TIME) {
            if (Math.sin(this.stateTime * 2.0) > 0) {
                ctx.fillText('PRESS START TO RESET', 0, 50);
                ctx.strokeText('PRESS START TO RESET', 0, 50);
            }
        }
    }
    ctx.restore();
};