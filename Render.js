/*
	The render class is resonsible to draw entities onto the canvas, and is the
only object that will access the canvas.
*/

RendererClass = Class.create({
	camera: null,
	physEngine: null,
	
	initialize: function(cameraProps, aPhysEngine){
		this.camera = new CameraClass(cameraProps);
		this.physEngine = aPhysEngine;
		
		try{
			if(sideMap){
				var debugDraw = new this.physEngine.b2DebugDraw();
				debugDraw.SetSprite(document.getElementById("canvasDebug").getContext("2d"));
				var drawRatio = PhysicsEngineClass.drawScale/(document.getElementById('canvas').height/document.getElementById('canvasDebug').height);
				debugDraw.SetDrawScale(drawRatio * 0.8);
				debugDraw.SetFillAlpha(0.6);
				debugDraw.SetLineThickness(1.0);
				debugDraw.SetFlags(this.physEngine.b2DebugDraw.e_shapeBit | this.physEngine.b2DebugDraw.e_jointBit);
				this.physEngine.world.SetDebugDraw(debugDraw);
			}else if(debug){
				var debugDraw = new this.physEngine.b2DebugDraw();
				debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
				debugDraw.SetDrawScale(PhysicsEngineClass.drawScale);
				debugDraw.SetFillAlpha(0.6);
				debugDraw.SetLineThickness(1.0);
				debugDraw.SetFlags(this.physEngine.b2DebugDraw.e_shapeBit | this.physEngine.b2DebugDraw.e_jointBit);
				this.physEngine.world.SetDebugDraw(debugDraw);
			}
		}catch(e){}
		
	},
	
	requestCameraPos: function(x, y){
		if(isNaN(x) || x == undefined){
			16('The players position is not valid:', x);
			return;		// Leave the camera unchanged.
		}
		
		this.camera.pos.x = Math.max(
			this.camera.halfSize.w,
			Math.min(this.camera.bounds.endX, x)
		);
	},
	getCameraPos: function(){
		return {x: this.camera.pos.x, y:this.camera.pos.y};
	},
	
	draw: function(entities){
		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');
		// Clear the canvas.
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle  = "#000000";
		
		if(debug || sideMap)
			this.physEngine.drawDebug();
		
		// Order by z-index
		var zIndexArrays = {};
		for(var i = 0; i < entities.length; i++){
			var object = entities[i];
			if(! (object.zIndex in zIndexArrays)){
				zIndexArrays[object.zIndex] = [];
			}
			zIndexArrays[object.zIndex].push(object);
		}
		
		// Draw
		var keys = Object.keys(zIndexArrays);
		keys.sort(function(a,b){return a-b;});
		for(var i = 0; i < keys.length; i++){
			var zIndex = keys[i];
			for(var j = 0; j < zIndexArrays[zIndex].length; j++){
				var object = zIndexArrays[zIndex][j];
				// Draw a rotated image.
				ctx.save();
				var pos = object.getPosition();
				ctx.translate((pos.x - this.camera.pos.x + this.camera.halfSize.w) * PhysicsEngineClass.drawScale, pos.y * PhysicsEngineClass.drawScale);
				ctx.rotate(object.getAngle());
				try{
					var img = object.getImage();
					if(object.facing){
						ctx.scale(object.facing, 1);
					}
					ctx.drawImage(
						img.img,
						img.def.frame.x,
						img.def.frame.y,
						img.def.frame.w,
						img.def.frame.h,
						-object.size.w / 2 * PhysicsEngineClass.drawScale,
						-object.size.h / 2 * PhysicsEngineClass.drawScale,
						object.size.w * PhysicsEngineClass.drawScale,
						object.size.h * PhysicsEngineClass.drawScale
					);
				}catch(e){
					// Fail safe if the image was not found
					// Just draw a rectangle at the position
					if(object.size)
						ctx.fillRect(
							-object.size.w * PhysicsEngineClass.drawScale/2,
							-object.size.h * PhysicsEngineClass.drawScale/2,
							object.size.w * PhysicsEngineClass.drawScale,
							object.size.h * PhysicsEngineClass.drawScale
						);
					else
						ctx.fillRect(-5,-5,10,10);
				}
				ctx.restore();
			}
		}
	},
	
	addText: function(text){
		var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');
		ctx.fillStyle  = "#FFAA00";
		ctx.textAlign = "center";
		ctx.font = "120px Courier";
		ctx.fillText(text, 600, 400);
	}
});