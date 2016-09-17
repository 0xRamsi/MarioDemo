/*
	AnimationClass is a class for animations, like Mario dying, bricks being 
destroyed, and anything that happens in the world, but should not affect the 
flow of game and/or physical world.
These objects have no physics body, so they should mimic gravity in the update
method (if appropriate).
*/

AnimationClass = Class.create({
	time: 50,
	img: null,
	pos: null,
	absolute: false,
	name: null,
	zIndex: 99,
	game: null,
	
	initialize: function(aGame, anImageList, aProps, aCallback){
		this.imgs = new MovingImagesClass(anImageList, 20);
		this.size = {w: 50, h: 30};
		
		if(aProps){
			this.name = 'Background object';
			for(var key in aProps){
				this[key] = aProps[key];
			}
		}
		
		this.game = aGame;
		this.callback = aCallback;
	},
	
	die: function(){
		this.game.kill(this);
	},
	
	update: function(){
		--this.time;
		if(this.time == 0){
			this.die();
			this.game.paused = false;
			if(this.callback)
				this.callback();
		}
	},
	
	getImage: function(){
		return this.imgs.getImage();
	},
	
	getPosition: function(){
		return this.pos;
	},
	
	getAngle: function(){
		return 0;
	}
});

DyingGoomba = Class.create(AnimationClass, {
	
	initialize: function($super, aGame, aPos, aProperties, aCallback){
		var props = {
			time: 150,
			pos: aPos,
			size: {w: 1.5, h: 1.5},
			name: 'dying goomba'
		}
		$super(
			aGame,
			[gCachedData['GoombaDead']],
			props, null
		);
		
	}
});


DyingMario = Class.create(AnimationClass, {
	state: [],
	fallSpeed: 0.1,
	
	initialize: function($super, aGame, aPos, aProperties, aCallback){
		var props = {
			time: 160,
			pos: aPos,
			size: {w: 1.5, h:1.5},
			name: 'dying Mario'
		}
		// props.pos.y -= 10;
		
		this.state = [50, 30, 80];		// going up/hanging/down.
		$super(aGame, [gCachedData['marioDead']], props, aCallback);
	},
	
	update: function($super){
			$super();
			if(this.state[0]){
				// Go up
				--this.state[0];
				this.pos.y -= 0.1;
			}else if(this.state[1]){
				// Just hang there.
				--this.state[1];
			}else if(this.state[2]){
				// Go down
				--this.state[2];
				this.pos.y += this.fallSpeed;
				this.fallSpeed += 0.05;
			}
		}
});

ChangeMarioSizeClass = Class.create(AnimationClass, {
	initialize: function($super, aGame, aPos, aProperties, aCallback){
		var props = {
			time: 180,
			pos: aPos,
			size: {w: 1.5, h: 3},
			name: 'change Mario size'
		}
		
		// TODO: Big mario and small mario are scalled to 1.5x3 world size, so the
		// animation looks wired. Make one appear small and one big.
		
		$super(
			aGame,
			[gCachedData['marioStand-big'], gCachedData['marioStand-small']],
			props,
			aCallback);
			
		aGame.paused = true;
	}
});

FireworksClass = Class.create(AnimationClass, {
	state: 0,
	castlePos: null,
	
	initialize: function($super, aGame, aPos, aProperties, aCallback){
		this.castlePos = aGame.castle.getPosition();
		var props = {
			time: 500,
			pos: this._calculateNewPosition(),
			size: {w: 0.3, h: 0.3},
			name: 'fireworks'
		}
		
		$super(aGame, [gCachedData['fireworks']], props, aCallback);
	},
	
	_calculateNewPosition: function(){
		var dx, dy;
		var angle, dist;
		
		dist = Math.random() * 2 + 14;
		angle = Math.random() * Math.PI;
		
		dx = Math.cos(angle) * dist;
		dy = Math.sin(angle) * dist;
		
		var t = {x: dx + this.castlePos.x, y: this.castlePos.y - dy}
		
		return t;
	},
	
	update: function($super){
		$super();
		
		++this.state;
		
		if(this.state == 30){
			this.size = {w: 0.6, h: 0.6};
		}
		if(this.state == 60){
			this.size = {w: 1, h: 1};
		}
		if(this.state == 100){
			this.state = 0;
			this.pos = this._calculateNewPosition();
			this.size = {w: 0.3, h: 0.3};
		}
		
	}
});
