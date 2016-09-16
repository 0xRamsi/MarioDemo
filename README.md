# MarioDemo

This is a simple JavaScript game, based on the classic Mario game. I built it while learning the Box2D physics engine.

General things to bear in mind while going through the code.

1. 'Box2D web' is being used as a physics engine. It means that stuff like gravity, collisions and movement are done by the physics engine, while the game logic only defines which objects can collide, or the direction and speed some object should move. The actual movement/application of force is done by the physics engine.
2. Each game cycle consists of:
 * update all the entities (and remove entities marked as dead)
 * call the physics engine, which will update the physical world.
3. The `update` method is called by the main game loop, which will make adjustments to the entity (kill it/apply force to it/etc.). The on `onTouch` is called by a callback which the physics engine is doing it's work and will indicate that 2 entities have collided.
4. A few design patterns and programming styles are being used. To really understand some of the code you may want to have an idea about:
 1. State pattern
  * https://en.wikipedia.org/wiki/State_pattern
  * https://sourcemaking.com/design_patterns/state
 2. Observer pattern
  * https://sourcemaking.com/design_patterns/observer
 3. Continuation-passing style
  * https://en.wikipedia.org/wiki/Continuation-passing_style
  