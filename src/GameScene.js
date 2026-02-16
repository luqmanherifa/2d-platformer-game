import Phaser from "phaser";
import {
  ASSETS,
  SPRITE_SIZES,
  GAME_SETTINGS,
  MOBILE_SETTINGS,
} from "./constants";
import { MapLoader } from "./utils/MapLoader";

export class GameScene extends Phaser.Scene {
  constructor(setAmmo, handleRestart, mobileControls) {
    super({ key: "GameScene" });
    this.setAmmo = setAmmo;
    this.handleRestart = handleRestart;
    this.mobileControls = mobileControls;
    this.mapLoader = new MapLoader(this);
  }

  init() {
    this.player = null;
    this.keys = null;
    this.enemies = null;
    this.bullets = null;
    this.boxes = null;
    this.canAttack = true;
    this.currentAmmo = GAME_SETTINGS.MAX_AMMO;
    this.maxAmmo = GAME_SETTINGS.MAX_AMMO;
    this.isGameOver = false;
    this.mapData = null;
  }

  preload() {
    this.load.json("map", "/maps/level1.json");

    this.load.image("background", ASSETS.BACKGROUND);
    this.load.image("terrain_top", ASSETS.TERRAIN_TOP);
    this.load.image("terrain_bottom", ASSETS.TERRAIN_BOTTOM);

    this.load.spritesheet("player_idle", ASSETS.PLAYER_IDLE, {
      frameWidth: SPRITE_SIZES.PLAYER.width,
      frameHeight: SPRITE_SIZES.PLAYER.height,
    });

    this.load.spritesheet("player_run", ASSETS.PLAYER_RUN, {
      frameWidth: SPRITE_SIZES.PLAYER.width,
      frameHeight: SPRITE_SIZES.PLAYER.height,
    });

    this.load.spritesheet("player_jump", ASSETS.PLAYER_JUMP, {
      frameWidth: SPRITE_SIZES.PLAYER.width,
      frameHeight: SPRITE_SIZES.PLAYER.height,
    });

    this.load.spritesheet("player_fall", ASSETS.PLAYER_FALL, {
      frameWidth: SPRITE_SIZES.PLAYER.width,
      frameHeight: SPRITE_SIZES.PLAYER.height,
    });

    this.load.spritesheet("player_hit", ASSETS.PLAYER_HIT, {
      frameWidth: SPRITE_SIZES.PLAYER.width,
      frameHeight: SPRITE_SIZES.PLAYER.height,
    });

    this.load.spritesheet("enemy_run", ASSETS.ENEMY_RUN, {
      frameWidth: SPRITE_SIZES.ENEMY.width,
      frameHeight: SPRITE_SIZES.ENEMY.height,
    });

    this.load.spritesheet("banana", ASSETS.BANANA, {
      frameWidth: SPRITE_SIZES.BANANA.width,
      frameHeight: SPRITE_SIZES.BANANA.height,
    });

    this.load.spritesheet("box_idle", ASSETS.BOX_IDLE, {
      frameWidth: SPRITE_SIZES.BOX.width,
      frameHeight: SPRITE_SIZES.BOX.height,
    });
  }

