MarioClass = Class.create(EntityClass, {
	jumpForce: null,
	speed: 6,		// This is a constant speed through the game.
	movingState: null,
	Directions: {LEFT: -1, RIGHT: 1},
	dispatched: [],
	isImmune: 300,
	
	initialize: function($super, aGame, aPos, aProperties){
		$super(aGame, gCachedData['marioStand-small'], aPos, aProperties);
	},
	
	update: function(){
		while(this.dispatched.length > 0){
			this.dispatched[0].bind(this)();
			this.dispatched.splice(0, 1);
		}
		if(this.isDead){
			this.die();
		}
		if(this.isImmune)
			this.isImmune--;
		this.movingState.update();

		// The contact listener (onTouch) won't work when
		// there is nothing touching the player.
		// Therefore jumping or falling is the actual state.
		// If a contact is happening it will be triggered
		// during the next world.Step(), and the correct
		// state will be selected in the onTouch method.
		this.changeState("Jumping");
	},
	
	updateNormal: function(){
		var dx = 0, dy = 0;
		var body = this.physBody.GetBody();
		
		if( Input.actions['move-left'] ){
			dx = -this.speed;
			this.facing = this.Directions.LEFT;
		}
		if( Input.actions['move-right'] ){
			dx = this.speed;
			this.facing = this.Directions.RIGHT;
		}
		if( Input.actions['jump'] && this.movingState.name != 'jump' ){
			body.ApplyForce(this._jumpForce, this.getPosition());
		}

		var speed = new this.game.physEngine.b2Vec2(dx, dy);
		body.SetLinearVelocity(speed);
		body.SetAwake(true);

		return {dx, dy};
	},
	
	interact: function(other){
		// Observer design pattern - used because the main charecter has many
		// interactions, and it is more readable and consistent to have one method
		// where the different interactions are handled rather than a single-purpose
		// function for each type of interaction.
		// 
		// The dispatcher is used here because this function is being called through
		// callbacks while world.Step() is being executed; therefore no body changes
		// can be made in here.
		
		if(!other){
			console.log('"interact" called with \'null\' or \'undefined\'', other);
			return;
		}
		if(!(other.physBody)){
			console.log('"interact" called from an object without a physBody', other);
			return;
		}

		switch(other.physBody.GetBody().GetUserData().name){
			case "mushroom":
				this.dispatched.push(this.grow);
				break;
			default:
				// Do nothing
		}
		
		if(this.isImmune){
			return;
		}
		
		switch(other.physBody.GetBody().GetUserData().name){
			case "goomba":
				this.dispatched.push(this.shrink);
				this.isImmune = 10;
				break;
			case "fire bar":
				this.dispatched.push(this.shrink);
				this.isImmune = 10;
				break;
			default:
				console.log('unknown entity called "interact" on Mario. Name is:', other.physBody.GetBody().GetUserData().name);
				break;
		}
	},
	
	onTouch: function(other, contact, impulse){
		// This is a callback during the world.Step().
		// Do not change anything related to the physical
		// body, or apply force/velocity to it.
		// Instead flag a request which the update method
		// will handle later.
		if(contact.GetManifold().m_pointCount == 0){
			this.changeState("Jumping");
			return;
		}
		var x = this.game.physEngine.understandTheContact(contact);
		if(x.dir == 'above' && x.b1 == this.physBody.GetBody()){
			if(Math.abs(this.physBody.GetBody().GetLinearVelocity().x) == 6){
				this.changeState("walking");
			}else if( Input.actions['move-down'] ){
				this.changeState("Ducking");
			}else{
				this.changeState("Standing");
			}
		}
	},
	
	getImage: function(){
		return this.movingState.getImage();
	},
	
	grow: function(){
		console.log('unimplemented: grow')
	},
	
	shrink: function(){
		console.log('unimplemented: shrink')
	}
	
});

