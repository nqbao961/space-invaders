import Phaser from '../../lib/phaser.js';
import { BotFighterInputComponent } from '../../components/input/bot-fighter-input-component.js';
import { VerticalMovementComponent } from '../../components/movement/vertical-movement-component.js';
import * as CONFIG from '../../config.js';
import { WeaponComponent } from '../../components/weapon/weapon-component.js';

export class FighterEnemy extends Phaser.GameObjects.Container {
  #inputComponent;
  #weaponComponent;
  #verticalMovementComponent;
  #shipSprite;
  #shipEngineSprite;

  constructor(scene, x, y) {
    super(scene, x, y, []);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setSize(24, 24);
    this.body.setOffset(-12, -12);

    this.#shipSprite = this.scene.add.sprite(0, 0, 'fighter', 0);
    this.#shipEngineSprite = this.scene.add.sprite(0, 0, 'fighter_engine', 0).setFlipY(true);
    this.#shipEngineSprite.play('fighter_engine');
    this.add([this.#shipSprite, this.#shipEngineSprite]);

    this.#inputComponent = new BotFighterInputComponent();
    this.#verticalMovementComponent = new VerticalMovementComponent(
      this,
      this.#inputComponent,
      CONFIG.ENEMY_FIGHTER_MOVEMENT_VERTICAL_VELOCITY
    );
    this.#weaponComponent = new WeaponComponent(this, this.#inputComponent, {
      speed: CONFIG.ENEMY_FIGHTER_BULLET_SPEED,
      interval: CONFIG.ENEMY_FIGHTER_BULLET_INTERVAL,
      lifespan: CONFIG.ENEMY_FIGHTER_BULLET_LIFESPAN,
      maxCount: CONFIG.ENEMY_FIGHTER_BULLET_MAX_COUNT,
      yOffset: 10,
      flipY: true,
    });
  }

  update(ts, dt) {
    if (!this.active) {
      return;
    }

    this.#verticalMovementComponent.update();
    this.#weaponComponent.update(dt);
  }
}