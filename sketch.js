/**
 * 3D RACER: INSANE MODE (Standalone Keyboard Version)
 */

let player;
let traffic = [];
let roadOffset = 0;
let currentSpeed = 0;
let isGameOver = false;
let hud; 

// Score Mechanics
let score = 0;
let highScore = 0;

const MAX_SPEED = 95; 
const ACCEL = 0.5;
const FRICTION = 0.12;
const LANE_WIDTH = 160; 

function setup() {
  // Sets the game size and attaches it to your portfolio's div
  let canvas = createCanvas(800, 600, WEBGL);
  canvas.parent('canvas-container'); 
  
  hud = createGraphics(800, 600);
  resetGame();
}

// Window resizing for the canvas
function windowResized() {
  // Optional: keep fixed or let it scale
  // resizeCanvas(800, 600);
}

function resetGame() {
  player = new Player();
  traffic = [];
  score = 0;
  
  // Initial spawn exactly as before
  for (let i = 0; i < 12; i++) {
    let laneX = random([-LANE_WIDTH, 0, LANE_WIDTH]);
    traffic.push(new TrafficCar(laneX, -3000 - (i * 800)));
  }
  
  currentSpeed = 0;
  isGameOver = false;
  roadOffset = 0;
}

function draw() {
  background(5, 5, 15);
  
  let camX = lerp(0, player.x * 0.5, 0.05);
  if (isGameOver) {
    camera(camX, -400, 1500, player.x, 0, 0, 0, 1, 0);
  } else {
    camera(camX, -180, 1100, player.x, 80, 0, 0, 1, 0);
  }

  setupLighting();

  if (!isGameOver) {
    handleInput(); // Keyboard controls logic
    roadOffset = (roadOffset + currentSpeed) % 8000;
    score += floor(currentSpeed / 10);
    if (score > highScore) highScore = score;
  }

  drawRoad();

  for (let npc of traffic) {
    if (!isGameOver) {
      npc.update(currentSpeed, traffic);
      // CALLING THE RETURN METHOD
      if (checkCollision(player, npc)) {
        isGameOver = true;
        currentSpeed = 0;
      }
    }
    npc.display();
  }

  player.update();
  player.display();

  drawUI();
}

/**
 * LEARNING GOAL: RETURN METHOD
 */
function checkCollision(p, n) {
  let dX = abs(p.x - n.x);
  let dZ = abs(600 - n.z);
  if (dX < 65 && dZ < 150) {
    return true; // Returns the collision state
  }
  return false;
}

/**
 * CONTROLS: KEYBOARD ONLY
 */
function handleInput() {
    // Forward / Back
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        currentSpeed += ACCEL;
    } else if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
        currentSpeed -= ACCEL * 2;
    } else {
        currentSpeed -= FRICTION;
    }
    
    currentSpeed = constrain(currentSpeed, 0, MAX_SPEED);
}

function keyPressed() {
  if (isGameOver && (key === 'r' || key === 'R')) resetGame();
}

function drawUI() {
  hud.clear();
  hud.noStroke();
  
  if (isGameOver) {
    hud.fill(40, 0, 0, 180);
    hud.rect(0, 0, width, height);
    
    hud.textAlign(CENTER, CENTER);
    hud.fill(255, 50, 50);
    hud.textSize(80);
    hud.text("TOTALED", width/2, height/2 - 80);
    
    hud.fill(255);
    hud.textSize(30);
    hud.text("SCORE: " + score, width/2, height/2);
    hud.textSize(20);
    hud.text("PRESS [ R ] TO RESTART", width/2, height/2 + 100);
  } else {
    hud.textAlign(LEFT, TOP);
    hud.fill(255);
    hud.textSize(24);
    hud.text("SPEED: " + floor(currentSpeed * 3) + " KM/H", 30, 30);
    hud.text("SCORE: " + score, 30, 60);
  }
  
  push();
  noLights();
  resetMatrix();
  translate(-width/2, -height/2, 0);
  image(hud, 0, 0);
  pop();
}

function setupLighting() {
  ambientLight(50);
  pointLight(255, 255, 255, 0, -500, 500);
  directionalLight(150, 150, 255, 0, 1, -1);
}

function drawRoad() {
  push();
  translate(0, 150, 0);
  for (let i = 0; i < 25; i++) {
    let z = ((i * 400 + roadOffset) % 10000) - 8500;
    if (z > 2000) continue; 
    
    push();
    translate(0, 0, z);
    rotateX(HALF_PI);
    
    let stripeIdx = floor((i * 400 + roadOffset) / 400);
    fill(stripeIdx % 2 === 0 ? 15 : 25);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, 600, 401); 
    
    fill(255, 255, 255, 60);
    rect(-80, 0, 8, 401); 
    rect(80, 0, 8, 401);  
    
    fill(stripeIdx % 2 === 0 ? color(180, 20, 20) : 230);
    rect(-310, 0, 30, 401);
    rect(310, 0, 30, 401);
    pop();
  }
  pop();
}

/**
 * LEARNING GOAL: PARAMETER METHOD
 */
function drawDetailedCar(bodyColor) {
  push();
  fill(bodyColor);
  noStroke();
  box(70, 25, 150); 
  translate(0, -20, -10);
  fill(20, 30, 50);
  box(55, 20, 70);
  if (!isGameOver) {
    fill(255, 255, 200);
    translate(20, 10, -75);
    box(15, 10, 5);
    translate(-40, 0, 0);
    box(15, 10, 5);
  }
  pop();
}

class Player {
  constructor() {
    this.x = 0;
    this.vX = 0;
  }
  update() {
    if (isGameOver) return;
    
    let moveForce = 0.5;
    // Left/Right Controls
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        this.vX -= moveForce;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        this.vX += moveForce;
    }
    
    this.x += this.vX * (currentSpeed * 0.08);
    this.vX *= 0.82; 
    this.x = constrain(this.x, -260, 260); 
  }
  display() {
    push();
    translate(this.x, 120, 600);
    // PARAMETER CALL 1
    drawDetailedCar(isGameOver ? color(100) : color(220, 20, 20));
    pop();
  }
}

class TrafficCar {
  constructor(x, z) {
    this.x = x;
    this.z = z;
    this.speedMult = random(0.3, 0.55);
    this.c = color(random(80, 180), random(80, 180), random(100, 200));
  }
  
  update(pSpeed, others) {
    this.z += pSpeed * this.speedMult;
    if (this.z > 2000) {
      this.z = -8000 - random(1000);
      let newX = random([-LANE_WIDTH, 0, LANE_WIDTH]);
      this.x = newX;
      this.speedMult = random(0.3, 0.55);
    }
  }
  
  display() {
    push();
    translate(this.x, 120, this.z);
    rotateY(PI); 
    // PARAMETER CALL 2
    drawDetailedCar(this.c);
    pop();
  }
}