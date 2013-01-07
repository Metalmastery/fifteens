function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
r(function(){
	window.logger = true;
	var f = new fifteens();
	f.init();

});

function fifteens(){
	if (arguments.callee.instance) {
		cns('already created');
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
	}

	var redrawField = function(time){
		fps = time-oldtime;
		oldtime = time;
		if (fps > maxTimeBetweenFrames) maxTimeBetweenFrames = fps;
		inputs.fps.value =  (1000 / maxTimeBetweenFrames) >> 0;
		for (var i in chips) {
			if (chips[i]) {
				chips[i].animate(ctx)
			}
		}
		mozRequestAnimationFrame(arguments.callee);
	}

	var mouseClickEvent = function(e){
		var box = canva.getBoundingClientRect();
		var x = (e.clientX - box.left) >> 0;
		var y = (e.clientY - box.top) >> 0;
		for (var i in chips) {
			if (chips[i] && chips[i].mouseClick(x,y)) break;
		}
	}

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

		/*if (hoverChip != null) {
			if (hoverChip != activeChip) {
				activeChip.hover = false;
				activeChip.needRedraw = true;

				hoverChip.hover = true;
				hoverChip.needRedraw = true;
				activeChip = hoverChip;
			}
		} else {
			activeChip.hover = false;
			activeChip.needRedraw = true;
			activeChip = {};
		}*/
	}

	var initChips = function(){
		for (var i = 0; i<15; i++){
			chips[i] = new chip((i % 4) * 100, (i / 4 >> 0) * 100, 100, 100);
		}
		chips[i] = null;
	}

	var bindEvents = function(){
		canva.onmousemove = function(e){
			//mouseMoveEvent(e);
			altMouseMoveEvent(e);
		}
		canva.onclick = function(e){
			mouseClickEvent(e);
		}
		canva.onmouseout= function(e){
			//mouseMoveEvent(e);
			/*TODO realize the mouseout event field reaction*/
		}
	}

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
	}

	var chip = function(x,y,width,height){
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
		this.width = width || 100
		this.height = height || 100

		this.needRedraw = false;
		this.hover = false;
		this.targetX = null;
		this.targetY = null;
	}
	chip.prototype.animate = function(context){
		//if (this.targetX != this.x || this.targetY != this.y)
		if (this.animation)
		{
			cns('animate ' + this.number);
			var trans = 2;
			this.hide(context);
			/*if (this.x != this.targetX || this.y != this.targetY){
				this.x += ((this.x > this.targetX) ? (-1) : 1);
				this.y += ((this.y > this.targetY) ? (-1) : 1)
			} else {
				this.targetX = null;
				this.targetY = null;
			}*/
			(this.targetX != null && this.x != this.targetX) ? this.x += ((this.x > this.targetX) ? (-trans) : trans) : this.targetX = null;
			(this.targetY != null && this.y != this.targetY) ? this.y += ((this.y > this.targetY) ? (-trans) : trans) : this.targetY = null;

			if (!this.targetX && !this.targetY) {
				this.animation = false;
				this.needRedraw = false;
			}
			this.show(context);
			return true;
		} else if (this.needRedraw) {
			this.show(context);
			this.needRedraw = false;
			cns('redraw ' + this.number);
		}
		return false;
	}
	chip.prototype.hide = function(context){
		context.clearRect(this.x,this.y,this.height,this.width);
	}
	chip.prototype.show = function(context){
		this.hover ? context.fillStyle="#ff0000" : context.fillStyle="#00ff00";
		//context.fillRect(this.x+1,this.y+1,this.height-2,this.width-2);
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
		context.fillStyle="#000000"
		context.textBaseline = "center";
		context.textAlign = "center";
		context.font = "italic " + this.width/4 + "pt Arial";
		context.fillText(this.number, this.x + this.width/2, this.y + this.height/2);
	}
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
	}
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
				cns('_this= ' + _this + ' empty= ' + empty + ' this.number= ' + this.number);
				cns('targetX= ' + this.targetX + ' targetY= ' + this.targetY);
				cns((chips[_this].x - empty%4*this.width) + (chips[_this].y - (empty/4>>0)*this.width));
				this.needRedraw = true;
				this.animation = true;
				var tmp = chips[_this];
				chips[_this] = chips[empty];
				chips[empty] = tmp;
				return true;
			}
		}
		return false;
	}


	this.init = function(){
		if (!initCanvas()) return;
		bindEvents();
		initChips();
		initField();
		redrawField();
	}

	return this;
}

function cns(param){
	param = param || null;
	if (window.logger) console.log(param);
}