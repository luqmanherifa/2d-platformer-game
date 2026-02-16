import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function App() {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 500,
      parent: "game-container",
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

    let player;
    let cursors;
    let keys;
    let enemies;
    let canAttack = true;

    function preload() {
      this.load.image(
        "ground",
        "https://labs.phaser.io/assets/sprites/platform.png",
      );
      this.load.image("sky", "https://labs.phaser.io/assets/skies/sky4.png");
      this.load.image(
        "player",
        "https://labs.phaser.io/assets/sprites/phaser-dude.png",
      );
      this.load.image("enemy", "https://labs.phaser.io/assets/sprites/ufo.png");
    }

    function create() {
      this.add.image(400, 250, "sky");

      const platforms = this.physics.add.staticGroup();
      platforms.create(400, 490, "ground").setScale(2).refreshBody();

      player = this.physics.add.sprite(100, 300, "player");
      player.setCollideWorldBounds(true);
      player.setBounce(0.1);

      enemies = this.physics.add.group();
      const enemy = enemies.create(600, 300, "enemy");
      enemy.setCollideWorldBounds(true);
      enemy.setVelocityX(-100);

      this.physics.add.collider(player, platforms);
      this.physics.add.collider(enemies, platforms);

      this.physics.add.overlap(player, enemies, () => {
        console.log("Player hit!");
      });

      keys = this.input.keyboard.addKeys({
        up: "W",
        left: "A",
        right: "D",
        attack: "F",
      });
    }

    function update() {
      if (keys.left.isDown) {
        player.setVelocityX(-200);
      } else if (keys.right.isDown) {
        player.setVelocityX(200);
      } else {
        player.setVelocityX(0);
      }

      if (keys.up.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
      }

      if (keys.attack.isDown && canAttack) {
        canAttack = false;

        const attackZone = this.add.rectangle(
          player.x + 40,
          player.y,
          40,
          40,
          0xff0000,
          0.3,
        );

        this.physics.add.existing(attackZone);
        this.physics.add.overlap(attackZone, enemies, (zone, enemy) => {
          enemy.destroy();
        });

        setTimeout(() => {
          attackZone.destroy();
          canAttack = true;
        }, 200);
      }
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl font-bold mb-2">2D Platformer React + Phaser</h1>

      <div id="game-container" className="border-4 border-white" />

      <div className="mt-4 text-sm opacity-70 text-center">
        <p>Move: A / D</p>
        <p>Jump: W</p>
        <p>Attack: F</p>
      </div>
    </div>
  );
}
