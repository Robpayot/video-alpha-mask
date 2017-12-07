class VideoAlphaMask {

	constructor() {
		
		// bind
		this.render = this.render.bind(this);
		this.resizeHandler = this.resizeHandler.bind(this);
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onChangeSize = this.onChangeSize.bind(this);
		this.onChangeColor = this.onChangeColor.bind(this);

		
		// a small GUI
		this.setGui()

		this.textHeight = this.controller.size; // need a real calcul
		this.text = 'T Y P E  H E R E';

		this.ui = {
			canvas: document.querySelector('.canvas'),
			canvasAlphaBuffer: document.querySelector('.canvas-alpha-buffer'),
			svgGithub: document.querySelector('.github svg'),
		};

		this.ctx = this.ui.canvas.getContext('2d');
		this.ctxAlphaBuffer = this.ui.canvasAlphaBuffer.getContext('2d');

		this.setAlphaVideo();
		this.resizeHandler();

		this.events();

	}

	setGui() {
		this.controller = {
			size: 150,
			color: '#000000',
			background: '#FFFFFF'
		};

		const gui = new dat.GUI();

		gui.add(this.controller, 'size', 0, 300).onChange(this.onChangeSize);
		gui.addColor(this.controller, 'color').onChange(this.onChangeColor);
		gui.addColor(this.controller, 'background').onChange(this.onChangeBackground);
		gui.open();
	}

	onChangeSize(val) {

		this.controller.size = val;
		this.resizeHandler();

	}

	onChangeColor(val) {

		this.controller.color = this.ui.svgGithub.style.fill = document.body.style.color = val;
	}

	onChangeBackground(val) {

		document.body.style.backgroundColor = val;
	}

	setAlphaVideo() {

		this.video = document.createElement('video');

		this.video.src = 'dist/video-alpha.mp4';
		this.video.autoplay = true;
		this.video.loop = true;
		this.video.muted = true;
		this.video.crossOrigin = 'Anonymous';

	}

	events() {

		window.onresize = this.resizeHandler();
		TweenMax.ticker.addEventListener('tick', this.render); // RAF

		document.addEventListener('keypress', this.onKeyPress, false);
		document.addEventListener('keydown', this.onKeyDown, false);

	}

	onKeyPress(e) {

		if (this.firstKeypress !== true ) {
			this.firstKeypress = true;
			this.text = String.fromCharCode(e.keyCode);
		} else {
			this.text += String.fromCharCode(e.keyCode);
		}

	}

	onKeyDown(e) {
		if (e.keyCode === 8 ) {
			this.text = this.text.slice(0,-1);
		}
	}


	resizeHandler() {


		this.width = Math.min(window.innerWidth * 0.5 * 2, 1400); // x2 display
		this.height = this.controller.size + 70; // marge

		// Video size
		this.videoWidth = this.width;
		this.videoHeight = this.width; // square in that case

		this.ui.canvasAlphaBuffer.width = this.videoWidth;
		this.ui.canvasAlphaBuffer.height = this.videoHeight;

		this.font = `${this.controller.size}px "Lato"`; // Theinhardt
		this.textWidth = Math.round((this.ctx.measureText(this.text)).width);
		this.textHeight = Math.round((this.ctx.measureText(this.text)).height);

		this.ui.canvas.height = this.height;
		this.ui.canvas.width = this.width;

		TweenMax.set(this.ui.canvas, {width: this.width / 2}); // x2 display
		TweenMax.set(this.ui.canvas, {height: this.height / 2}); // x2 display

		this.ctx.font = this.font;

	}

	render() {


		// clear temp context
		this.ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);

		// alpha video
		this.ctxAlphaBuffer.beginPath();
		this.ctxAlphaBuffer.drawImage(this.video, 0, 0, this.videoWidth, this.videoHeight); // 
		this.imageAlpha = this.ctxAlphaBuffer.getImageData(0, 0, this.videoWidth, this.videoHeight / 2); // --> top part of video
		this.imageData = this.imageAlpha.data;
		this.alphaData = this.ctxAlphaBuffer.getImageData(0, this.videoHeight / 2, this.videoWidth, this.videoHeight / 2).data; // --> bottom part 50/50
		// We select the second half
		// we apply alpha
		this.imageDataLenght = this.imageData.length; // --> cached data for perf
		for (let i = 3; i < this.imageDataLenght; i += 4) { // why 3 and 4 ? RGB ?
			this.imageData[i] = this.alphaData[i - 1];
		}

		this.ctx.beginPath(); 

		this.ctx.fillStyle = this.controller.color;
		this.ctx.putImageData(this.imageAlpha, 0, 0, 0, 0, this.width, this.height);
		this.ctx.globalCompositeOperation = 'source-in';

		this.ctx.font = this.font;
		this.ctx.textAlign = 'center';
		this.ctx.fillText(this.text, this.width / 2, this.height / 2 + this.controller.size / 2); // First Text
		this.ctx.font = this.font;

	}
}

new VideoAlphaMask()