function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
r(function(){
	window.logger = true;
	var f = new Fifteens();
	f.init();

});

function Fifteens(){
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

	var inputs = {};
	inputs.x = document.getElementById('x');
	inputs.y = document.getElementById('y');
	inputs.fps = document.getElementById('fps');


	var initField = function(){
		for (var i in chips){
			if (chips[i]) {
				chips[i].show(ctx);
			}
		}
	};

	var redrawField = function(time){
		fps = time-oldtime;
		oldtime = time;
		if (fps > maxTimeBetweenFrames) maxTimeBetweenFrames = fps;
		inputs.fps.value = (1000 / fps) >> 0;
		for (var i in chips) {
			if (chips[i]) {
				chips[i].animate(ctx)
			}
		}
		mozRequestAnimationFrame(arguments.callee);
	};

	var mouseClickEvent = function(e){
		var box = canva.getBoundingClientRect();
		var x = (e.clientX - box.left) >> 0;
		var y = (e.clientY - box.top) >> 0;
		for (var i in chips) {
			if (chips[i] && chips[i].mouseClick(x,y)) break;
		}
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
		for (var i in chips){
			if (chips[i] && chips[i].mouseOver(x,y)){
				hoverChip = chips[i];
			}
		}
	};

	var initChips = function(){
		for (var i = 0; i<15; i++){
			chips[i] = new chip((i % 4) * 100, (i / 4 >> 0) * 100, 100, 100);
		}
		chips[i] = null;
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

	var chip = function(x, y, width, height, color, hoverColor){
		if (arguments.callee.number != null){
			arguments.callee.number++;
			this.number = arguments.callee.number;
		}
		else {
			arguments.callee.number = 1;
			this.number = 1;
		}

		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 100;
		this.height = height || 100;
		this.color = color || '#66cc88';
		this.hoverColor = hoverColor || '#ffaaaa';
		this.animationFrame = 0;
		this.animation = false;
		this.needRedraw = false;
		this.hover = false;
		this.targetX = null;
		this.targetY = null;

	};
	chip.prototype.animate = function(context){
		if (this.animation)
		{
			//var trans = 2;
			var trans = this.easing(10);
			//cns(trans);
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
	chip.prototype.hide = function(context){
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
	chip.prototype.show = function(context){
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
	chip.prototype.mouseOver = function(x,y){
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
	chip.prototype.mouseClick = function(x,y){
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
			if (Math.abs(chips[_this].x - empty%4*this.width) + Math.abs(chips[_this].y - (empty/4>>0)*this.width) < 200){
				this.targetX = empty % 4 * this.width;
				this.targetY = ((empty / 4) >> 0) * this.width;
				this.needRedraw = true;
				this.animation = true;
				var tmp = chips[_this];
				chips[_this] = chips[empty];
				chips[empty] = tmp;
				return true;
			}
		}
		return false;
	};
    chip.prototype.background = null;
	chip.prototype.easing = function(d) {
		//return c * t / d;
		this.animationFrame++;
		if (this.animationFrame > d){
			this.animationFrame = 0;
			cns ('end animation');
			return -1;
		}
		else return Math.round(Math.pow((this.animationFrame / d), 5) * this.width - Math.pow(((this.animationFrame-1) / d), 5) * this.width);
	};



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