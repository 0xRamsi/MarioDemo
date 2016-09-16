/*
	This is the interface to the physics engine of the game. While Box2D is the
actual physics engine, all the entities in the game interact with this API and
not directly with the Box2D interface.

	The `update` method calls `this.world.Step()` which is when the physics
engine will advance for one cycle. This includes moving objects, detecting and
solving collisions and executing callbacks if collisions are detected.
Important: The Box2D manual states that while `world.Step()` is being excuted
(including callbacks), no changes may be made to the bodies. Namely, they may
not be created/destroied, no forces may be applied to the bodies. Instead a
flag may be used to execute this kind of actions before the next invocation
of `world.Step()`.
*/

PhysicsEngineClass = Class.create({
	b2Math: Box2D.Common.Math.b2Math,
	b2Vec2: Box2D.Common.Math.b2Vec2,
	b2AABB: Box2D.Collision.b2AABB,
	b2BodyDef: Box2D.Dynamics.b2BodyDef,
	b2Body: Box2D.Dynamics.b2Body,
	b2FixtureDef: Box2D.Dynamics.b2FixtureDef,
	b2Fixture: Box2D.Dynamics.b2Fixture,
	b2World: Box2D.Dynamics.b2World,
	b2MassData: Box2D.Collision.Shapes.b2MassData,
	b2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
	b2CircleShape: Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw: Box2D.Dynamics.b2DebugDraw,
	b2MouseJointDef: Box2D.Dynamics.Joints.b2MouseJointDef,
	b2Shape: Box2D.Collision.Shapes.b2Shape,
	b2ContactListener: Box2D.Dynamics.b2ContactListener,
	b2Manifold: Box2D.Collision.b2Manifold,
	// b2EdgeShape: Box2D.Collision.Shapes.b2EdgeShape
	world: null,
	
	initialize: function(gravity){
		this.world = new this.b2World(
			new this.b2Vec2(gravity.x, gravity.y),		//gravity
			true										//allow sleep
		);
	},
	
	setup: function(contactCallback){
		// Create contact callbacks.
		var listener = new this.b2ContactListener;
		listener.PostSolve = contactCallback;
		this.world.SetContactListener(listener);
	},
	
	update: function(){
		this.world.Step(1.0/60, 1);
		this.world.ClearForces();
	},
	
	drawDebug: function(){
		this.world.DrawDebugData();
	},
	
	createBox: function(aPos, aSize, aProperties){
		var factor = 0.5;
		var width = aSize.w*factor;
		var height = aSize.h*factor;
		
 		var bodyDef = new this.b2BodyDef();
		bodyDef.position.Set(aPos.x, aPos.y);
		var fixDef = new this.b2FixtureDef();
		fixDef.density = 0.01;
		fixDef.friction = 1;
		fixDef.restitution = 0.2;
        fixDef.shape = new this.b2PolygonShape;
        fixDef.shape.SetAsBox(width, height);
		
		if(aProperties.physics.fixed)
			bodyDef.type = this.b2Body.b2_staticBody;
		else{
			bodyDef.type = this.b2Body.b2_dynamicBody;
		}
		if(aProperties.physics.fixedRotation !== undefined)
			bodyDef.fixedRotation = aProperties.physics.fixedRotation;
		else
			bodyDef.fixedRotation = true;
		if(aProperties.userData)
			bodyDef.userData = aProperties.userData;
		if(aProperties.physics.groupIndex !== undefined)
			fixDef.filter.groupIndex = aProperties.physics.groupIndex;
		if(aProperties.physics.categoryBits !== undefined)
			fixDef.filter.categoryBits = aProperties.physics.categoryBits;
		if(aProperties.physics.maskBits !== undefined)
			fixDef.filter.maskBits = aProperties.physics.maskBits;
		if(aProperties.physics.density !== undefined)
			fixDef.density = aProperties.physics.density;
		
        return this.world.CreateBody(bodyDef).CreateFixture(fixDef);
	},
	
	removeBody: function(body){
		this.world.DestroyBody(body.GetBody());
	},
	
	getObjects: function(){
		var b = this.world.GetBodyList();
		var arr = [];
		while(b){
			arr.push(b);
			b = b.GetNext();
		}
		return arr;
	},
	
	understandTheContact: function(contact){
		var b1, b2, dir;
		var dirs = ['above', 'right to'];
		
		b1 = contact.GetFixtureA().GetBody();
		b2 = contact.GetFixtureB().GetBody();
		var normal = contact.GetManifold().m_localPlaneNormal;
		var rad = Math.atan2(normal.x, normal.y);
		rad = Math.abs(rad);
		if(Math.PI/4 > rad){
			dir = dirs[0];
		}else if(Math.PI*3/4 > rad){
			dir = dirs[1];
		}else{
			dir = dirs[0];
		}
		
		if(dir == dirs[0]){
			if(b1.GetPosition().y > b2.GetPosition().y){
				var t = b1;
				b1 = b2;
				b2 = t
			}
		}else{
			if(b1.GetPosition().x < b2.GetPosition().x){
				var t = b1;
				b1 = b2;
				b2 = t;
			}
		}
		
		return {b1, b2, dir};
	}
});
PhysicsEngineClass.drawScale = 25;