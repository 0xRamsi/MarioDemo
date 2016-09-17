/*
	This is what is being saved for an image object in the gCachedData hash.
For now only the 'frame' element is used.

img: img,
def: {
	"frame": {"x":0,"y":0,"w":458,"h":489},
	"rotated": false,
	"trimmed": false,
	"spriteSourceSize": {"x":0,"y":0,"w":458,"h":489},
	"sourceSize": {"w":458,"h":489},
	"pivot": {"x":0,"y":0}
},
*/

/*
	CPS (Continuation-passing Style) is used a lot here because it makes
the work with callbacks (and async functions) a lot more convienent, but
it needs some time to get your head around it.
https://en.wikipedia.org/wiki/Continuation-passing_style
*/

var gCachedData = [];
var gameLoop;

AssetLoader = {
	currentGame: null,
	
	downloaders: {
		// These are extentions assosiated with a method to download them.
		'.js': function(file, save, count){
			var c = function(response){
				save(file, response.currentTarget.responseText);
				count();
			}
			gUtil.xhrGet(file, c, 'text');
		},
		'.png': function(file, save, count){
			var c = function(res){
				var image = res.target;
				var x =  {
					img: image,
					def: {
						frame: {x: 0, y: 0, w: image.width, h: image.height},
						rotated: false
					}
				};
				save(file, x);
				count();
			};
			
			var i = new Image();
			i.onload = c
			i.onerror = function(e){console.log(e)}
			i.src = file;
		},
		'-sprite.png': function(file, save, count){
			// This is a sprite, download it and 
			// download the corrosponding JSON file.
			var x = {
				img: null,
				def: null
			}
			
			var enterImagesFromSprite = function(x){
				for(var imageName in x.def.frames){
					var xx = {
						img: x.img,
						def: x.def.frames[imageName]
					}
					save(imageName, xx);
				}
				count();
			}
			
			var cImage = function(res){
				x.img = res.target;
				if(x.def)
					enterImagesFromSprite(x);
			};
			var cJSON = function(res){
				x.def = JSON.parse(res.currentTarget.responseText);
				if(x.img)
					enterImagesFromSprite(x);
			}
			
			var i = new Image();
			i.onload = cImage;
			i.src = file;
			var dot = file.lastIndexOf('.');
			var jsonFile = file.substring(0, dot) + '.json';
			gUtil.xhrGet(jsonFile, cJSON, 'text');
		},
		'.wav': function(file, save, count){
			var c = function(response){
				var audio_context = null;
				try{
					audio_context = new (window.AudioContext || window.webkitAudioContext)();
				}catch(e){
					console.log('Not able to play sounds');
				}
				
				var x = {
					buffer: null,
					loaded: false
				};

				audio_context.decodeAudioData(
					response.currentTarget.response,
					function(buffer){
						x.buffer = buffer;
						x.loaded = true;
						save(file, x);
						count();
					}
				);
			}
			gUtil.xhrGet(file, c, 'arraybuffer');
		},
		'default': function(file, cont){
			console.log('We have no handler for this file:', file);
			cont();
		}
	},
	
	loadListOfElements: function(list, callback){
		if((!list) || list.length == 0){
			callback();
			return;
		}
		
		var loader = {
			elementsLeft: list.length,
			cb: callback
		};
	
		function saveDataToCache(filename, object){
			if((filename != undefined) && (object != undefined))
				gCachedData[filename] = object;
		}
		
		function countAsset(){
			--loader.elementsLeft;
			if(loader.elementsLeft == 0)
				loader.cb();
		}
		
		for(var i=0; i<list.length; i++){
			file = list[i]
			var extension;
			if(file.endsWith('-sprite.png')){
				extension = '-sprite.png';
			}else{
				var dot = file.lastIndexOf('.');
				extension = file.substring(dot);
			}
			if(this.downloaders[extension]){
				this.downloaders[extension](file, saveDataToCache, countAsset);
			}else{
				console.log('We have no handler for this file:', file);
			}
		}
	},

	loadLevel: function(i){
		if(this.currentGame){
			this.unloadLevel();
		}
		
		// The following things should happen in that order:
		// 1. Load the code
		// 2. Eval the code (with inner order defined in the json file)
		// 3. Load assets.
		// 4. Start the game.
		
		var LoadTheLevel = function(filename, cont){
			var c = (function(filename, cont){
				return SaveTheFileString(filename, cont);
			})(filename, cont);
			gUtil.xhrGet(filename, c, 'text');
		}
		
		var SaveTheFileString = function(filename, cont){
			return function(res){
				gCachedData[filename] = res.currentTarget.responseText;
				ParseTheLevelString(gCachedData[filename], cont);
			}
		}.bind(this);
		
		var ParseTheLevelString = function(str, cont){
			LoadCode(gUtil.parseLevelData(str), cont);
		}
		
		var LoadCode = function(json, cont){
			var c = (function(cont, levelStruct){
				return function(res){
					evalTheCode(levelStruct);
					LoadAssets(levelStruct.assets, cont);
				}
			})
			this.loadListOfElements(json.code, c(cont, json));
		}.bind(this);
		
		var evalTheCode = function(levelStruct){
			// Eval by order.
			for(var i=0; i<levelStruct.code.length; i++){
				eval(gCachedData[levelStruct.code[i]]);
			}
		}
		
		var LoadAssets = function(list, cont){
			this.loadListOfElements(list, cont);
		}.bind(this);
		
		var StartTheGame = function(levelSting){
			var levelStruct = gUtil.parseLevelData(levelSting);
			this.currentGame = new GameEngineClass(levelStruct.world);
			this.currentGame.setup(levelStruct.entities, levelStruct.world.camera);
			canvas.focus();
			gameLoop = setInterval(this.currentGame.update.bind(this.currentGame), 10);
		}.bind(this);

		var fileName = i + '.json';
		if(!gCachedData[fileName]){
			LoadTheLevel(fileName, function(){StartTheGame(gCachedData[fileName]);});
		}else{
			StartTheGame(gCachedData[fileName]);
		}
	},

	unloadLevel: function(){
		// TODO: Remove assets or not?
		clearInterval(gameLoop);
		this.currentGame.prepareGameEnd();
		gameLoop = null;
	}
};

var stop = AssetLoader.unloadLevel.bind(AssetLoader);	// Just a helper for debugging.