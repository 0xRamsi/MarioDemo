
EnemyGoombaClass = Class.create(EntityClass, {
	dir: 1,
	
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {
				fixed: false,
				size: {w: 1.5, h: 1.5}
			},
			userData: {
				name: 'goomba'
			},
			other: {
				zIndex: 21
			}
		}
		gUtil.copyProperties(props, aProperties);
		$super(aGame, gCachedData['Goomba1'], aPos, props);
		this.imgs = new MovingImagesClass(
			[gCachedData['Goomba1'], gCachedData['Goomba2']], 50
		);
		this.dieSound = gCachedData['sounds/WU_SE_EMY_DOWN_COMBO_1.wav'];
	},
	
	getImage: function(){
		return this.imgs.getImage();
	},
	
	update: function(){
		if(this.isDead){
			if(this.getPosition().y < 30){
				this.game.spawnAnimation('DyingGoomba', this.getPosition(), null);
				if(this.dieSound.loaded)
					this.game.SM.play(this.dieSound);
			}
			this.die();
			return;
		}
		var dx = 0, dy = 0;
		var body = this.physBody.GetBody();
		
		dx = this.dir * EnemyGoombaClass._speed;
		
		var speed = new this.game.physEngine.b2Vec2(dx, dy);
		body.SetLinearVelocity(speed);
		// body.SetAwake(true);		-- Should be awake and moving all the time.
	},
	
	die: function(){
		this.game.kill(this);
	},
	
	onTouch: function(other, contact, impulse){
		if(contact.GetManifold().m_pointCount == 0){
			return;		// Just a sanity check, should not get here.
		}

		var x = this.game.physEngine.understandTheContact(contact);
		
		// If I hit Mario, he dies.
		if(x.dir == 'right to' && other == this.game.player.physBody.GetBody()){
			this.game.player.interact(this);
		}
		if(x.dir == 'above' && other == this.game.player.physBody.GetBody())
			this.isDead = true;
		
		// If I hit a wall - change direction.
		if(x.dir == 'right to'){
			this.dir = this.dir * (-1);
		}
	}
});
EnemyGoombaClass._speed = 3;
