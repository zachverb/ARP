window.onload = function() {
	context = new webkitAudioContext();
	osc = document.getElementById("sqr");
	viewport = document.getElementById("viewport");
	wave = document.getElementById("waveform");
	interval = document.getElementById("interval");
	onOff = document.getElementById("onOff");
	filter = document.getElementById("filter");
	speed = document.getElementById("speed");
	canvas = document.getElementById("audiocanvas");
	octave = document.getElementById("octave");

	var analyser = context.createAnalyser();
	var nodes = {};

	var ctx = canvas.getContext("2d");

	var gradient = ctx.createLinearGradient(0,0,0,canvas.height);
	    gradient.addColorStop(1,'#8CB7E1');
	    gradient.addColorStop(0.75,'#E8E1CE');
	    gradient.addColorStop(0.25,'#F8CB00');
	    gradient.addColorStop(0,'#C85914');

	ctx.fillStyle = gradient;

	//add nodes
	nodes.filter = context.createBiquadFilter();  
	nodes.volume = context.createGain();
	nodes.delay = context.createDelay();
	nodes.feedbackGain = context.createGain();

	//connect it all
	nodes.filter.connect(nodes.volume);
	nodes.filter.connect(nodes.delay);
	nodes.delay.connect(nodes.feedbackGain);
	nodes.feedbackGain.connect(nodes.volume);
	nodes.feedbackGain.connect(nodes.delay);
	nodes.volume.connect(analyser);
	analyser.connect(context.destination);

	nodes.delay.delayTime.value = .212;
	nodes.feedbackGain.gain.value = .4;
	nodes.volume.gain.value = .5

	analyser.smoothingTimeConstant = 0.8;
	analyser.fftSize = 512;

	drawSpectrum();

	// array of all available frequencies
	var freqs = [65.406, 69.296, 73.416, 77.782, 82.407, 87.31, 92.50, 98.00, 103.83, 110.00, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94, 261.63, 277.18, 293.67, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.26, 698.46, 739.99, 783.99, 830.61, 880.00, 932.33, 987.77, 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760.00, 1864.66, 1975.53, 2093.00];



	osc.onmousedown = function () 
	{
		// takes in an algorithmic value from the x and y location
		var locValue = Math.floor((window.event.clientX / (freqs.length * 1.8)) % freqs.length + parseInt(octave.value)); 
		var oscPitch = freqs[locValue];
		mouseLocation = window.event.clientX;
		oscillator = context.createOscillator();
		nodes.filter.type = parseInt(filter.value);
		oscillator.type = parseInt(wave.value);
		oscillator.frequency.value = oscPitch;
		setFilterFrequency();
		var direction = parseInt(interval.value);
		if (onOff.value === "true") {
			arp = setInterval(function() {
				// once you've gone out of bounds in the array, change direction until you're out of bounds again
				if(locValue + direction >= freqs.length || locValue + direction <= 0) {
					direction = -direction;
				}
				locValue += direction;
				createosc(locValue)
				setFilterFrequency();
			},setArpSpeed());
		} else {
			arp = setInterval(0,0);
		}
		oscillator.connect(nodes.filter);
		oscillator.noteOn(0);
		oscisrunning = true;
	};

	osc.onmousemove = function () 
	{
		if(oscisrunning) {
			setFilterFrequency();
			var xCurr = window.event.clientX;
			if((mouseLocation + 100) < xCurr || (mouseLocation - 100) > xCurr) {
				clearInterval(arp);
				mouseLocation = xCurr;
				var locValue = Math.floor((window.event.clientX / (freqs.length * 1.8)) % freqs.length + parseInt(octave.value));
				oscillator.frequency.value = freqs[locValue];
				var direction = parseInt(interval.value);
				if (onOff.value === "true") {
					arp = setInterval(function() {
						if(locValue + direction >= freqs.length || locValue + direction <= 0) {
							direction = -direction;
						}
						locValue += direction;
						createosc(locValue)
					},setArpSpeed());
				} else {
					arp = setInterval(0,0);
				}
			}	
			
		}
		
	};

	createosc = function (pitch)
	{
		oscillator.disconnect();
		oscillator = context.createOscillator();
		oscillator.type = wave.value;
		oscillator.frequency.value = freqs[pitch];
		oscillator.connect(nodes.filter);
		oscillator.noteOn(0);
	};

	osc.onmouseup = function () {
		turnOffOsc();
	};

	function setFilterFrequency() {
	    var min = 40; // min 40Hz
	    var max = context.sampleRate / 2; // max half of the sampling rate
	    var numberOfOctaves = Math.log(max / min) / Math.LN2; // Logarithm (base 2) to compute how many octaves fall in the range.
	    var multiplier = Math.pow(2, numberOfOctaves * (((2 / (viewport.offsetTop + viewport.offsetHeight)) * ((viewport.offsetTop + viewport.offsetHeight) - window.event.clientY)) - 1.0)); // Compute a multiplier from 0 to 1 based on an exponential scale.
	    nodes.filter.frequency.value = max * multiplier; // Get back to the frequency value between min and max.
	};

	function setArpSpeed() {
		if(speed === "varied") {
			return (((window.event.clientY / 100) * 50) + 100);
		} else {
			return parseInt(speed.value);
		}
	}

	function drawSpectrum() {
		var WIDTH = canvas.width,
			HEIGHT= canvas.height,
			array =  new Uint8Array(analyser.frequencyBinCount);
			
		analyser.getByteFrequencyData(array);
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		audioAnimation = requestAnimationFrame(drawSpectrum);
		
		for ( var i = 0; i < (array.length); i++ ){
			var value = array[i];
			ctx.fillRect(i*3,HEIGHT-value,2,HEIGHT);
		}
	}
}
