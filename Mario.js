
OldMarioClass = Class.create(EntityClass, {
	/*
	This is the main charecter.
	The State design pattern is used for Standing/Walking...
	movingState is the pointer to the state object which
	holds the currect behaviour of Mario.
	*/
	
	jumpForce: null,
	movingState: null,
	facing: null,
	power: 0,		// 0-Dead; 1-small; 2-big; 3-flower
	
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {
				fixed: false,
				size: {w: 1.5, h: 3}
			},
			userData: {
				name: 'mario'
			},
			other: {
				zIndex: 20
			}
		};
		for(var key in aProperties){
			props[key] = aProperties[key];
		}
		
		OldMarioClass.State.Standing.initialize(this);
		OldMarioClass.State.Walking.initialize(this);
		OldMarioClass.State.Jumping.initialize(this);
		OldMarioClass.State.Ducking.initialize(this);
		
		OldMarioClass.Images = {
			small: {
				'stand': gCachedData['marioStand-small'],
				'walk': new MovingImagesClass(
					[gCachedData['marioWalk1-small'],
					gCachedData['marioWalk2-small'],
					gCachedData['marioWalk3-small']],
					20
				),
				'jump': gCachedData['marioJump-small'],
				'duck': gCachedData['marioDuck-small']
			},
			big: {
				'stand': gCachedData['marioStand'],
				'walk': new MovingImagesClass(
					[gCachedData['marioWalk1'],
					gCachedData['marioWalk2'],
					gCachedData['marioWalk3']],
					20
				),
				'jump': gCachedData['marioJump'],
				'duck': gCachedData['marioDuck']
			},
			flower: {
				// 'stand': gCachedData['marioStand'],
				// 'walk': [gCachedData['marioWalk1'], gCachedData['marioWalk2'], gCachedData['marioWalk3']],
				// 'jump': gCachedData['marioJump'],
				// 'duck': gCachedData['marioDuck']
			}
		}
		
		
		$super(aGame, gCachedData['marioStand'], aPos, props);
		this.movingState = OldMarioClass.State.Standing;
		OldMarioClass._jumpForce = new aGame.physEngine.b2Vec2(0, -180);
		this.facing = OldMarioClass.Directions.RIGHT;
		
		this.power = 'small';
	},
	
	getImageGroup: function(){
		return this.imgs[this.power]
	},
	
	getImage: function(){
		return this.movingState.getImage();
	},
		
	dieInGame: function(){
		this.game.spawnAnimation('DyingMario', this.getPosition(), null);
		this.die();
		this.game.endTheGame();
	},
	
	update: function(){
		if(this.isDead){
			this.dieInGame();
		}
		this.movingState.update();
		
		// The contact listener (onTouch) won't work when
		// there is nothing touching the player.
		// Therefore jumping or falling is the actual state.
		// If a contact is happening it will be triggered 
		// during the next world.Step(), and the correct
		// state will be selected in the onTouch method.
		this.movingState = OldMarioClass.State.Jumping;
	},
	
	updateNormal: function(){
		var dx = 0, dy = 0;
		var body = this.physBody.GetBody();
	
		if( Input.actions['move-left'] ){
			dx = -OldMarioClass._speed;
			this.facing = OldMarioClass.Directions.LEFT;
		}
		if( Input.actions['move-right'] ){
			dx = OldMarioClass._speed;
			this.facing = OldMarioClass.Directions.RIGHT;
		}
		if( Input.actions['jump'] && this.movingState != OldMarioClass.State.Jumping ){
			body.ApplyForce(OldMarioClass._jumpForce, this.getPosition());
		}
		
		var speed = new this.game.physEngine.b2Vec2(dx, dy);
		body.SetLinearVelocity(speed);
		body.SetAwake(true);
		
		return {dx, dy};
	},
	
	onTouch: function(other, contact, impulse){
		// This is a callback during the world.Step().
		// Do not change anything related to the physical
		// body, or apply force/velocity to it.
		// Instead flag a request which the update method
		// will handle later.
		if(contact.GetManifold().m_pointCount == 0){
			this.movingState = OldMarioClass.State.Jumping;
			return;
		}
		var x = this.game.physEngine.understandTheContact(contact);
		if(x.dir == 'above' && x.b1 == this.physBody.GetBody()){
			if(Math.abs(this.physBody.GetBody().GetLinearVelocity().x) == 6){
				this.movingState = OldMarioClass.State.Walking;
			}else if( Input.actions['move-down'] ){
				this.movingState = OldMarioClass.State.Ducking;
			}else{
				this.movingState = OldMarioClass.State.Standing;
			}
		}
	}
	
});
OldMarioClass._speed = 6;
OldMarioClass._jumpForce = null;
OldMarioClass.Directions = {LEFT: -1, RIGHT: 1};
OldMarioClass.Images = {};
OldMarioClass.State = {
	Standing: {
		owner: null,
		name: 'stand',
		
		initialize: function(aOwner){
			this.owner = aOwner;
		},
		
		getImage: function(){
			return OldMarioClass.Images[this.owner.power]['stand'];
		},
		
		update: function(){
			var {dx, dy} = this.owner.updateNormal();
			if(dx != 0 || dy != 0)
				this.owner.movingState = OldMarioClass.State.Walking;
			if( Input.actions['jump'])
				this.owner.movingState = OldMarioClass.State.Jumping;
		}
	},
	Walking: {
		imgs: null,
		owner: null,
		name: 'walk',
		
		initialize: function(aOwner){
			this.owner = aOwner;
			this.imgs = new MovingImagesClass(
				[gCachedData['marioWalk1'],
				gCachedData['marioWalk2'],
				gCachedData['marioWalk3']],
				20
			);
		},
		
		getImage: function(){
			return OldMarioClass.Images[this.owner.power]['walk'].getImage();
		},
		
		update: function(){
			var {dx, dy} = this.owner.updateNormal();
			if(dx == 0 && dy == 0)
				this.owner.movingState = OldMarioClass.State.Standing;
			if( Input.actions['jump'])
				this.owner.movingState = OldMarioClass.State.Jumping;
		}
	},
	Jumping: {
		owner: null,
		name: 'jump',
		
		initialize: function(aOwner){
			this.owner = aOwner;
		},
		getImage: function(){
			return OldMarioClass.Images[this.owner.power]['jump'];
		},
		update: function(){
			// Do nothing?
		}
	},
	Ducking: {
		owner: null,
		name: 'duck',
		
		initialize: function(aOwner){
			this.owner = aOwner;
		},
		getImage: function(){
			return OldMarioClass.Images[this.owner.power]['duck'];
		},
		update: function(){}
	}
}


