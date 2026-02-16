export class MapLoader {
  constructor(scene) {
    this.scene = scene;
    this.mapData = null;
  }

  async loadMap(mapPath) {
    try {
      const response = await fetch(mapPath);
      this.mapData = await response.json();
      return this.mapData;
    } catch (error) {
      console.error("Error loading map:", error);
      return null;
    }
  }

  getWorldWidth(screenWidth) {
    return screenWidth * (this.mapData?.worldWidth || 1);
  }

  getPlayerSpawn() {
    return this.mapData?.player || { x: 100, y: 100 };
  }

  getGroundConfig() {
    return this.mapData?.ground || { type: "auto", bottomLayers: 4 };
  }

  getBoxes(screenWidth, groundLevel) {
    const boxes = this.mapData?.boxes || [];
    return boxes.map((box) => ({
      x: this.resolvePosition(box.x, screenWidth),
      y: box.y === "auto" ? groundLevel - 30 : box.y,
    }));
  }

  getEnemies(screenWidth) {
    const enemies = this.mapData?.enemies || [];
    return enemies.map((enemy) => ({
      x: this.resolvePosition(enemy.x, screenWidth),
      y: enemy.y,
      direction: enemy.direction || "left",
    }));
  }

  resolvePosition(value, screenWidth) {
    if (typeof value === "string") {
      if (value.includes("%")) {
        const percent = parseFloat(value) / 100;
        return screenWidth * percent * (this.mapData?.worldWidth || 1);
      } else if (value.includes("x")) {
        const multiplier = parseFloat(value);
        return screenWidth * multiplier;
      }
    }
    return value;
  }
}
