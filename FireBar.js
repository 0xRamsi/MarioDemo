
FireBarClass = Class.create(ObsticleClass, {
	game: null,
	ancor: null,
	shouldInteract: false,
	
	getSpeed: function(){
		return this._speed;
	},
	
	initialize: function($super, aGame, aPos, aProperties){
		var props = {
			physics: {
				fixedRotation: false,
				fixed: false,
				size: {w: 0.75, h: 1.5}
			},
			userData: {
				name: 'fire bar'
			},
			other: {
				zIndex: 11
			}
		}
		gUtil.copyProperties(props, aProperties);
		
		$super(aGame, aPos, gCachedData['firebar1'], props);
		this.game = aGame;
		this.imgs = new MovingImagesClass(
			[gCachedData['firebar1'], gCachedData['firebar2']], 10);
		
		// Suspend the fire bar in the air and make it rotate.
		var g = this.game.getGround().physBody.GetBody();
		var body = this.physBody.GetBody();
		var v = new Box2D.Common.Math.b2Vec2(body.GetPosition().x, body.GetPosition().y);
		v.Add(new Box2D.Common.Math.b2Vec2(0, -this.size.h/2));
		
		jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
		jointDef.Initialize(body, g, v);
		jointDef.maxMotorTorque = 10.0;
		jointDef.motorSpeed = -2.0;
		jointDef.enableMotor = true;
		jointDef.maxForce = 300.0 * body.GetMass();
		var joint = this.game.physEngine.world.CreateJoint(jointDef);
	},
	
	getImage: function(){
		return this.imgs.getImage();
	},
	
	update: function(){
		if(this.shouldInteract){
			this.game.player.interact(this);
			this.shouldInteract = false;
		}
	},
	
	onTouch: function(other, contact, impulse){
		if(contact.GetManifold().m_pointCount == 0){
			return;		// Just a sanity check, should not get here.
		}

		var x = this.game.physEngine.understandTheContact(contact);
		if(other == this.game.player.physBody.GetBody())
			this.shouldInteract = true;
	}
});
