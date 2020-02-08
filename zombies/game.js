// Global variables that store game state 
let gameHero;
let gameShots;
let gameZombies;
let SPACEBAR = 32;
let BASEANGLE = 5;
let gameScore = 0;
let gameOver = false;
let zombieImg;
let heroImg;

function preload() {
  zombieImg = loadImage('zombie.png');
  heroImg = loadImage('hero.png');
  backGroundImg = loadImage('background.png');
}

// Side-effectful functions (Drawing on the canvas)

function drawBackground(background) {
  push();
  translate(windowWidth / 2, windowHeight / 2);
  image(background, 0, 0, windowWidth, windowHeight);
  pop();
}

function drawGameScore(score) {
  push();
  translate(windowWidth / 8, windowHeight / 2);
  fill(0xff);
  textSize(32);
  text(`Score: ${score}`, 0, 0.9 * windowHeight / 2);
  pop();
}

function gameOverEffects() {
  push();
  translate(windowWidth / 8, windowHeight / 2);
  fill(0xff);
  textSize(42);
  text('Game Over!', 0, 0.7 * windowHeight / 2);
  pop();
}

function drawHero(hero) {
  push();
  translate(windowWidth / 2, windowHeight / 2);
  noFill();
  line(0, 0, hero.x, hero.y);
  rotate(hero.heading() + PI / 2);
  image(heroImg, hero.x, hero.y, 50, 50);
  pop();
}

function drawZombie(zombie) {
  push();
  translate(windowWidth / 2, windowHeight / 2);
  translate(zombie.vector.x, zombie.vector.y);
  rotate(zombie.vector.heading() - PI / 2);
  image(zombieImg, 0, 0, 50, 50);
  pop();
}

function drawShot(shot) {
  push();
  translate(windowWidth / 2, windowHeight / 2);
  circle(shot.vector.x, shot.vector.y, shot.diameter);
  pop();
}

function drawZombies(zombies) {
  zombies.forEach(zombie => drawZombie(zombie));
}

function drawShots(shots) {
  shots.forEach(shot => drawShot(shot));
}

// Pure functions

function cleanDestroyedZombies(zombies) {
  return zombies.filter(zombie => !zombie.destroyed);
}

function countZombiesDestroyed(zombies) {
  return zombies.filter(zombie => zombie.destroyed).length;
}

function zombiesDestroyed(zombies, shots) {
  return zombies.map(zombie => zombieDestroyed(zombie, shots));
}

function zombieDestroyed(zombie, shots) {
  return {
    vector: zombie.vector,
    diameter: zombie.diameter,
    destroyed: shots.some(shot => collision(zombie, shot))
  };
}

function collision(zombie, shot) {
  let xInsideZombie = abs(zombie.vector.x - shot.vector.x) < zombie.diameter / 2;
  let yInsideZombie = abs(zombie.vector.y - shot.vector.y) < zombie.diameter / 2;
  return xInsideZombie && yInsideZombie;
}

function createShot(angle) {
  let vector = p5.Vector.fromAngle(angle, 5);
  return {
    vector,
    diameter: 5
  };
}

function spawnNewZombie(zombies, threshold) {
  if (zombies.length < threshold) {
    zombies.push(createZombie(distance = random(0.2 * windowHeight, 0.8 * windowHeight)));
  }
  return zombies;
}

function createZombie(distance) {
  let degreesAngle = random(360 / BASEANGLE, -360 / BASEANGLE) * BASEANGLE;
  let vector = p5.Vector.fromAngle(radians(degreesAngle), distance);
  return {
    vector,
    diameter: 35,
    destroyed: false
  };
}

function moveZombies(zombies) {
  return zombies.map(zombie => moveZombie(zombie));
}

function moveZombie(zombie) {
  let updatedVector = p5.Vector.fromAngle(zombie.vector.heading(),
    zombie.vector.mag() - 0.7);
  return {
    vector: updatedVector,
    diameter: zombie.diameter,
    destroyed: zombie.destroyed
  };
}


function moveShot(shot) {
  return {
    vector: p5.Vector.fromAngle(shot.vector.heading(), shot.vector.mag() + 2),
    diameter: shot.diameter
  };
}

function moveShots(shots) {
  return shots.map(shot => moveShot(shot));
}

function cleanShots(shots) {
  return shots.filter(shot => shot.vector.mag() < 300);
}

function gameIsOver(zombies) {
  return zombies.some(zombie => zombie.vector.mag() < 10);
}

// P5Js functions: initial setup, game loop and input polling

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  gameHero = p5.Vector.fromAngle(angle = 0, magnitude = 1);
  gameShots = [];
  gameZombies = [];
}

function draw() {
  gameShots = moveShots(gameShots);
  gameShots = cleanShots(gameShots);
  gameZombies = zombiesDestroyed(gameZombies, gameShots);
  gameScore += countZombiesDestroyed(gameZombies);
  gameZombies = cleanDestroyedZombies(gameZombies);
  gameZombies = spawnNewZombie(gameZombies, sqrt((gameScore + 1) / 2));
  gameZombies = moveZombies(gameZombies);

  if (keyIsDown(LEFT_ARROW)) {
    gameHero.rotate(radians(-BASEANGLE));
  } else if (keyIsDown(RIGHT_ARROW)) {
    gameHero.rotate(radians(BASEANGLE));
  }

  drawBackground(backGroundImg);
  drawHero(gameHero);
  drawZombies(gameZombies);
  drawShots(gameShots);
  drawGameScore(gameScore);

  if (gameIsOver(gameZombies)) {
    gameOverEffects();
    noLoop();
  }
}

function keyPressed() {
  if (keyCode === SPACEBAR) {
    newShot = createShot(gameHero.heading());
    gameShots.push(newShot);
  }
}