MarioSmallClass = Class.create(MarioClass, {
	hitBy: null,
	
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {
				fixed: false,
				size: {w: 1.5, h: 1.5}
			},
			userData: {
				name: 'mario'
			},
			other: {
				zIndex: 20
			}
		};
		gUtil.copyProperties(props, aProperties);

		MarioSmallClass.State.Standing.initialize(this);
		MarioSmallClass.State.Walking.initialize(this);
		MarioSmallClass.State.Jumping.initialize(this);
		MarioSmallClass.State.Ducking.initialize(this);
		
		$super(aGame, aPos, props);
		this.movingState = MarioSmallClass.State.Standing;
		this._jumpForce = new aGame.physEngine.b2Vec2(0, -90);
	},
	
	changeState: function(name){
		switch(name.toLowerCase()){
			case "standing": 
				this.movingState = MarioSmallClass.State.Standing;
				break;
			case "walking":
				this.movingState = MarioSmallClass.State.Walking;
				break;
			case "jumping":
				this.movingState = MarioSmallClass.State.Jumping;
				break;
			case "ducking":
				this.movingState = MarioSmallClass.State.Ducking;
		}
	},
	
	grow: function(){
		var pos = this.getPosition();
		pos.y -= 0.75;
		var SpawnBigMario = function(){
			var pos = this.getPosition();
			var newPlayer = this.game.spawnEntity('MarioBig', pos, null);
			this.game.player = newPlayer;
			this.isImmune = 300;
		}.bind(this);
		
		this.game.spawnAnimation('ChangeMarioSize', pos, null, SpawnBigMario);
		this.die()
	},
	
	shrink: function(){
		this.die();
		this.game.spawnAnimation('DyingMario', this.getPosition(), null);
		this.game.endTheGame();
	}
});
MarioSmallClass.State = {
	Standing: {
		owner: null,
		name: 'stand',
		img: null,
		
		initialize: function(aOwner){
			this.owner = aOwner;
			this.img = gCachedData['marioStand-small'];
		},
		
		getImage: function(){
			return this.img;
		},
		
		update: function(){
			var {dx, dy} = this.owner.updateNormal();
			if(dx != 0 || dy != 0)
				this.owner.movingState = MarioSmallClass.State.Walking;
			if( Input.actions['jump'])
				this.owner.movingState = MarioSmallClass.State.Jumping;
		}
	},
	Walking: {
		imgs: null,
		owner: null,
		name: 'walk',
		
		initialize: function(aOwner){
			this.owner = aOwner;
			this.imgs = new MovingImagesClass(
				[gCachedData['marioWalk1-small'],
				gCachedData['marioWalk2-small'],
				gCachedData['marioWalk3-small']],
				20
			);
		},
		
		getImage: function(){
			return this.imgs.getImage();
		},
		
		update: function(){
			var {dx, dy} = this.owner.updateNormal();
			if(dx == 0 && dy == 0)
				this.owner.movingState = MarioSmallClass.State.Standing;
			if( Input.actions['jump'])
				this.owner.movingState = MarioSmallClass.State.Jumping;
		}
	},
	Jumping: {
		owner: null,
		name: 'jump',
		img: null,
		
		initialize: function(aOwner){
			this.owner = aOwner;
			this.img = gCachedData['marioJump-small'];
		},
		getImage: function(){
			return this.img;
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
			return gCachedData['marioStand-small']
		},
		update: function(){}
	}
}
// -----
MarioBigClass = Class.create(MarioClass, {
	
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
		gUtil.copyProperties(props, aProperties);

		MarioBigClass.State.Standing.initialize(this);
		MarioBigClass.State.Walking.initialize(this);
		MarioBigClass.State.Jumping.initialize(this);
		MarioBigClass.State.Ducking.initialize(this);
		
		$super(aGame, aPos, props);
		this.movingState = MarioBigClass.State.Standing;
		this._jumpForce = new aGame.physEngine.b2Vec2(0, -180);
	},
	
	changeState: function(name){
		switch(name.toLowerCase()){
			case "standing": 
				this.movingState = MarioBigClass.State.Standing;
				break;
			case "walking":
				this.movingState = MarioBigClass.State.Walking;
				break;
			case "jumping":
				this.movingState = MarioBigClass.State.Jumping;
				break;
			case "ducking":
				this.movingState = MarioBigClass.State.Ducking;
		}
	},
	
	grow: function(){
		// Do nothing - mario is big.
		console.log(890)
	},
	
	shrink: function(){
		var pos = this.getPosition();
		// pos.y += 0.75;
		var SpawnSmallMario = function(){
			var pos = this.getPosition();
			var newPlayer = this.game.spawnEntity('MarioSmall', pos, null);
			this.game.player = newPlayer;
			this.isImmune = 300;
		}.bind(this);
		
		this.game.spawnAnimation('ChangeMarioSize', pos, null, SpawnSmallMario);
		this.die();
	}
});
MarioBigClass.State = {
	Standing: {
		owner: null,
		name: 'stand',
		img: null,
		
		initialize: function(aOwner){
			this.owner = aOwner;
			this.img = gCachedData['marioStand-big'];
		},
		
		getImage: function(){
			return this.img;
		},
		
		update: function(){
			var {dx, dy} = this.owner.updateNormal();
			if(dx != 0 || dy != 0)
				this.owner.movingState = MarioBigClass.State.Walking;
			if( Input.actions['jump'])
				this.owner.movingState = MarioBigClass.State.Jumping;
		}
	},
	Walking: {
		imgs: null,
		owner: null,
		name: 'walk',
		
		initialize: function(aOwner){
			this.owner = aOwner;
			this.imgs = new MovingImagesClass(
				[gCachedData['marioWalk1-big'],
				gCachedData['marioWalk2-big'],
				gCachedData['marioWalk3-big']],
				20
			);
		},
		
		getImage: function(){
			return this.imgs.getImage();
		},
		
		update: function(){
			var {dx, dy} = this.owner.updateNormal();
			if(dx == 0 && dy == 0)
				this.owner.movingState = MarioBigClass.State.Standing;
			if( Input.actions['jump'])
				this.owner.movingState = MarioBigClass.State.Jumping;
		}
	},
	Jumping: {
		owner: null,
		name: 'jump',
		img: null,
		
		initialize: function(aOwner){
			this.owner = aOwner;
			this.img = gCachedData['marioJump-big'];
		},
		getImage: function(){
			return this.img;
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
			return gCachedData['marioDuck-big']
		},
		update: function(){}
	}
}
