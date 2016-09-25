// var sounds = [
// 	'sounds/missileExplode.wav'
// ]


// Sound = Class.create({
// 	buffer: null,
//
// 	initialize: function(aBuffer){
// 		this.buffer = aBuffer;
// 	},
//
// 	play: function(aLoop){
// 		gSM.play(this.buffer, {loop: aLoop, volume: 1});
// 	}
// })


SoundManager = Class.create({
	enabled: true,
	_context: null,
	_mainNode: null,
	
	initialize: function(){
		try{
			this._context = new (window.AudioContext || window.webkitAudioContext)();
		}catch(e){
			16('Not able to play sounds');
		}
		this._mainNode = this._context.createGain(0);
		this._mainNode.connect(this._context.destination);
	},
	
	toggleMute: function(){
		this.enabled = !this.enabled;
	},
	
	play: function(s, settings){
		// Assumes the sound has been loaded.
		if(!(this.enabled)){
			return;
		}
		if(!(s.loaded))
			return;
		var loop = false;
		var volume = 1;
		if(settings){
			if(settings.loop)
				loop = settings.loop;
			if(settings.volume)
				volume = settings.volume;
		}

		var currentClip = this._context.createBufferSource();
		currentClip.buffer = s.buffer;
		currentClip.connect(this._mainNode);
		currentClip.loop = loop;
		
		currentClip.start();
	},
	
	stopAll: function(){
		this._mainNode.disconnect();
		this._mainNode = this._context.createGain(0);
		this._mainNode.connect(this._context.destination);
	}
});
