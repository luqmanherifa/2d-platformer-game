export const ASSETS = {
  BACKGROUND: "/assets/Background/Brown.png",
  TERRAIN_TOP: "/assets/Terrain/Terrain-2.png",
  TERRAIN_BOTTOM: "/assets/Terrain/Terrain-3.png",
  PLAYER_IDLE: "/assets/Main Characters/Virtual Guy/Idle (32x32).png",
  PLAYER_RUN: "/assets/Main Characters/Virtual Guy/Run (32x32).png",
  PLAYER_JUMP: "/assets/Main Characters/Virtual Guy/Jump (32x32).png",
  PLAYER_FALL: "/assets/Main Characters/Virtual Guy/Fall (32x32).png",
  PLAYER_HIT: "/assets/Main Characters/Virtual Guy/Hit (32x32).png",
  ENEMY_RUN: "/assets/Main Characters/Mask Dude/Run (32x32).png",
  BANANA: "/assets/Items/Fruits/Bananas.png",
  BOX_IDLE: "/assets/Items/Boxes/Box1/Idle.png",
};

export const SPRITE_SIZES = {
  PLAYER: { width: 32, height: 32 },
  ENEMY: { width: 32, height: 32 },
  BANANA: { width: 32, height: 32 },
  BOX: { width: 28, height: 24 },
  BACKGROUND: 64,
  TERRAIN_TOP: { width: 44, height: 46 },
  TERRAIN_BOTTOM: { width: 44, height: 20 },
};

export const GAME_SETTINGS = {
  PLAYER_SPEED: 220,
  PLAYER_JUMP: -450,
  PLAYER_SCALE: 2,
  ENEMY_SPEED: 150,
  ENEMY_SCALE: 2,
  BULLET_SPEED: 400,
  BULLET_SCALE: 1.5,
  BULLET_LIFETIME: 2000,
  BOX_SCALE: 2.5,
  MAX_AMMO: 5,
  AMMO_RECHARGE_TIME: 2000,
  ATTACK_COOLDOWN: 100,
  ENEMY_RESPAWN_TIME: 3000,
  GRAVITY: 800,
};

export const MOBILE_SETTINGS = {
  BOTTOM_LAYERS_MOBILE: 1,
  BOTTOM_LAYERS_DESKTOP: 4,
};
