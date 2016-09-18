# MarioDemo

This is a simple JavaScript game, based on the classic Mario game. I built it while learning the Box2D physics engine.

### Running the game localy
To run the game localy you probably need to setup a local server to avoid all wired 'Cross origin requests' errors. One easy way to get it running is installing NodeJS and following these steps:

1. Open terminal and navigate to the directory where the game is.
2. Run `node server.js`.
3. Open your browser, and go to `127.0.0.1:3000`.

###Changes
The game was designed to be data driven, so non-programmers could design a level. To change the level layout and play with the different posibilties, please open the `mario.json` file. Under 'entities' you will find all objects that are in the game.


### About the code
General things to bear in mind while going through the code.

1. 'Box2D web' is being used as a physics engine. It means that stuff like gravity, collisions and movement are done by the physics engine, while the game logic only defines which objects can collide, or the direction and speed some object should move. The actual movement/application of force is done by the physics engine.
2. Each game cycle consists of:
 * Update all the entities (and remove entities marked as dead)
 * Call the physics engine, which will update the physical world.
 * Render the scene.
3. The `update` method of each entity is called by the main game loop, which will make adjustments to the entity (kill it/apply force to it/etc.). The on `onTouch` is called by a callback while the physics engine is doing it's work and will indicate that 2 entities have collided.
4. A few design patterns and programming styles are being used. To really understand some of the code you may want to have an idea about:
 1. State pattern
   * https://en.wikipedia.org/wiki/State_pattern
    * https://sourcemaking.com/design_patterns/state
 2. Observer pattern
   * https://sourcemaking.com/design_patterns/observer
 3. Continuation-passing style
   * https://en.wikipedia.org/wiki/Continuation-passing_style
