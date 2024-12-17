import Phaser from '../../lib/phaser.js';
import { InputComponent } from './input-component.js';
import * as CONFIG from '../../config.js';

/**
 * A custom `InputComponent` that is used for the `Scout` enemy
 * type. This class is responsible for building out the simple AI
 * that will be used for moving the enemy game object in the game.
 *
 * For the `Scout` enemy, the enemy will move in a wave pattern
 * by moving left and right across the screen. This enemy does
 * not fire their weapon.
 */
export class BotScoutInputComponent extends InputComponent {
  /** @type {Phaser.GameObjects.Container} */
  #gameObject;
  /**
   * The starting position of the Phaser 3 game object when it spawns in the game. Used in
   * calculating how far an enemy can move left and right before switching directions.
   * @type {number}
   */
  #startY;
  /**
   * How far the enemy will move vertically across the screen before moving in the other direction.
   * @type {number}
   */
  #maxYMovement;

  /**
   * @param {Phaser.GameObjects.Container} gameObject
   */
  constructor(gameObject) {
    super();
    this.#gameObject = gameObject;
    this.#startY = this.#gameObject.y;
    this.#maxYMovement = CONFIG.ENEMY_SCOUT_MOVEMENT_MAX_Y;
    this._down = false;
    this._left = true;
    this._up = true;
  }

  /**
   * Used for resetting the default starting X position of the Phaser 3 game object since
   * we reuse the same Game Objects in our game.
   * @param {number} val
   * @returns {void}
   */
  set startY(val) {
    this.#startY = val;
  }

  /**
   * Creates a simple AI movement pattern of moving left and right across the screen
   * automatically.
   * @returns {void}
   */
  update() {
    if (this.#gameObject.y > this.#startY + this.#maxYMovement) {
      this._down = false;
      this._up = true;
    } else if (this.#gameObject.y < this.#startY - this.#maxYMovement) {
      this._down = true;
      this.up = false;
    }
  }
}
