
MushroomClass = Class.create(EntityClass, {
	dir: 1,
	isDead: false,
	shouldInteract: false,
	
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {
				fixed: false,
				size: {w: 1.5, h: 1.5}
			},
			userData: {
				name: 'mushroom'
			},
			other: {
				zIndex: 21
			}
		}
		gUtil.copyProperties(props, aProperties);
		$super(aGame, gCachedData['mushroom'], aPos, props);
	},
	
	getImage: function(){
		return this.img;
	},
	
	update: function(){
		if(this.shouldInteract)
			this.game.player.interact(this);
		
		if(this.isDead){
			this.die();
			return;
		}
		var dx = 0, dy = 0;
		var body = this.physBody.GetBody();
		
		dx = this.dir * EnemyGoombaClass._speed;
		
		var speed = new this.game.physEngine.b2Vec2(dx, dy);
		body.SetLinearVelocity(speed);
	},
	
	die: function(){
		this.game.kill(this);
	},
	
	onTouch: function(other, contact, impulse){
		if(contact.GetManifold().m_pointCount == 0){
			return;		// Just a sanity check, should not get here.
		}

		var x = this.game.physEngine.understandTheContact(contact);

		if(other == this.game.player.physBody.GetBody()){
			// The animation cannot be spawned here and the mushroom cannnot be killed
			// here, because we are in the middle of a game step from the physics
			// engine.
			this.isDead = true;
			this.shouldInteract = true;
		}

		// If I hit a wall - change direction.
		if(x.dir == 'right to'){
			this.dir = this.dir * (-1);
		}
	}
});
MushroomClass._speed = 3.5;
