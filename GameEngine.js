debug = true;
real = true;
sideMap = true;

GameEngineClass = Class.create({
	dynamicEntities : [],
	staticEntities: [],
	factory: {},
	physEngine: null,
	SM: null,
	player: null,
	castle: null,
	renderer: null,
	paused: false,
	
	initialize: function(worldProps){
		this.factory['MarioSmall'] = MarioSmallClass;
		this.factory['MarioBig'] = MarioBigClass;
		this.factory['FireBar'] = FireBarClass;
		this.factory['Wall'] = BrickClass;
		this.factory['Tube'] = TubeClass;
		this.factory['Goomba'] = EnemyGoombaClass;
		this.factory['ChangeMarioSize'] = ChangeMarioSizeClass;
		this.factory['DeadBlock'] = DeadBlockClass;
		this.factory['Mushroom'] = MushroomClass;
		this.factory['Castle'] = CastleClass;
		this.factory['QuestionBrick'] = QuestionBrickClass;
		// Animations
		this.factory['DyingGoomba'] = DyingGoomba;
		this.factory['DyingMario'] = DyingMario;
		this.factory['ChangeMarioSize'] = ChangeMarioSizeClass;
		this.factory['Fireworks'] = FireworksClass;
		this.factory['Wasd'] = WasdClass;
		this.factory['BreakBrick'] = BreakBrickClass;
		this.factory['YieldMushroom'] = YieldMushroomClass;
		this.factory['YieldCoin'] = YieldCoinClass;
		
		this.physEngine = new PhysicsEngineClass(worldProps.gravity);
		this.SM = new SoundManager();
		var cameraProps = worldProps.camera;
		this.renderer = new RendererClass(cameraProps, this.physEngine);
		Input.setup(this);
		this.physEngine.setup(this.contactHandler);
		this.staticEntities = GroundClass.makeGround(this, worldProps.ground);
		
		var s = BackgroundClass.makeBackground(this, worldProps.background)
		for(var i=0; i<s.length; i++){
			this.staticEntities.push(s[i]);
		}
		this.dynamicEntities = [];
	},
	
	setup: function(entities){
		// This method gets a JSON describing a level, and puts all the elements into
		// the world.
		for(var name in entities){
			var e = this.spawnEntity(entities[name].type, entities[name].pos, entities[name].properties);
			if(name == 'Mario')
				this.player = e;
			if(name == 'Castle')
				this.castle = e;
		}
		
		this.spawnAnimation("Wasd", {x: 5, y: 5}, null);
	},
	
	prepareGameEnd: function(){
		this.SM.stopAll();
		Input.removeAllListeners();
		setTimeout(function(){this.renderer.addText("Game Over");}.bind(this), 20);
	},
	
	update: function(){
		for(var i = 0; i < this.dynamicEntities.length; i++){
			var element = this.dynamicEntities[i];
			if(element.getPosition().y > 30){
				element.isDead = true;
			}
			element.update();
		}
		// Calculate the cameras position
		// (try to center on the player).
		var p = this.player.getPosition();
		this.renderer.requestCameraPos(p.x);
		
		if(!(this.paused))
			this.physEngine.update();
		this.renderer.draw(this.dynamicEntities.concat(this.staticEntities));
	},
	
	getGround: function(){
		// Returning a randoms static entity, since it will be used as an
		// ancor for joints.
		return this.staticEntities[0];
	},
	
	spawnEntity: function(name, aPos, aProperties){
		if(!aProperties)
			aProperties = {};
		if(!(aProperties.physics))
			aProperties.physics = {}
		if(!(aProperties.userData))
			aProperties.userData = {}

		var newEntity = new (this.factory[name])(this, aPos, aProperties);
		if(newEntity.physBody.GetBody().GetType() == Box2D.Dynamics.b2Body.b2_staticBody){
			this.staticEntities.push(newEntity);
		}else{
			this.dynamicEntities.push(newEntity);
		}
		return newEntity;
	},
	
	kill: function(entity){
		for(var i = 0; i < this.dynamicEntities.length; i++){
			if(entity == this.dynamicEntities[i])
				break;
		}
		if(i < this.dynamicEntities.length){
			this.dynamicEntities.splice(i, 1);
			if(entity.physBody)		// will be false for animations.
				this.physEngine.removeBody(entity.physBody);
			return;
		}
		
		for(i = 0; i < this.staticEntities.length; i++){
			if(entity == this.staticEntities[i])
				break;
		}
		if(i < this.staticEntities.length){
			this.staticEntities.splice(i, 1);
			this.physEngine.removeBody(entity.physBody);
			return;
		}
		
		console.log('Could not find entity to kill', entity);
		return;
	},
	
	spawnAnimation: function(name, aPos, aProperties, aCallback){
		var newAnimation = (this.factory[name]).create(this, aPos, aProperties, aCallback);
		for(var i=0; i<newAnimation.length; i++)
			this.dynamicEntities.push(newAnimation[i]);
	},
	
	contactHandler: function(contact, impulse){
		// This function will be fired twice when 2 dynamic entities collide.
		// This function will be fired once when a dynamic and a static entities collide.
		var bodyA = contact.GetFixtureA().GetBody();
		var bodyB = contact.GetFixtureB().GetBody();
		bodyA.GetUserData().entity.onTouch(bodyB, contact, impulse);
		bodyB.GetUserData().entity.onTouch(bodyA, contact, impulse);
	},
	
	finalAnimation: function(){
		this.player.update();
		this.physEngine.update();
		
		this.renderer.draw(this.dynamicEntities.concat(this.staticEntities));
	}
});
