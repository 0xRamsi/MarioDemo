MyImageClass = Class.create({

	_loadedImages: {},
	
	loadImage: function(name, src, callback){
		var newImage = new Image();
		newImage.onload = callback;
		newImage.src = src;
		
		this._loadedImages[name].img = newImage;
		return newImage;
	},
	
	loadImageJSON: function(name, url, callback){
		var getJSON = (function(name){
			return function(response){
				var json = JSON.parse(response.responseText);
				this._loadedImages[name].def = json.frames[name];
				callback();
			};
		})(name).bind(this);
		
		new Ajax.Request(url, {
			onSuccess: getJSON
		});
	},
	
	assetLoadCounter: (function(loadedAssets){
		return function(){
			if( --loadedAssets == 0 ){
				// gameLoop = setInterval(gGameEngine.update.bind(gGameEngine), 10);
			}
		}
	})(Object.keys(this.assets).length * 2),
	
	loadImages: function(){
		// Just load the images, don't worry about useing
		// them for now.
		for(var name in this.assets){
			if(name in this._loadedImages)
				return;
			this._loadedImages[name] = {};
			
			var asset = this.assets[name];
			this.loadImage(name, asset.src + '.' + asset.type, this.assetLoadCounter);
			this.loadImageJSON(name, asset.src + '.json', this.assetLoadCounter);
		}
	},

	getInstance: function(name){
		if(name in this._loadedImages){
			return this._loadedImages[name];
		}else{console.log('could not find image:', name)}
		return null;
	}
});
