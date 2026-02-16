import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

export default function App() {
  const gameRef = useRef(null);
  const [ammo, setAmmo] = useState(5);

  useEffect(() => {
    let player;
    let keys;
    let enemies;
    let bullets;
    let canAttack = true;
    let currentAmmo = 5;
    let maxAmmo = 5;
    let isGameOver = false;

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
        "player_hit",
        "/assets/Main Characters/Virtual Guy/Hit (32x32).png",
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

      enemies = this.physics.add.group();

      const spawnEnemy = (scene) => {
        const enemy = enemies.create(width - 150, 100, "enemy_run");
        enemy.setCollideWorldBounds(true);
        enemy.setVelocityX(-150);
        enemy.setScale(2);
        enemy.setFlipX(true);
        enemy.anims.play("enemy_run", true);
      };

      spawnEnemy(this);

      bullets = this.physics.add.group();

      this.physics.add.collider(player, platforms);
      this.physics.add.collider(enemies, platforms);

      this.physics.add.overlap(player, enemies, () => {
        if (isGameOver) return;

        isGameOver = true;
        this.physics.pause();

        player.anims.play("hit", true);
        player.setTint(0xff0000);

        const gameOverText = this.add
          .text(width / 2, height / 2, "GAME OVER\n\nPress R to Restart", {
            fontSize: "48px",
            fill: "#fff",
            stroke: "#000",
            strokeThickness: 6,
            align: "center",
          })
          .setOrigin(0.5);

        const restartKey = this.input.keyboard.addKey("R");
        restartKey.on("down", () => {
          location.reload();
        });
      });

      this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
        bullet.destroy();
        enemy.destroy();

        this.time.delayedCall(3000, () => {
          spawnEnemy(this);
        });
      });

      player.anims.play("idle", true);

      keys = this.input.keyboard.addKeys({
        up: "W",
        left: "A",
        right: "D",
        attack: "F",
      });
    }

    function update() {
      if (isGameOver) return;

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

      if (keys.attack.isDown && canAttack && currentAmmo > 0) {
        canAttack = false;
        currentAmmo--;
        setAmmo(currentAmmo);

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
        }, 2000);

        setTimeout(() => {
          canAttack = true;
        }, 100);

        if (currentAmmo < maxAmmo) {
          setTimeout(() => {
            currentAmmo++;
            setAmmo(currentAmmo);
          }, 2000);
        }
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
      <div className="absolute top-6 left-6 z-10 select-none">
        <h1
          className="text-xl font-bold text-white mb-3"
          style={{ textShadow: "2px 2px 3px rgba(0,0,0,0.5)" }}
        >
          2D Platformer
        </h1>

        <div
          className="space-y-2 text-white text-xl"
          style={{ textShadow: "2px 2px 3px rgba(0,0,0,0.5)" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="text-2xl"
                  style={{
                    opacity: i < ammo ? 1 : 0.3,
                    filter: i < ammo ? "none" : "grayscale(100%)",
                  }}
                >
                  🍌
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1 font-semibold">
            <p>
              <kbd className="px-2 py-1 bg-white/20 rounded text-sm">A</kbd>{" "}
              <kbd className="px-2 py-1 bg-white/20 rounded text-sm">D</kbd>{" "}
              Move
            </p>
            <p>
              <kbd className="px-2 py-1 bg-white/20 rounded text-sm">W</kbd>{" "}
              Jump
            </p>
            <p>
              <kbd className="px-2 py-1 bg-white/20 rounded text-sm">F</kbd>{" "}
              Attack
            </p>
          </div>
        </div>
      </div>

      <div id="game-container" className="w-full h-full" />
    </div>
  );
}
