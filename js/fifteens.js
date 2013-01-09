function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
r(function(){
	window.logger = true;
	var f = new Fifteens();
	f.init();

});

function Fifteens(){
	if (window.event) {
		alert('IE? Fuck this shit!');
		return;
	}
	if (arguments.callee.instance) {
		return arguments.callee.instance;
	}
	arguments.callee.instance = this;

	var chips = [];
	var canva;
	var ctx;
	var chipImage = document.createElement('img');
	var activeChip = {};
	var lastMousePosition = null;
	var oldtime = null;
	var maxTimeBetweenFrames = 0;
	var turns = 0;
	var fieldOffsetX = 0;
	var fieldOffsetY = 30;
	var inputs = {};
	var info = null;
	var restartButton = null;
	inputs.x = document.getElementById('x');
	inputs.y = document.getElementById('y');
	inputs.fps = document.getElementById('fps');
	var requestAnimFrame =
		window.requestAnimationFrame        ||
		window.webkitRequestAnimationFrame  ||
		window.mozRequestAnimationFrame     ||
		window.oRequestAnimationFrame       ||
		window.msRequestAnimationFrame      ||
		function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
		};

	var checkFieldSolve = function() {
		var n =
			chips
				.map(function(chip, i){
						var _thisPosition = i || 0;
						var test = 0;
						if (chip) {
							for (var j=0; j<_thisPosition; j++){
								if (chips[j] && chips[j].number > chip.number) {
									test++;
								}
							}
						}
						return test;
					})
				.reduce(function(sum, curr){
						return sum+curr;
					}, 0);
		var k = 1 + (chips.indexOf(null) / 4 >> 0);
		return n == 0 ? -1 : n + k;
	};

	var randomizeChips = function(){
		chips.sort(function(a,b){return 0.5 - Math.random()});
		while(checkFieldSolve() % 2){
			chips.sort(function(a,b){return 0.5 - Math.random()});
		}
		/*var tmp = chips[6];
		chips[6] = chips[15];
		chips[15] = tmp;
		cns(checkFieldSolve());*/
		chips.forEach(function(chip,i){
			if (chip) chip.updatePosition(i, fieldOffsetX, fieldOffsetY)
		});
	};

	var restartGame = function(){
		ctx.clearRect(fieldOffsetX, fieldOffsetY, 400, 400);
		info.resetTurns();
		randomizeChips();
		chips.forEach(function(chp){
			if (chp) {
				chp.show(ctx);
			}
		})
	};

	var RestartButton = function(){
		if (arguments.callee.instance) {
			return arguments.callee.instance;
		}
		this.x = 304;
		this.y = 0;
		this.height = 30;
		this.width = 92;
		this.needRedraw = true;
		this.hover = false;
		this.color = '#027981';
		this.hoverColor = '#ffb7a9';
	};
	RestartButton.prototype.draw = function(context){
		context.save();
		this.hover ? context.fillStyle = this.hoverColor : context.fillStyle = '#f2f2f2';
		context.strokeStyle = this.color;
		var radius = 10;
		var marg = 1;
		context.beginPath();
		context.moveTo(this.x+radius+marg,this.y+marg);
		context.arcTo(this.x+this.width-marg,this.y+marg,this.x+this.width-marg,this.y+radius+marg,radius);
		context.arcTo(this.x+this.width-marg,this.y+this.height-marg,this.x+this.width-radius-marg,this.y+this.height-marg,radius);
		context.arcTo(this.x+marg,this.y+this.height-marg,this.x+marg,this.y+this.height-radius-marg,radius);
		context.arcTo(this.x+marg,this.y+marg,this.x+radius+marg,this.y+marg,radius);
		context.fill();
		context.stroke();
		context.fillStyle=this.color;
		context.textBaseline = "top";
		context.textAlign = "left";
		context.font = this.height/2 + "pt Arial";
		context.fillText('Restart', this.x + 10, this.y + 5);
		context.restore();
		this.needRedraw = false;
	};
	RestartButton.prototype.mouseOver = function(x,y, ctx){
		var radius = 10;
		var marg = 1;
		ctx.beginPath();
		ctx.moveTo(this.x+radius+marg,this.y+marg);
		ctx.arcTo(this.x+this.width-marg,this.y+marg,this.x+this.width-marg,this.y+radius+marg,radius);
		ctx.arcTo(this.x+this.width-marg,this.y+this.height-marg,this.x+this.width-radius-marg,this.y+this.height-marg,radius);
		ctx.arcTo(this.x+marg,this.y+this.height-marg,this.x+marg,this.y+this.height-radius-marg,radius);
		ctx.arcTo(this.x+marg,this.y+marg,this.x+radius+marg,this.y+marg,radius);
		if (ctx.isPointInPath(x,y)){
			if (!this.hover) {
				this.hover = true;
				this.needRedraw = true;
			}
			return true;
		}
		if (this.hover) {
			this.hover = false;
			this.needRedraw = true;
		}
		return false;
	};
	RestartButton.prototype.mouseClick = function(x, y, ctx){
		var radius = 10;
		var marg = 1;
		ctx.beginPath();
		ctx.moveTo(this.x+radius+marg,this.y+marg);
		ctx.arcTo(this.x+this.width-marg,this.y+marg,this.x+this.width-marg,this.y+radius+marg,radius);
		ctx.arcTo(this.x+this.width-marg,this.y+this.height-marg,this.x+this.width-radius-marg,this.y+this.height-marg,radius);
		ctx.arcTo(this.x+marg,this.y+this.height-marg,this.x+marg,this.y+this.height-radius-marg,radius);
		ctx.arcTo(this.x+marg,this.y+marg,this.x+radius+marg,this.y+marg,radius);
		if (ctx.isPointInPath(x,y)){
			restartGame();
		}
		return false;

	};

	var InfoBar = function(){
		if (arguments.callee.instance) {
			return arguments.callee.instance;
		}
		arguments.callee.instance = this;
		this.score = 0;
		this.turns = 0;
		this.needRedrawScore = false;
		this.needRedrawTurns = false;
		this.x = 5;
		this.y = 0;
		this.width = 292;
		this.height = 30;
		this.color = '#027981';
	};
	InfoBar.prototype.turn = function(){
		this.turns++;
		this.needRedrawTurns = true;
	};
	InfoBar.prototype.goal = function(){
		if (this.score == 0 || this.score > this.turns)
			this.score = this.turns;
		this.needRedrawScore = true;
		this.resetTurns();
		restartGame();
	};
	InfoBar.prototype.redrawTurns = function(ctx){
		ctx.save();
		ctx.clearRect(this.x + 63, this.y + 3, 70, 20);
		ctx.fillStyle=this.color;
		ctx.textBaseline = "top";
		ctx.textAlign = "left";
		ctx.font = (this.height / 2) + "pt Arial";
		ctx.fillText(this.turns, this.x + 63, this.y + 6);
		ctx.restore();
		this.needRedrawTurns = false;
	};
	InfoBar.prototype.resetTurns = function(){
		this.turns = 0;
		this.needRedrawTurns = true;
	};
	InfoBar.prototype.redrawScore = function(ctx){
		ctx.save();
		ctx.clearRect(this.x + 220, this.y + 3, 65, 20);
		ctx.fillStyle=this.color;
		ctx.textBaseline = "top";
		ctx.textAlign = "left";
		ctx.font = (this.height / 2) + "pt Arial";
		ctx.fillText(this.score, this.x + 220, this.y + 6);
		ctx.restore();
		this.needRedrawScore = false;
	};
	InfoBar.prototype.resetScore = function(){
		this.score = 0;
		this.needRedrawTurns = true;
	};
	InfoBar.prototype.drawBox = function(ctx){
		ctx.save();
		ctx.strokeStyle = this.color;
		var radius = 10;
		var marg = 1;
		ctx.beginPath();
		ctx.moveTo(this.x+radius+marg,this.y+marg);
		ctx.arcTo(this.x+this.width-marg,this.y+marg,this.x+this.width-marg,this.y+radius+marg,radius);
		ctx.arcTo(this.x+this.width-marg,this.y+this.height-marg,this.x+this.width-radius-marg,this.y+this.height-marg,radius);
		ctx.arcTo(this.x+marg,this.y+this.height-marg,this.x+marg,this.y+this.height-radius-marg,radius);
		ctx.arcTo(this.x+marg,this.y+marg,this.x+radius+marg,this.y+marg,radius);
		ctx.stroke();
		ctx.fillStyle=this.color;
		ctx.textBaseline = "top";
		ctx.textAlign = "left";
		ctx.font = (this.height / 2) + "pt Arial";
		ctx.fillText('Turns:', this.x + 5, this.y + 5);
		ctx.fillText('best goal:', this.x + 133, this.y + 5);
		ctx.restore();
		this.needRedrawTurns = true;
		this.needRedrawScore = true;
	};

	var initField = function(){
		chips.forEach(function(chip){
			if (chip) {
				chip.show(ctx);
			}
		});
		info = new InfoBar();
		info.drawBox(ctx);
		restartButton = new RestartButton();
	};

	var redrawField = function(time){
		var fps = time-oldtime;
		oldtime = time;
		if (fps > maxTimeBetweenFrames) maxTimeBetweenFrames = fps;
		inputs.fps.value = (1000 / fps) >> 0;
		chips.forEach(function(chip){
			if (chip) {
				chip.animate(ctx);
			}
		})
		if (info.needRedrawScore) info.redrawScore(ctx);
		if (info.needRedrawTurns) info.redrawTurns(ctx);
		if (restartButton.needRedraw) restartButton.draw(ctx);
		requestAnimFrame(arguments.callee);
	};

	var mouseClickEvent = function(e){
		var box = canva.getBoundingClientRect();
		var x = (e.clientX - box.left) >> 0;
		var y = (e.clientY - box.top) >> 0;
		chips.forEach(function(chip){
			if (chip) chip.mouseClick(x,y);
		})
		restartButton.mouseClick(x, y, ctx);
	};

	var altMouseMoveEvent = function(e){
		var box = canva.getBoundingClientRect()
		var x = e.clientX - box.left;
		var y = e.clientY - box.top;
		x = x >> 0;
		y = y >> 0;
		var hoverChip = null;

		inputs.x.value = x;
		inputs.y.value = y;
		chips.forEach(function(chip){
			if (chip) chip.mouseOver(x,y);
		})
		restartButton.mouseOver(x, y, ctx);
	};

	var initChips = function(){
		/* TODO randomize chips at start*/
		/* TODO check the set of chips for solve possibility*/
		for (var i = 0; i<12; i++){
			chips[i] = new Chip(i);
		}
		chips[i+1] = new Chip(i+1);
		chips[i+2] = new Chip(i+2);
		chips[i] = new Chip(i);
		chips[i+3] = null;
		randomizeChips();
	};

	var bindEvents = function(){
		canva.onmousemove = function(e){
			altMouseMoveEvent(e);
		};
		canva.onclick = function(e){
			mouseClickEvent(e);
		};
		canva.onmouseout= function(e){
			/*TODO realize the mouseout event field reaction*/
		}
	};

	var initCanvas = function(){
		canva = document.getElementById('canva');
		if (canva.getContext){
			ctx = canva.getContext('2d');
			chipImage.src = 'img/chip.png';
		} else {
			alert("canvas don't supported");
			return false;
		}
		return true;
	};

	var Chip = function(position){
		if (arguments.callee.number != null){
			arguments.callee.number++;
			this.number = arguments.callee.number;
		}
		else {
			arguments.callee.number = 1;
			this.number = 1;
		}

		this.x = position % 4 * 100 || 0;
		this.y = (position / 4 >> 0) * 100 || 0;

		this.animationFrame = 0;
		this.animation = false;
		this.needRedraw = false;
		this.hover = false;
		this.targetX = null;
		this.targetY = null;
		this.position = null;
	};
	Chip.prototype.animate = function(context){
		if (this.animation)
		{
			//var trans = 2;
			var trans = this.easing(10);
			this.hide(context);
			(this.targetX != null && this.x != this.targetX) ? this.x += ((this.x > this.targetX) ? (-trans) : trans) : this.targetX = null;
			(this.targetY != null && this.y != this.targetY) ? this.y += ((this.y > this.targetY) ? (-trans) : trans) : this.targetY = null;

			if (this.targetX === null && this.targetY === null) {
				this.animation = false;
				this.needRedraw = false;
			}
			this.show(context);
			return true;
		} else if (this.needRedraw) {
			this.show(context);
			this.needRedraw = false;
		}
		return false;
	};
	Chip.prototype.hide = function(context){
        context.fillStyle="#ffffff";
        var radius = 10;
        var marg = 4;
        context.beginPath();
        context.moveTo(this.x+radius+marg,this.y+marg);
        context.arcTo(this.x+this.width-marg,this.y+marg,this.x+this.width-marg,this.y+radius+marg,radius);
        context.arcTo(this.x+this.width-marg,this.y+this.height-marg,this.x+this.width-radius-marg,this.y+this.height-marg,radius);
        context.arcTo(this.x+marg,this.y+this.height-marg,this.x+marg,this.y+this.height-radius-marg,radius);
        context.arcTo(this.x+marg,this.y+marg,this.x+radius+marg,this.y+marg,radius);
        context.fill();
	};
	Chip.prototype.show = function(context){
		this.hover ? context.fillStyle = this.hoverColor : context.fillStyle = this.color;
		var radius = 10;
		var marg = 5;
		context.beginPath();
		context.moveTo(this.x+radius+marg,this.y+marg);
		context.arcTo(this.x+this.width-marg,this.y+marg,this.x+this.width-marg,this.y+radius+marg,radius);
		context.arcTo(this.x+this.width-marg,this.y+this.height-marg,this.x+this.width-radius-marg,this.y+this.height-marg,radius);
		context.arcTo(this.x+marg,this.y+this.height-marg,this.x+marg,this.y+this.height-radius-marg,radius);
		context.arcTo(this.x+marg,this.y+marg,this.x+radius+marg,this.y+marg,radius);
		context.fill();
		context.stroke();
		context.fillStyle="#000000";
		context.textBaseline = "center";
		context.textAlign = "center";
		context.font = "italic " + this.width/4 + "pt Arial";
		context.fillText(this.number, this.x + this.width/2, this.y + this.height/2);
	};
	Chip.prototype.mouseOver = function(x,y){
		var radius = 10;
		var marg = 5;
		ctx.beginPath();
		ctx.moveTo(this.x+radius+marg,this.y+marg);
		ctx.arcTo(this.x+this.width-marg,this.y+marg,this.x+this.width-marg,this.y+radius+marg,radius);
		ctx.arcTo(this.x+this.width-marg,this.y+this.height-marg,this.x+this.width-radius-marg,this.y+this.height-marg,radius);
		ctx.arcTo(this.x+marg,this.y+this.height-marg,this.x+marg,this.y+this.height-radius-marg,radius);
		ctx.arcTo(this.x+marg,this.y+marg,this.x+radius+marg,this.y+marg,radius);
		if (ctx.isPointInPath(x,y)){
			if (!this.hover) {
				this.hover = true;
				this.needRedraw = true;
			}
			return true;
		}
		if (this.hover) {
			this.hover = false;
			this.needRedraw = true;
		}
		return false;
	};
	Chip.prototype.mouseClick = function(x,y){
		if (!this.animation){
			var radius = 10;
			var marg = 5;
			ctx.beginPath();
			ctx.moveTo(this.x+radius+marg,this.y+marg);
			ctx.arcTo(this.x+this.width-marg,this.y+marg,this.x+this.width-marg,this.y+radius+marg,radius);
			ctx.arcTo(this.x+this.width-marg,this.y+this.height-marg,this.x+this.width-radius-marg,this.y+this.height-marg,radius);
			ctx.arcTo(this.x+marg,this.y+this.height-marg,this.x+marg,this.y+this.height-radius-marg,radius);
			ctx.arcTo(this.x+marg,this.y+marg,this.x+radius+marg,this.y+marg,radius);
			if (ctx.isPointInPath(x,y)){
				var _this = chips.indexOf(this);
				var empty = chips.indexOf(null);
				if (Math.abs(chips[_this].x - empty%4*this.width + fieldOffsetX) + Math.abs(chips[_this].y - (empty/4>>0)*this.width - fieldOffsetY) < 200){
					if (chips[_this].number >= _this && checkFieldSolve() < 0) {
						info.goal();
					} else {
						this.targetX = empty % 4 * this.width + fieldOffsetX;
						this.targetY = ((empty / 4) >> 0) * this.width + fieldOffsetY;
						this.needRedraw = true;
						this.animation = true;
						info.turn();

						var tmp = chips[_this];
						chips[_this] = chips[empty];
						chips[empty] = tmp;
						return true;
					}
				}
			}
		}
		return false;
	};
	Chip.prototype.easing = function(d) {
		//return c * t / d;
		this.animationFrame++;
		if (this.animationFrame > d){
			this.animationFrame = 0;
			return -1;
		}
		else return Math.round(Math.pow((this.animationFrame / d), 5) * this.width - Math.pow(((this.animationFrame-1) / d), 5) * this.width);
	};
	Chip.prototype.updatePosition = function(position, offsetX, offsetY){
		offsetX = offsetX || 0;
		offsetY = offsetY || 0;
		position = position || 0;
		this.x = position % 4 * this.width + offsetX;
		this.y = (position / 4 >> 0) * this.height + offsetY;
		this.position = position;
	};
	Chip.prototype.width = 100;
	Chip.prototype.height = 100;
	Chip.prototype.color = '#66d8d9';
	Chip.prototype.hoverColor = '#f28f29';

	this.init = function(){
		if (!initCanvas()) return;
		bindEvents();
		initChips();
		initField();
		redrawField();
	};

	return this;
}

function cns(param){
	param = param || null;
	if (window.logger) console.log(param);
}