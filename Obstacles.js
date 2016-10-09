
ObsticleClass = Class.create(EntityClass, {
	initialize: function($super, aGame, aPos, aImage, aProperties){
		var props = {
			physics: {
				fixed: true,
				maskBits: 65535,
				categoryBits: 65535,
				size: {w: 1, h: 1}
			},
			userData: {
				name: 'Obsticle'
			},
			other: {
				zIndex: 11
			}
		}
		gUtil.copyProperties(props, aProperties);
		
		$super(aGame, aImage, aPos, props);
	}
});

BrickClass = Class.create(ObsticleClass, {
	initialize: function($super, aGame, aPos, aProperties){
		aProperties.userData['name'] = 'Brick wall';
		aProperties.physics.size = {w: 1.5, h: 1.5};
		$super(aGame, aPos, gCachedData['images/brick_wall.png'], aProperties);
		this.dieSound = gCachedData['sounds/M1_BreakBlock.wav'];
	},
	
	break: function(){
		this.game.spawnAnimation("BreakBrick", this.getPosition());
		if(this.dieSound.loaded)
			this.game.SM.play(this.dieSound)
		this.die();
	},
	
	onTouch: function(other, contact, impulse){
		if(contact.GetManifold().m_pointCount == 0){
			return;		// Just a sanity check, should not get here.
		}
		
		var x = this.game.physEngine.understandTheContact(contact);
		// If the brick is hit from below.
		if(x.dir == 'above' && x.b1 == this.physBody.GetBody()){
			// If Mario hit the brick. Now nothing else could reach the
			// brick from below, but it may happen with future enemies.
			if(other == this.game.player.physBody.GetBody()){
				this.game.player.interact(this);
			}
		}
	}
});

DeadBlockClass = Class.create(ObsticleClass, {
	initialize: function($super, aGame, aPos, aProperties){
		aProperties.userData['name'] = 'Dead block';
		aProperties.physics.size = {w: 1.5, h: 1.5};
		$super(aGame, aPos, gCachedData['deadBlock'], aProperties);
	}
});


SingleGroundPieceClass = Class.create(ObsticleClass, {
	initialize: function($super, aGame, aPos, anImage, aProperties){
		$super(aGame, aPos, anImage, aProperties);
	}
})

GroundClass = {
	makeGround: function(aGame, aBorders){
		// This method is called while setting up the game.
		var res = [];
		for(var i = 0; i < aBorders.length; i++){
			border = aBorders[i];
			var props = {
				physics: {
					size: border
				},
				userData: {
					name: 'Ground'
				}
			}
		
			// We have to add half width and hight to the position because for the 
			// ground it is an absolute value and not the center.
			var w = new SingleGroundPieceClass(
				aGame,
				{x: border.x + border.w/2, y: border.y + border.h/2},
				gCachedData['ground.png'],
				props
			);
			res.push(w);
		}
		return res;
	}
};


TubeClass = Class.create(ObsticleClass, {
	initialize: function($super, aGame, aPos){
		// aPos is considered the top left corner,
		// so this will dictate the tubes height.
		var props = {
			physics: {size: {w: 3, h: 6}},
			userData: {name: 'Tube'},
			other: {zIndex: 10}
		}
		aPos.y += props.physics.size.h/2;
		$super(aGame, aPos, gCachedData['tube.png'], props);
	}
});


CastleClass = Class.create(ObsticleClass, {
	initialize: function($super, aGame, aPos){
		// aPos is considered the top left corner,
		// so this will dictate the tubes height.
		var props = {
			physics: {size: {w: 11, h: 14}},
			userData: {name: 'castle'}}
		aPos.y += props.physics.size.h/2;
		$super(aGame, aPos, gCachedData['castle'], props);
	},
	
	onTouch: function(other, contact, impulse){
		if(contact.GetManifold().m_pointCount == 0){
			return;		// Just a sanity check, should not get here.
		}
		
		// If I hit Mario, he wins.
		if(other == this.game.player.physBody.GetBody()){
			this.game.player.interact(this);
		}
	}
});

QuestionBrickClass = Class.create(ObsticleClass, {
	reactionType: null,
	
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {size: {w: 1.5, h: 1.5}},
			userData: {name: 'Question Brick'},
			other: {zIndex: 10}
		};
		$super(aGame, aPos, gCachedData['questionBrick'], props);
		this.reactionType = aProperties.reactionType;
	},
	
	giveReward: function(){
		this.game.spawnEntity("DeadBlock", this.getPosition(), null);
		this.game.spawnAnimation(this.reactionType, this.getPosition());
		this.die();
	},
	
	onTouch: function(other, contact, impulse){
		if(contact.GetManifold().m_pointCount == 0){
			return;		// Just a sanity check, should not get here.
		}
		
		var x = this.game.physEngine.understandTheContact(contact);
		// If the brick is hit from below.
		if(x.dir == 'above' && x.b1 == this.physBody.GetBody()){
			// If Mario hit the brick. Now nothing else could reach the
			// brick from below, but it may happen with future enemies.
			if(other == this.game.player.physBody.GetBody()){
				this.game.player.interact(this);
			}
		}
	}
});