  create() {
    this.mapData = this.cache.json.get("map");
    this.mapLoader.mapData = this.mapData;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const worldWidth = this.mapLoader.getWorldWidth(width);
    this.physics.world.setBounds(0, 0, worldWidth, height);

    const bgSize = SPRITE_SIZES.BACKGROUND;
    const tilesX = Math.ceil(worldWidth / bgSize) + 1;
    const tilesY = Math.ceil(height / bgSize) + 1;

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        this.add.image(x * bgSize, y * bgSize, "background").setOrigin(0, 0);
      }
    }

    const groundConfig = this.mapLoader.getGroundConfig();
    const platforms = this.physics.add.staticGroup();

    const topBlockWidth = SPRITE_SIZES.TERRAIN_TOP.width;
    const topBlockHeight = SPRITE_SIZES.TERRAIN_TOP.height;
    const bottomBlockWidth = SPRITE_SIZES.TERRAIN_BOTTOM.width;
    const bottomBlockHeight = SPRITE_SIZES.TERRAIN_BOTTOM.height;

    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(
      navigator.userAgent,
    );

    const bottomLayers =
      groundConfig.bottomLayers ||
      (isMobileDevice
        ? MOBILE_SETTINGS.BOTTOM_LAYERS_MOBILE
        : MOBILE_SETTINGS.BOTTOM_LAYERS_DESKTOP);

    const groundLevel =
      height - topBlockHeight - bottomBlockHeight * bottomLayers;
    const blocksNeeded = Math.ceil(worldWidth / topBlockWidth) + 1;

    for (let i = 0; i < blocksNeeded; i++) {
      const topBlock = platforms.create(
        i * topBlockWidth + topBlockWidth / 2,
        groundLevel + topBlockHeight / 2,
        "terrain_top",
      );
      topBlock.refreshBody();
    }

    for (let layer = 0; layer < bottomLayers; layer++) {
      for (let i = 0; i < blocksNeeded; i++) {
        const bottomBlock = platforms.create(
          i * bottomBlockWidth + bottomBlockWidth / 2,
          groundLevel +
            topBlockHeight +
            layer * bottomBlockHeight +
            bottomBlockHeight / 2,
          "terrain_bottom",
        );
        bottomBlock.refreshBody();
      }
    }

    this.boxes = this.physics.add.staticGroup();
    const boxPositions = this.mapLoader.getBoxes(width, groundLevel);

    this.anims.create({
      key: "box_idle",
      frames: this.anims.generateFrameNumbers("box_idle", {
        start: 0,
        end: 0,
      }),
      frameRate: 10,
      repeat: -1,
    });

    boxPositions.forEach((boxPos) => {
      const box = this.boxes.create(boxPos.x, boxPos.y, "box_idle");
      box.setScale(GAME_SETTINGS.BOX_SCALE);
      box.refreshBody();
    });

    const playerSpawn = this.mapLoader.getPlayerSpawn();
    this.player = this.physics.add.sprite(
      playerSpawn.x,
      playerSpawn.y,
      "player_idle",
    );
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(GAME_SETTINGS.PLAYER_SCALE);

    this.cameras.main.setBounds(0, 0, worldWidth, height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.anims.create({
      key: "banana_spin",
      frames: this.anims.generateFrameNumbers("banana", {
        start: 0,
        end: 16,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player_idle", {
        start: 0,
        end: 10,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("player_run", {
        start: 0,
        end: 11,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("player_jump", {
        start: 0,
        end: 0,
      }),
      frameRate: 10,
    });

    this.anims.create({
      key: "fall",
      frames: this.anims.generateFrameNumbers("player_fall", {
        start: 0,
        end: 0,
      }),
      frameRate: 10,
    });

    this.anims.create({
      key: "hit",
      frames: this.anims.generateFrameNumbers("player_hit", {
        start: 0,
        end: 6,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: "enemy_run",
      frames: this.anims.generateFrameNumbers("enemy_run", {
        start: 0,
        end: 11,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.enemies = this.physics.add.group();
    const enemySpawns = this.mapLoader.getEnemies(width);

    enemySpawns.forEach((enemyData) => {
      this.spawnEnemyAt(enemyData.x, enemyData.y, enemyData.direction);
    });

    this.bullets = this.physics.add.group();

    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemies, platforms);
    this.physics.add.collider(this.player, this.boxes);
    this.physics.add.collider(this.enemies, this.boxes);
    this.physics.add.collider(this.bullets, this.boxes, (bullet) => {
      bullet.destroy();
    });

    this.physics.add.overlap(this.player, this.enemies, () => {
      if (this.isGameOver) return;

      this.isGameOver = true;
      this.physics.pause();

      this.player.anims.play("hit", true);
      this.player.setTint(0xff0000);

      const gameOverText = this.add
        .text(
          this.player.x,
          this.player.y - 100,
          "GAME OVER\n\nPress R to Restart",
          {
            fontSize: "32px",
            fill: "#fff",
            stroke: "#000",
            strokeThickness: 4,
            align: "center",
          },
        )
        .setOrigin(0.5)
        .setScrollFactor(1);

      const restartKey = this.input.keyboard.addKey("R");
      restartKey.on("down", () => {
        this.handleRestart();
      });
    });

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      enemy.destroy();

      this.time.delayedCall(GAME_SETTINGS.ENEMY_RESPAWN_TIME, () => {
        const enemySpawns = this.mapLoader.getEnemies(width);
        if (enemySpawns.length > 0) {
          const randomSpawn =
            enemySpawns[Math.floor(Math.random() * enemySpawns.length)];
          this.spawnEnemyAt(
            randomSpawn.x,
            randomSpawn.y,
            randomSpawn.direction,
          );
        }
      });
    });

    this.player.anims.play("idle", true);

    this.keys = this.input.keyboard.addKeys({
      up: "W",
      left: "A",
      right: "D",
      attack: "F",
    });
  }

  spawnEnemyAt(x, y, direction) {
    const enemy = this.enemies.create(x, y, "enemy_run");
    enemy.setCollideWorldBounds(true);
    const speed =
      direction === "left"
        ? -GAME_SETTINGS.ENEMY_SPEED
        : GAME_SETTINGS.ENEMY_SPEED;
    enemy.setVelocityX(speed);
    enemy.setScale(GAME_SETTINGS.ENEMY_SCALE);
    enemy.setFlipX(direction === "left");
    enemy.anims.play("enemy_run", true);
  }

  update() {
    if (this.isGameOver) return;

    const speed = GAME_SETTINGS.PLAYER_SPEED;

    if (this.keys.left.isDown || this.mobileControls.left) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
      if (this.player.body.touching.down) {
        this.player.anims.play("run", true);
      }
    } else if (this.keys.right.isDown || this.mobileControls.right) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
      if (this.player.body.touching.down) {
        this.player.anims.play("run", true);
      }
    } else {
      this.player.setVelocityX(0);
      if (this.player.body.touching.down) {
        this.player.anims.play("idle", true);
      }
    }

    if (
      (this.keys.up.isDown || this.mobileControls.jump) &&
      this.player.body.touching.down
    ) {
      this.player.setVelocityY(GAME_SETTINGS.PLAYER_JUMP);
    }

    if (!this.player.body.touching.down) {
      if (this.player.body.velocity.y < 0) {
        this.player.anims.play("jump", true);
      } else {
        this.player.anims.play("fall", true);
      }
    }

    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.body.blocked.left) {
        enemy.setVelocityX(GAME_SETTINGS.ENEMY_SPEED);
        enemy.setFlipX(false);
      } else if (enemy.body.blocked.right) {
        enemy.setVelocityX(-GAME_SETTINGS.ENEMY_SPEED);
        enemy.setFlipX(true);
      }
    });

    if (
      (this.keys.attack.isDown || this.mobileControls.attack) &&
      this.canAttack &&
      this.currentAmmo > 0
    ) {
      this.canAttack = false;
      this.currentAmmo--;
      this.setAmmo(this.currentAmmo);

      const bullet = this.bullets.create(
        this.player.x,
        this.player.y,
        "banana",
      );
      bullet.setScale(GAME_SETTINGS.BULLET_SCALE);
      bullet.anims.play("banana_spin", true);
      bullet.body.setAllowGravity(false);

      const direction = this.player.flipX ? -1 : 1;
      bullet.setVelocityX(direction * GAME_SETTINGS.BULLET_SPEED);

      setTimeout(() => {
        if (bullet && bullet.active) {
          bullet.destroy();
        }
      }, GAME_SETTINGS.BULLET_LIFETIME);

      setTimeout(() => {
        this.canAttack = true;
      }, GAME_SETTINGS.ATTACK_COOLDOWN);

      if (this.currentAmmo < this.maxAmmo) {
        setTimeout(() => {
          this.currentAmmo++;
          this.setAmmo(this.currentAmmo);
        }, GAME_SETTINGS.AMMO_RECHARGE_TIME);
      }
    }
  }
}
