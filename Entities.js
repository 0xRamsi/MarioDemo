
EntityClass = Class.create({
	physBody: null,		// Will be a Box2D body object
	size: null,			// Will be of type: {w: 0, h: 0},
	zIndex: 99,
	game: null,
	img: null,
	
	initialize: function(aGame, anImage, aPos, aProperties){
		/*
		* 'props' should have all info related to the physics body flat, and
		all other data inside 'userData' sub-object.
		* 'aProperties' should have all info related to the physics body inside
		'physics', and all other data inside 'userData' sub-object.
		*/
		var props = {
			physics: {
				fixed: false
			},
			userData: {},
			other: {
				zIndex: 100
			}
		}
		gUtil.copyProperties(props, aProperties);
		props.userData['entity'] = this;
		this.size = props.physics.size;
		this.physBody = aGame.physEngine.createBox(aPos, this.size, props);
		
		if(aProperties){
			if(aProperties.rotation)
				this.physBody.GetBody().SetAngle(aProperties.rotation);
			if(aProperties.other && aProperties.other.zIndex)
				this.zIndex = aProperties.other.zIndex;
		}
		
		this.game = aGame;
		this.img = anImage;
	},
	
	rotateBy: function(radians){
		this.physBody.GetBody().SetAngle(this.physBody.GetBody().GetAngle()+radians);
	},
	
	getImage: function(){
		return this.img;
	},

	getPosition: function(){
		return this.physBody.GetBody().GetPosition();
	},
	
	getAngle: function(){
		return this.physBody.GetBody().GetAngle();
	},
	
	setAngle: function(radians){
		this.physBody.GetBody().SetAngle(radians);
	},
	
	die: function(){
		this.game.kill(this);
	},
	
	update: function(){},
	
	onTouch: function(){}
});

MovingImagesClass = Class.create({
	imgList: null,
	imgIndex: 0,
	counter: 0,
	numberOfSteps: 0,
	
	initialize: function(aImgList, aNumberOfSteps){
		this.imgList = aImgList;
		this.imgIndex = 0;
		this.numberOfSteps = aNumberOfSteps;
		this.counter = 0;
	},
	
	getImage: function(){
		this.counter = (this.counter + 1) % this.numberOfSteps;
		if(this.counter == 0){
			// this.counter = this.numberOfSteps;
			this.imgIndex = (this.imgIndex + 1) % this.imgList.length;
		}
		return this.imgList[this.imgIndex];
	}
});

CameraClass = Class.create({
	halfSize: null,
	pos: null,
	
	initialize: function(aProperties){
		var startPos;
		this.halfSize = {w: aProperties.viewSize.w/2, h: aProperties.viewSize.h/2};
		if(aProperties.StartPos)
			startPos = aProperties.StartPos;
		else{
			startPos = {x: aProperties.viewSize.w/2, y: aProperties.viewSize.h/2};
		}
		this.bounds = aProperties.Bounds;
		this.pos = startPos;
	}
});



InvisibleClass = Class.create({
	physBody: null,
	owner: null,
	
	initialize: function(aOwner, aPos){
		var pos = {x: aPos.x, y: aPos.y};		// Deep copy
		var size = {x:1,y:1};					// Random size
		var props = {
			physics: {
				fixed: true
			},
			userData: {
				name: 'invisiable'
			},
			other: {}
		};
		this.owner  = aOwner;
		this.physBody = aOwner.game.physEngine.createBox(pos, size, props);
	},
	
	destroy: function(){
		this.owner.game.physEngine.world.DestroyBody(this.physBody);
	}
});