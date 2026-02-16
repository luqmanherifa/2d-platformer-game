import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function App() {
  const gameRef = useRef(null);

  useEffect(() => {
    let player;
    let keys;
    let enemies;
    let bullets;
    let canAttack = true;

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "game-container",
      transparent: true,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 800 },
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    function preload() {
      this.load.image("background", "/assets/Background/Brown.png");

      this.load.image("terrain_top", "/assets/Terrain/Terrain-2.png");

      this.load.image("terrain_bottom", "/assets/Terrain/Terrain-3.png");

      this.load.spritesheet(
        "player_idle",
        "/assets/Main Characters/Virtual Guy/Idle (32x32).png",
        { frameWidth: 32, frameHeight: 32 },
      );

      this.load.spritesheet(
        "player_run",
        "/assets/Main Characters/Virtual Guy/Run (32x32).png",
        { frameWidth: 32, frameHeight: 32 },
      );

      this.load.spritesheet(
        "player_jump",
        "/assets/Main Characters/Virtual Guy/Jump (32x32).png",
        { frameWidth: 32, frameHeight: 32 },
      );

      this.load.spritesheet(
        "player_fall",
        "/assets/Main Characters/Virtual Guy/Fall (32x32).png",
        { frameWidth: 32, frameHeight: 32 },
      );

      this.load.spritesheet(
        "enemy_run",
        "/assets/Main Characters/Mask Dude/Run (32x32).png",
        { frameWidth: 32, frameHeight: 32 },
      );

      this.load.spritesheet("banana", "/assets/Items/Fruits/Bananas.png", {
        frameWidth: 32,
        frameHeight: 32,
      });
    }

    function create() {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      const bgSize = 64;
      const tilesX = Math.ceil(width / bgSize) + 1;
      const tilesY = Math.ceil(height / bgSize) + 1;

      for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
          this.add.image(x * bgSize, y * bgSize, "background").setOrigin(0, 0);
        }
      }

      const platforms = this.physics.add.staticGroup();

      const topBlockWidth = 44;
      const topBlockHeight = 46;
      const bottomBlockWidth = 44;
      const bottomBlockHeight = 20;

      const groundLevel = height - topBlockHeight - bottomBlockHeight * 4;
      const blocksNeeded = Math.ceil(width / topBlockWidth) + 1;

      for (let i = 0; i < blocksNeeded; i++) {
        const topBlock = platforms.create(
          i * topBlockWidth + topBlockWidth / 2,
          groundLevel + topBlockHeight / 2,
          "terrain_top",
        );
        topBlock.refreshBody();
      }

      for (let layer = 0; layer < 4; layer++) {
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

      player = this.physics.add.sprite(100, 300, "player_idle");
      player.setBounce(0.1);
      player.setCollideWorldBounds(true);
      player.setScale(2);

      enemies = this.physics.add.group();
      const enemy = enemies.create(600, 100, "enemy_run");
      enemy.setCollideWorldBounds(true);
      enemy.setVelocityX(-150);
      enemy.setScale(2);
      enemy.setFlipX(true);

      bullets = this.physics.add.group();

      this.physics.add.collider(player, platforms);
      this.physics.add.collider(enemies, platforms);

      this.physics.add.overlap(player, enemies, () => {
        console.log("Player hit!");
      });

      this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
        bullet.destroy();
        enemy.destroy();
      });

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
        key: "enemy_run",
        frames: this.anims.generateFrameNumbers("enemy_run", {
          start: 0,
          end: 11,
        }),
        frameRate: 12,
        repeat: -1,
      });

      player.anims.play("idle", true);
      enemy.anims.play("enemy_run", true);

      keys = this.input.keyboard.addKeys({
        up: "W",
        left: "A",
        right: "D",
        attack: "F",
      });
    }

    function update() {
      const speed = 220;

      if (keys.left.isDown) {
        player.setVelocityX(-speed);
        player.setFlipX(true);
        if (player.body.touching.down) {
          player.anims.play("run", true);
        }
      } else if (keys.right.isDown) {
        player.setVelocityX(speed);
        player.setFlipX(false);
        if (player.body.touching.down) {
          player.anims.play("run", true);
        }
      } else {
        player.setVelocityX(0);
        if (player.body.touching.down) {
          player.anims.play("idle", true);
        }
      }

      if (keys.up.isDown && player.body.touching.down) {
        player.setVelocityY(-450);
      }

      if (!player.body.touching.down) {
        if (player.body.velocity.y < 0) {
          player.anims.play("jump", true);
        } else {
          player.anims.play("fall", true);
        }
      }

      enemies.children.entries.forEach((enemy) => {
        if (enemy.body.blocked.left) {
          enemy.setVelocityX(150);
          enemy.setFlipX(false);
        } else if (enemy.body.blocked.right) {
          enemy.setVelocityX(-150);
          enemy.setFlipX(true);
        }
      });

      if (keys.attack.isDown && canAttack) {
        canAttack = false;

        const bullet = bullets.create(player.x, player.y, "banana");
        bullet.setScale(1.5);
        bullet.anims.play("banana_spin", true);
        bullet.body.setAllowGravity(false);

        const direction = player.flipX ? -1 : 1;
        bullet.setVelocityX(direction * 400);

        setTimeout(() => {
          if (bullet && bullet.active) {
            bullet.destroy();
          }
          canAttack = true;
        }, 2000);
      }
    }

    const handleResize = () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      game.destroy(true);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-white/90 rounded-lg p-3 shadow-lg">
        <h1 className="text-xl font-bold mb-2">2D Platformer</h1>

        <div className="text-sm space-y-1">
          <p>
            <strong>A / D</strong> - Move
          </p>
          <p>
            <strong>W</strong> - Jump
          </p>
          <p>
            <strong>F</strong> - Attack
          </p>
        </div>
      </div>

      <div id="game-container" className="w-full h-full" />
    </div>
  );
}
