// Not used.
Missle0Class = Class.create(EntityClass, {
	dest: null,
	sound: null,
	speed_dx: 0,
	speed_dy: 0,
	graviry_dx: 0,
	graviry_dy: 0,
	
	getSpeed: function(){
		return this._speed;
	},
	
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {
				fixed: false,
				size: {w: 1.2, h: 0.4}
			},
			other: {
				zIndex: 21
			},
			userData: {
				name: 'missle0'
			}
		}
		for(var key in aProperties){
			props[key] = aProperties[key];
		}
		$super(aGame, gCachedData['images/missile0.png'], aPos, props);
		this.sound = gCachedData['sounds/missileExplode.wav'];
	},
	
	setTarget: function(destination){
		var p1 = this.getPosition();
		var p2 = destination;
		
		var radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
		this.setAngle(radians);
		
		this.speed_dx = Math.cos(this.getAngle()) * Missle0Class._speed;
		this.speed_dy = Math.sin(this.getAngle()) * Missle0Class._speed;
		var body = this.physBody.GetBody();
		this.graviry_dx = body.GetMass() * -this.game.physEngine.world.GetGravity().x;
		this.graviry_dy = body.GetMass() * -this.game.physEngine.world.GetGravity().y;
	},
	
	die: function(){
		// Check if I hit a player that I should kill as well.
		// Draw explosion?
		this.game.kill(this);
	},
	
	update: function(){
		if(this.isDead){
			this.die();
			if(this.dispatchExposion){
				this.game.spawnEntity('Explosion', {x: this.getPosition().x, y: this.getPosition().y});
			}
			return;
		}
		
		var body = this.physBody.GetBody();
		// Kill if it is too far from the player.
		if(gUtil.distance(body.GetPosition(), this.game.player.physBody.GetBody().GetPosition()) > 250)
			this.die();
		
		var speed = new this.game.physEngine.b2Vec2(this.speed_dx, this.speed_dy);
		var antiGravityForce = new this.game.physEngine.b2Vec2(this.graviry_dx, this.graviry_dy);
		body.ApplyForce(antiGravityForce, body.GetPosition());
		body.SetLinearVelocity(speed);
		// body.SetAwake(true);   -- no need, it has speed in the begining, and upon interaction it is destroyed.
	},
	
	onTouch: function(other, contact, impulse){
		this.isDead = true;
		this.dispatchExposion = true;
		if(this.sound.loaded)
			this.game.SM.play('sounds/missileExplode.wav', false);
	}
});
Missle0Class._speed = 20;


Missle0ExplosionClass = Class.create(EntityClass, {
	frame: 0,
	counter: 0,
	
	initialize: function($super, aGame, aPos, aProperties){
		
		var props = {
			fixed: true,
			size: {w: 0.8, h: 0.8}
			collisionGroup: -1,
			zIndex: 21,
			name: 'explosion'
		}
		for(var key in aProperties){
			props[key] = aProperties[key];
		}
		$super(aGame, gCachedData['images/explosion.png'], aPos, props);
	},
	
	die: function(){
		this.game.kill(this);
	},
	
	getImage: function(){
		this.counter = (this.counter+1)%20;
		if(this.counter == 0){
			this.rotateBy(Math.PI/3);
		}
		return this.img;
	},
	
	update: function(){
		if(++this.frame > 50)
			this.die();
	}
});
