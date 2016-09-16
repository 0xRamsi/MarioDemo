/*
	AnimationClass is a class for animations, like Mario dying, bricks being 
destroyed, and anything that happens in the world, but should not affect the 
flow of physics.
These objects have a physics body, so they are affecetd by gravity, but their 
maskBits are set to 0 (will never collide with objects).
*/

AnimationClass = Class.create(EntityClass, {
	time: 50,
	game: null,
	callback: null,
	
	initialize: function($super, aGame, anImage, aPos, aProperties, aCallback){
		var props = {
			physics: {
				fixed: false,
				collisionGroup: 32,
				maskBits: 32
			},
			userData: {},
			other: {
				zIndex: 30
			}
		}
		
		if(aProperties)
			if(aProperties.time)
				this.time = aProperties.time;
			else
				this.time = 400;
		
		gUtil.copyProperties(props, aProperties);
		
		$super(aGame, anImage, aPos, props);
		this.game = aGame;
		if(aCallback)
			this.callback = aCallback
	},
	
	update: function(){
		--this.time;
		if(this.time == 0){
			this.die();
			this.game.paused = false;
			if(this.callback)
				this.callback();
			return;
		}
	}
});

DyingGoomba = Class.create(AnimationClass, {
	initialize: function($super, aGame, aPos, aProperties, aCallback){
		var props = {
			time: 150,
			physics: {
				size: {w: 1.5, h:1.5}
			},
			userData: {
				name: 'dying Goomba'
			},
			other: {}
		}
		gUtil.copyProperties(props, aProperties);
		
		$super(aGame, gCachedData['GoombaDead'], aPos, props, aCallback);
	},
	
	onTouch: function(other, contact, impulse){}
});

DyingMario = Class.create(AnimationClass, {
	state: [],
	joint: null,
	
	initialize: function($super, aGame, aPos, aProperties, aCallback){
		var props = {
			time: 400,
			physics: {
				collisionGroup: 0,		// Do not collide.
				maskBits: 0,			// Do not collide.
				size: {w: 1.5, h:1.5}
			},
			userData: {
				name: 'dying Mario'
			}
		}
		gUtil.copyProperties(props, aProperties);
		this.state = [30, 30, 80];		// going up/hanging/down.
		$super(aGame, gCachedData['marioDead'], aPos, props, aCallback);
	},
	
	update: function(){
		var body = this.physBody.GetBody();
		if(this.state[0]){
			--this.state[0];
			var speed = new this.game.physEngine.b2Vec2(0, -15);
			body.SetLinearVelocity(speed);
		}else if(this.state[1]){
			--this.state[1];
			if(this.joint == null){
				var g = this.game.getGround().physBody.GetBody();
				var body = this.physBody.GetBody();
				var v1 = body.GetPosition();
				var v2 = body.GetPosition();

				var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;
				jointDef.Initialize(g, body, v1, v2);
				jointDef.collideConnected = true;
				jointDef.maxForce = 300.0 * g.GetMass();
				this.joint = this.game.physEngine.world.CreateJoint(jointDef);
			}
		}else if(this.state[2]){
			--this.state[2];
			if(this.joint){
				this.game.physEngine.world.DestroyJoint(this.joint);
				this.joint = null;
			}
		}else{
			stop();
		}
	}
});

ChangeMarioSizeClass = Class.create(AnimationClass, {
	initialize: function($super, aGame, aPos, aProperties, aCallback){
		var props = {
			time: 180,
			physics: {
				size: {w: 1.5, h: 3}	//random;
			},
			userData: {
				name: 'change Mario size'
			}
		}
		gUtil.copyProperties(props, aProperties);
		
		// TODO: Big mario and small mario are scalled to 1.5x3 world size, so the
		// animation looks wired. Make one appear small and one big.
		
		$super(aGame, gCachedData['marioStand'], aPos, props, aCallback);
		aGame.paused = true;
		this.imgs = new MovingImagesClass(
				[gCachedData['marioStand-big'],
				gCachedData['marioStand-small']],
				20);
	},
	
	getImage: function(){
		return this.imgs.getImage();
	}
});