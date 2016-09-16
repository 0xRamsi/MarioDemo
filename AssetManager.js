// Not used currently.

AssetManager = {
	gCacheData: {},
	
	addAsset: function(name, object){
		if(this.gCacheData[name]){
			console.log('Warning. Asset already exists:', this.gCacheData[name]);
			return;
		}
		this.gCacheData[name] = object;
	},
	
	getAsset: function(name){
		return this.gCacheData[name];
	},
	
	removeAsset(name){
		this.gCacheData[name] = null;
	}
};
