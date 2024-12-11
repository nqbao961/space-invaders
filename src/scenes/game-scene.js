import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component.js';
import Phaser from '../lib/phaser.js';
import { FighterEnemy } from '../objects/enemies/fighter-enemy.js';
import { ScoutEnemy } from '../objects/enemies/scout-enemy.js';
import { Player } from '../objects/player.js';
import * as CONFIG from '../config.js';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component.js';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component.js';
import { Score } from '../objects/ui/score.js';
import { Lives } from '../objects/ui/lives.js';
import { AudioManager } from '../objects/audio-manager.js';

/**
 * Core Phaser 3 Scene that has the actual game play of our Space Shooter Game.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  /**
   * Creates all of the required game objects for our scene and sets up the required
   * collision checks using the built in Phaser 3 Arcade Physics.
   * @returns {void}
   */
  create() {
    // backgrounds
    this.bg1 = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg1').setOrigin(0, 0).setAlpha(0.7);
    this.bg2 = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg2').setOrigin(0, 0).setAlpha(0.7);
    this.bg3 = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'bg3').setOrigin(0, 0).setAlpha(0.7);

    // Example: Animate the backgrounds if needed
    this.time.addEvent({
      delay: 16, // 60 FPS
      callback: () => {
        this.bg1.tilePositionX += 0.5; // Adjust speed as needed
        this.bg2.tilePositionX += 0.3;
        this.bg3.tilePositionX += 0.1;
      },
      loop: true,
    });
    // common components
    const eventBusComponent = new EventBusComponent();

    // spawn player
    const player = new Player(this, eventBusComponent);

    // spawn enemies
    const scoutSpawner = new EnemySpawnerComponent(
      this,
      ScoutEnemy,
      {
        interval: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_SCOUT_GROUP_SPAWN_START,
      },
      eventBusComponent
    );
    const fighterSpawner = new EnemySpawnerComponent(
      this,
      FighterEnemy,
      {
        interval: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_INTERVAL,
        spawnAt: CONFIG.ENEMY_FIGHTER_GROUP_SPAWN_START,
      },
      eventBusComponent
    );
    new EnemyDestroyedComponent(this, eventBusComponent);

    // collisions for player and enemy groups
    this.physics.add.overlap(
      player,
      scoutSpawner.phaserGroup,
      (/** @type {Player}*/ playerGameObject, /** @type {ScoutEnemy}*/ enemyGameObject) => {
        if (!enemyGameObject.active || !playerGameObject.active) {
          return;
        }
        playerGameObject.colliderComponent.collideWithEnemyShip();
        enemyGameObject.colliderComponent.collideWithEnemyShip();
      }
    );
    this.physics.add.overlap(
      player,
      fighterSpawner.phaserGroup,
      (/** @type {Player}*/ playerGameObject, /** @type {FighterEnemy}*/ enemyGameObject) => {
        if (!enemyGameObject.active || !playerGameObject.active) {
          return;
        }
        playerGameObject.colliderComponent.collideWithEnemyShip();
        enemyGameObject.colliderComponent.collideWithEnemyShip();
      }
    );
    eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (gameObject) => {
      // if name is an enemy from pool, add collision check for weapon group if needed
      if (gameObject.constructor.name !== 'FighterEnemy') {
        return;
      }

      this.physics.add.overlap(
        player,
        gameObject.weaponGameObjectGroup,
        (
          /** @type {Player}*/ playerGameObject,
          /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody}*/ projectileGameObject
        ) => {
          if (!playerGameObject.active) {
            return;
          }

          gameObject.weaponComponent.destroyBullet(projectileGameObject);
          playerGameObject.colliderComponent.collideWithEnemyProjectile();
        }
      );
    });

    // collisions for player weapons and enemy groups
    this.physics.add.overlap(
      player.weaponGameObjectGroup,
      scoutSpawner.phaserGroup,
      (
        /** @type {ScoutEnemy}*/ enemyGameObject,
        /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody}*/ projectileGameObject
      ) => {
        if (!enemyGameObject.active) {
          return;
        }
        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      }
    );
    this.physics.add.overlap(
      player.weaponGameObjectGroup,
      fighterSpawner.phaserGroup,
      (
        /** @type {FighterEnemy}*/ enemyGameObject,
        /** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody}*/ projectileGameObject
      ) => {
        if (!enemyGameObject.active) {
          return;
        }
        player.weaponComponent.destroyBullet(projectileGameObject);
        enemyGameObject.colliderComponent.collideWithEnemyProjectile();
      }
    );

    // ui
    new Score(this, eventBusComponent);
    new Lives(this, eventBusComponent);

    // audio
    new AudioManager(this, eventBusComponent);
  }
}
