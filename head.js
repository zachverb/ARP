var oscisrunning = false;
var context;
var osc;
var oscillator;
var viewport;

function setValues()
{
	var sqr = document.getElementById('sqr');
	viewport = document.getElementById('viewport');
	var x = window.event.clientX - viewport.offsetLeft;
	var y = (viewport.offsetTop + viewport.offsetHeight) - window.event.clientY;
	if(x >= (0 + sqr.offsetWidth/2) && x < ((viewport.offsetWidth - sqr.offsetWidth/2) - 2)) {
		sqr.style.left = (x - 50);
	}
	if (y > (0 + viewport.offsetTop + sqr.offsetHeight/2) + 2 && y <= (viewport.offsetTop + viewport.offsetHeight - sqr.offsetWidth/2)) {
		sqr.style.top = (window.event.clientY - 50);
	}
	else {
		//turnOffOsc();
	}
};

function turnOffOsc() 
{
	if(oscisrunning) {
		oscisrunning = false;
		oscillator.disconnect();
		clearInterval(arp);
	}
};