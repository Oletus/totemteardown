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
    ctx.scale(1.0, 1.0);
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 1;
    ctx.shadowColor = '#000';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.font="italic bold 36px Myriad Pro";
    ctx.textAlign="left";

    var TotemWinnerX = POLE_DISTANCE_FROM_EDGE;
    var TotemWinnerY = 761;

    var TotemBarX = TotemWinnerX - 125;
    var TotemBarY = 733.5;
    var count = 0;


    for(var i = 0; i < this.totemPoles.length; i++) {
        Game.HUD_Bars[i].draw(ctx, TotemBarX, TotemBarY);

        if (i==0){
            ctx.fillStyle = '#ff0000';   
        }
        else if (i==1){
            ctx.fillStyle = '#00bcbd';   
        }
        else if (i==2){
            ctx.fillStyle = '#18d122';   
        }
        else if (i==3){
            ctx.fillStyle = '#dadf00';   
        } 
        ctx.textAlign="center"; 

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
            if( this.totemPoles[i].isInitialized() >= 2 )
            {
                text = "PRESS START!"
            }
        } else {
            text = "TOTEMS:   " + this.totemPoles[i].blocks.length;
        }
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


    ctx.scale(1.0, 1.0);
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 1;
    ctx.shadowColor = '#000';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.font="italic bold 100px Myriad Pro";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(ctx.canvas.width * 0.5, ctx.canvas.height * 0.35);
    ctx.scale(ctx.canvas.width / 1200, ctx.canvas.width / 1200);

    if (this.state === Game.CHOOSE_PLAYERS)
    {
        if( count >= 2 )
        {
                ctx.fillText('PRESS START!', 0, -225);
                ctx.strokeText('PRESS START!', 0, -225);
        }
        else
        {
            //draw text
            ctx.font="italic bold 60px Myriad Pro";
            ctx.fillStyle = '#ff0000';
            ctx.strokeText("SUMMON YOUR TOTEM", 0, -225);
            ctx.fillText("SUMMON YOUR TOTEM", 0, -225);
        }
    }

    if (this.state === Game.START_COUNTDOWN) {
        var numTime = this.stateTime / START_COUNTDOWN_DURATION * 3;
        var currentNumberTime = mathUtil.fmod(numTime, 1.0);
        var num = 3 - Math.floor(numTime);
        var s = 1.6 - currentNumberTime * 0.6;
        ctx.scale(s, s);
        ctx.fillText(num, 0, 0);
        ctx.strokeText(num, 0, 0);
    } else if (this.state === Game.PLAYING) {
        if (this.stateTime < 1) {
            var s = this.stateTime + 1;
            ctx.scale(s, s);
            ctx.globalAlpha = 1 - this.stateTime;
            ctx.fillText('TAKEDOWN!', 0, -225);
            ctx.strokeText('TAKEDOWN!', 0, -225);
        }
    } else if (this.state === Game.VICTORY) {
        ctx.fillText(this.winnersText, 0, 0);
        ctx.strokeText(this.winnersText, 0, 0);
    }
};