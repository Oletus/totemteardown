Game.HUD_Bar_Red = new Sprite('HUD_Bar_Red.png');
Game.HUD_Bar_Blue = new Sprite('HUD_Bar_Blue.png');
Game.HUD_Bar_Green = new Sprite('HUD_Bar_Green.png');
Game.HUD_Bar_Yellow = new Sprite('HUD_Bar_Yellow.png');

Game.prototype.drawHud = function() {
    var TotemBarY = 733.5;
    Game.HUD_Bar_Red.draw(ctx, 55,TotemBarY);
    Game.HUD_Bar_Blue.draw(ctx, 305,TotemBarY);
    Game.HUD_Bar_Green.draw(ctx, 555,TotemBarY);
    Game.HUD_Bar_Yellow.draw(ctx, 805,TotemBarY);

    //##
    ctx.scale(1.0, 1.0);
    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 1;
    ctx.shadowColor = '#000';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.font="italic bold 36px Myriad Pro";
    ctx.textAlign="left";

    var TotemWinnerX = 180;
    var TotemWinnerY = 757.5;
    
    //draw text

    for(var i = 0; i < this.totemPoles.length; i++) {
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
                text = "READY!"
            }
        } else {
            text = "TOTEMS:   " +this.totemPoles[i].blocks.length;
        }
        ctx.strokeText(text, TotemWinnerX, TotemWinnerY);
        ctx.fillText(text, TotemWinnerX, TotemWinnerY);
        TotemWinnerX+=250;
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
            ctx.fillText('TAKEDOWN!', 0, 0);
            ctx.strokeText('TAKEDOWN!', 0, 0);
        }
    } else if (this.state === Game.VICTORY) {
        ctx.scale(0.75, 0.75);
        ctx.fillText(this.winnersText, 0, 0);
        ctx.strokeText(this.winnersText, 0, 0);
    }
};