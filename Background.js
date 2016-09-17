/*
	This file has background onject, which mimic physical objects, but do not
have an entity in the physics engine.
Simply because thye are for decoration and will never affect the gamy physics,
and putting them into the physical world module would just slow things down.
*/


BGClass = Class.create({
	img: null,
	pos: null,
	absolute: false,
	name: null,
	zIndex: 0,
	game: null,
	
	initialize: function(aGame, aImg, aProps){
		this.img = aImg;
		this.size = {w: 50, h: 30};
		this.game = aGame;
		
		if(aProps){
			this.name = 'Background object';
			for(var key in aProps){
				this[key] = aProps[key];
			}
		}
	},
	
	getImage: function(){
		return this.img;
	},
	
	getPosition: function(){
		if(this.absolute)
			return this.game.renderer.getCameraPos();
		else
			return this.pos;
	},
	
	getAngle: function(){
		return 0;
	}
})

BackgroundClass = {
	makeBackground: function(aGame, aBackgroundObj){
		var res = [];
		
		try{
			if(aBackgroundObj.bg){
				var props = {
					absolute: true,
					name: 'bg'
				}
				var bg = new BGClass(aGame, gCachedData[aBackgroundObj.bg], props);
			}
			res.push(bg);
		}catch(e){}
		
		for(var i = 0; i < aBackgroundObj.objects.length; i++){
			try{
				var object = aBackgroundObj.objects[i];
				var img = gCachedData[object.img];
				var props = {
					pos: object.pos,
					size: {
						w: img.def.frame.w/PhysicsEngineClass.drawScale,
						h: img.def.frame.h/PhysicsEngineClass.drawScale
					},
					absolute: false,
					name: 'cloud'
				}
				var w = new BGClass(
					aGame,
					img,
					props
				);
				res.push(w);
			}catch(e){
				console.log('cannot make background object', object);
			}
		}
		
		return res;
	}
};