MarioClass = Class.create(EntityClass, {
	/*
	This is the main charecter.
	The State design pattern is used for Standing/Walking...
	movingState is the pointer to the state object which
	holds the currect behaviour of Mario.
	
	This is also a template class which will be subclassed by MarioSmallClass,
	MarioBigClass and MarioFlowerClass.
	*/
	
	jumpForce: null,
	movingState: null,
	facing: null,
	
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {
				fixed: false,
				size: {w: 1.5, h: 3}
			},
			userData: {
				name: 'mario'
			},
			other: {
				zIndex: 20
			}
		};
		for(var key in aProperties){
			props[key] = aProperties[key];
		}
		
		MarioClass.State.Standing.initialize(this);
		MarioClass.State.Walking.initialize(this);
		MarioClass.State.Jumping.initialize(this);
		MarioClass.State.Ducking.initialize(this);
		
		// MarioClass.Images = {
		// 	small: {
		// 		'stand': gCachedData['marioStand-small'],
		// 		'walk': new MovingImagesClass(
		// 			[gCachedData['marioWalk1-small'],
		// 			gCachedData['marioWalk2-small'],
		// 			gCachedData['marioWalk3-small']],
		// 			20
		// 		),
		// 		'jump': gCachedData['marioJump-small'],
		// 		'duck': gCachedData['marioDuck-small']
		// 	},
		// 	big: {
		// 		'stand': gCachedData['marioStand'],
		// 		'walk': new MovingImagesClass(
		// 			[gCachedData['marioWalk1'],
		// 			gCachedData['marioWalk2'],
		// 			gCachedData['marioWalk3']],
		// 			20
		// 		),
		// 		'jump': gCachedData['marioJump'],
		// 		'duck': gCachedData['marioDuck']
		// 	},
		// 	flower: {
		// 		// 'stand': gCachedData['marioStand'],
		// 		// 'walk': [gCachedData['marioWalk1'], gCachedData['marioWalk2'], gCachedData['marioWalk3']],
		// 		// 'jump': gCachedData['marioJump'],
		// 		// 'duck': gCachedData['marioDuck']
		// 	}
		// }
		
		
		$super(aGame, gCachedData['marioStand'], aPos, props);
		this.movingState = MarioClass.State.Standing;
		MarioClass._jumpForce = new aGame.physEngine.b2Vec2(0, -180);
		this.facing = MarioClass.Directions.RIGHT;
		
		this.power = 'small';
	},
	
	getImageGroup: function(){
		return this.imgs[this.power]
	},
	
	getImage: function(){
		return this.movingState.getImage();
	},
		
	dieInGame: function(){
		this.game.spawnAnimation('DyingMario', this.getPosition(), null);
		this.die();
		this.game.endTheGame();
	},
	
	update: function(){
		if(this.isDead){
			this.dieInGame();
		}
		this.movingState.update();
		
		// The contact listener (onTouch) won't work when
		// there is nothing touching the player.
		// Therefore jumping or falling is the actual state.
		// If a contact is happening it will be triggered 
		// during the next world.Step(), and the correct
		// state will be selected in the onTouch method.
		this.movingState = MarioClass.State.Jumping;
	},
	
	updateNormal: function(){
		var dx = 0, dy = 0;
		var body = this.physBody.GetBody();
	
		if( Input.actions['move-left'] ){
			dx = -MarioClass._speed;
			this.facing = MarioClass.Directions.LEFT;
		}
		if( Input.actions['move-right'] ){
			dx = MarioClass._speed;
			this.facing = MarioClass.Directions.RIGHT;
		}
		if( Input.actions['jump'] && this.movingState != MarioClass.State.Jumping ){
			body.ApplyForce(MarioClass._jumpForce, this.getPosition());
		}
		
		var speed = new this.game.physEngine.b2Vec2(dx, dy);
		body.SetLinearVelocity(speed);
		body.SetAwake(true);
		
		return {dx, dy};
	},
	
	onTouch: function(other, contact, impulse){
		// This is a callback during the world.Step().
		// Do not change anything related to the physical
		// body, or apply force/velocity to it.
		// Instead flag a request which the update method
		// will handle later.
		if(contact.GetManifold().m_pointCount == 0){
			this.movingState = MarioClass.State.Jumping;
			return;
		}
		var x = this.game.physEngine.understandTheContact(contact);
		if(x.dir == 'above' && x.b1 == this.physBody.GetBody()){
			if(Math.abs(this.physBody.GetBody().GetLinearVelocity().x) == 6){
				this.movingState = MarioClass.State.Walking;
			}else if( Input.actions['move-down'] ){
				this.movingState = MarioClass.State.Ducking;
			}else{
				this.movingState = MarioClass.State.Standing;
			}
		}
	}
	
});
MarioClass._speed = 6;
MarioClass._jumpForce = null;
MarioClass.Directions = {LEFT: -1, RIGHT: 1};
MarioClass.Images = {};
MarioClass.State = {
	Standing: {
		owner: null,
		name: 'stand',
		
		initialize: function(aOwner){
			this.owner = aOwner;
		},
		
		getImage: function(){
			return MarioClass.Images[this.owner.power]['stand'];
		},
		
		update: function(){
			var {dx, dy} = this.owner.updateNormal();
			if(dx != 0 || dy != 0)
				this.owner.movingState = MarioClass.State.Walking;
			if( Input.actions['jump'])
				this.owner.movingState = MarioClass.State.Jumping;
		}
	},
	Walking: {
		imgs: null,
		owner: null,
		name: 'walk',
		
		initialize: function(aOwner){
			this.owner = aOwner;
			this.imgs = new MovingImagesClass(
				[gCachedData['marioWalk1'],
				gCachedData['marioWalk2'],
				gCachedData['marioWalk3']],
				20
			);
		},
		
		getImage: function(){
			return MarioClass.Images[this.owner.power]['walk'].getImage();
		},
		
		update: function(){
			var {dx, dy} = this.owner.updateNormal();
			if(dx == 0 && dy == 0)
				this.owner.movingState = MarioClass.State.Standing;
			if( Input.actions['jump'])
				this.owner.movingState = MarioClass.State.Jumping;
		}
	},
	Jumping: {
		owner: null,
		name: 'jump',
		
		initialize: function(aOwner){
			this.owner = aOwner;
		},
		getImage: function(){
			return MarioClass.Images[this.owner.power]['jump'];
		},
		update: function(){
			// Do nothing?
		}
	},
	Ducking: {
		owner: null,
		name: 'duck',
		
		initialize: function(aOwner){
			this.owner = aOwner;
		},
		getImage: function(){
			return MarioClass.Images[this.owner.power]['duck'];
		},
		update: function(){}
	}
}

MarioSmallClass = Class.create(MarioClass, {
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {
				size: {w: 1.5, h: 1.5},
				density: 0.02
			},
			userData: {
				name: 'small Mario'
			}
		}
		gUtil.copyProperties(props, aProperties);
		$super(aGame, aPos, props);
	}
})

MarioBigClass = Class.create(MarioClass, {
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {
				size:{w: 1.5, h: 3}
			},
			userData: {
				name: 'big Mario'
			}
		}
		gUtil.copyProperties(props, aProperties);
		$super(aGame, aPos, aProperties);
	}
})