var audioContext = require('audio-context');
var AudioBufferLoader = require('loaders').AudioBufferLoader;
var GranularEngine = require('granular-engine');
var PlayControl = require('play-control');
var Transport = require('transport');

var audioBufferLoader = new AudioBufferLoader();
var transport = new Transport();
var playControl = new PlayControl(transport);

audioBufferLoader.load('https://cdn.rawgit.com/Ircam-RnD/audio-files/master/drumLoop.wav').then(function(buffer) {
	var granularEngine = new GranularEngine(buffer);
	granularEngine.connect(audioContext.destination);
	granularEngine.periodAbs = 0.00001;
	transport.add(granularEngine, 0, buffer.duration);
	playControl.setLoopBoundaries(0, buffer.duration);
	playControl.loop = true;
});

document.onkeypress = function(e) {
	if(e.charCode == 32)
		playControl.start();
};