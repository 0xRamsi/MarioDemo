/*
	AnimationClass is a class for animations, like Mario dying, bricks being 
destroyed, and anything that happens in the world, but should not affect the 
flow of game and/or physical world.
These objects have no physics body, so they should mimic gravity in the update
method (if appropriate).
*/

AnimationClass = Class.create({
	time: 50,
	imgs: null,
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
		if(this.time == 0 || this.isDead){
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

DyingGoomba = {
	create: function(aGame, aPos, aProperties, aCallback){
		var props = {
			time: 150,
			pos: aPos,
			size: {w: 1.5, h: 1.5},
			name: 'dying goomba'
		}
		return [new AnimationClass(aGame, [gCachedData['GoombaDead']], props, null)];
		
	}
};


DyingMario = {
	create: function(aGame, aPos, aProperties, aCallback){
		var subclass = Class.create(AnimationClass, {
			state: [50, 30, 80],		// going up/hanging/going down
			fallSpeed: 0.1,
			
			initialize: function($super, aGame, aPos, aProperties, aCallback){
				var props = {
					time: 160,
					pos: aPos,
					size: {w: 1.5, h:1.5},
					name: 'dying Mario'
				}
		
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
		
		
		return [new subclass(aGame, aPos, aProperties, aCallback)];
	},
	
};


ChangeMarioSizeClass = {
	create: function(aGame, aPos, aProperties, aCallback){
		var props = {
			time: 180,
			pos: aPos,
			size: {w: 1.5, h: 3},
			name: 'change Mario size'
		}
		
		var animation = new AnimationClass(
			aGame,
			[gCachedData['marioStand-big'], gCachedData['marioStand-small']],
			props,
			aCallback
		);
			
		animation.state = 0;
		animation.getImage = function($super){
			++this.state;
				
			if(this.state < 20){
				this.size = {w: 1.5, h: 1.5};
				return gCachedData['marioStand-small']
			}
		
			if(this.state < 40){
				this.size = {w: 1.5, h: 3};
				return gCachedData['marioStand-big'];
			}
		
			if(this.state == 40){
				this.state = 0;
				return gCachedData['marioStand-big'];
			}
		}.bind(animation);


		aGame.paused = true;
		return [animation];
	},
};

FireworksClass = {
	create: function(aGame, aPos, aProperties, aCallback){
		var subclass = Class.create(AnimationClass, {
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
		
		return [new subclass(aGame, aPos, aProperties, aCallback)];
	}
};


WasdClass = {
	create: function(aGame, aProperties, aCallback){
		var props = {
			time: 500,
			pos: {x: 5, y: 5},
			size: {w: 7, h: 5},
			name: 'wasd'
		}
		
		return [new AnimationClass(aGame, [gCachedData['images/wasd.png']], props, aCallback)];
	}
};

BreakBrickClass = {
	create: function(aGame, aPos, aProperties, aCallback){
		var res = [];
		
		var subclass = Class.create(AnimationClass, {
			initialize: function($super, aGame, aPos, aCallback, aProperties){
				var props = {
					time: 500,
					pos: {x: aPos.x, y: aPos.y},
					size: {w: 0.75, h: 0.75},
					name: 'breaking brick'
				}
				
				this.dx = aProperties.movement.dx;
				this.dy = aProperties.movement.dy
				this.dyForce = aProperties.movement.dyForce;
				
				$super(aGame, [aProperties.img], props, aCallback);
				this.nameMe = aProperties.name;
			},
			
			update: function($super){
				$super();
				
				this.pos.x += this.dx;
				this.pos.y += this.dy;
				this.dy += this.dyForce;
			}
		});
		
		var m1 = {
			dx: -0.2,
			dy: -0.4,
			dyForce: 0.02,
		};
		var props = {
			img: gCachedData['t1'],
			movement: m1,
		}
		res.push(new subclass(aGame, aPos, null, props));
		
		var m2 = {
			dx: -0.1,
			dy: -0.2,
			dyForce: 0.02,
		};
		var props = {
			img: gCachedData['t2'],
			movement: m2,
		}
		res.push(new subclass(aGame, aPos, null, props));

		var m3 = {
			dx: 0.2,
			dy: -0.4,
			dyForce: 0.02,
		};
		var props = {
			img: gCachedData['t3'],
			movement: m3,
		}
		res.push(new subclass(aGame, aPos, null, props));
		var m4 = {
			dx: 0.1,
			dy: -0.2,
			dyForce: 0.02,
		};
		var props = {
			img: gCachedData['t4'],
			movement: m4,
		}
		res.push(new subclass(aGame, aPos, null, props));
		
		return res;
	}
};

YieldMushroomClass = {
	create: function(aGame, aPos, aProperties, aCallback){
		var subclass = Class.create(AnimationClass, {
			initialize: function($super, aGame, aPos, aProperties, aCallback){
				var props = {
					time: 35,
					pos: {x: aPos.x+0.05, y: aPos.y},
					size: {w: 1.5, h: 1.5},
					name: 'yield mushroom',
					zIndex: 10
				}
				
				var callback = function(){
					aGame.spawnEntity("Mushroom", this.pos, null)
				}
				
				$super(aGame, [gCachedData['mushroom']], props, callback);
				if(aCallback)
					aCallback();
				this.mushroomAppearsSound = gCachedData['sounds/M1_PowerUpItemAppear.wav'];
			},
			
			update: function($super){
				$super();
				this.pos.y -= 0.04;
				if(this.mushroomAppearsSound && this.mushroomAppearsSound.loaded){
					this.game.SM.play(this.mushroomAppearsSound);
					this.mushroomAppearsSound = null;
				}
			}
		});
		
		return [new subclass(aGame, aPos, aProperties, aCallback)];
	}
};

YieldCoinClass = {
	create: function(aGame, aPos, aProperties, aCallback){
		var subclass = Class.create(AnimationClass, {
			initialize: function($super, aGame, aPos, aProperties, aCallback){
				var props = {
					time: 15,
					pos: {x: aPos.x, y: aPos.y},
					size: {w: 1.5, h: 1.5},
					name: 'yield coin',
					zIndex: 10
				}
				
				$super(aGame, [gCachedData['coin2']], props, aCallback);
				
				this.coinSound = gCachedData['sounds/M1_Coin.wav'];
				this.imgs = new MovingImagesClass(
					[gCachedData['coin1'], gCachedData['coin2'], gCachedData['coin3'], gCachedData['coin4']], 10);
			},
			
			getImage: function(){
				return this.imgs.getImage();
			},
			
			update: function($super){
				$super();
				this.pos.y -= 0.1;
				if(this.coinSound && this.coinSound.loaded){
					this.game.SM.play(this.coinSound);
					this.mushroomAppearsSound = null;
				}
			}
		});
		
		return [new subclass(aGame, aPos, aProperties, aCallback)];
	}
}