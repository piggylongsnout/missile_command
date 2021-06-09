// EXPLOSIONS SOMETIMES DONT GO BACKWORDS NEED TO FIX.

console.log("Program Started");

const canvas = document.getElementById("canvas");
//const ctx     = canvas.getContext("2d", { alpha: false });
const ctx    = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

function Missile(startX, startY, endX, endY, rate) {
  this.startCords      = {x: startX, y: startY};
  this.endCords        = {x: endX,   y: endY};
  this.finalDistance   = Math.sqrt(Math.pow((endX - startX),2)+(Math.pow((endY - startY),2)));
  this.rate            = rate;
  this.startTime       = Date.now();
  this.getCurrentCords = function() {
    percentage = this.getCurrentDistance() / this.finalDistance;
    //console.log(percentage);
    return {
      x: this.startCords.x + (percentage * (this.endCords.x - this.startCords.x)),
      y: this.startCords.y + (percentage * (this.endCords.y - this.startCords.y))
    };
  };
  this.getCurrentDistance = function() {
    return this.rate * (Date.now() - this.startTime);
  }
};
function Flack(startX, startY, endX, endY, rate) {
  this.startCords      = {x: startX, y: startY};
  this.endCords        = {x: endX,   y: endY};
  this.finalDistance   = Math.sqrt(Math.pow((endX - startX),2)+(Math.pow((endY - startY),2)));
  this.rate            = rate;
  this.startTime       = Date.now();
  this.getCurrentCords = function() {
    percentage = this.getCurrentDistance() / this.finalDistance;
    //console.log(percentage);
    return {
      x: this.startCords.x + (percentage * (this.endCords.x - this.startCords.x)),
      y: this.startCords.y + (percentage * (this.endCords.y - this.startCords.y))
    };
  };
}
function Explosion(startX, startY, currentSize, finalSize, rate) {
  this.x           = startX;
  this.y           = startY;
  this.finalSize   = finalSize;
  this.rate        = rate;
  this.startTime   = Date.now();
  this.currentSize = function() {
    percentage = (this.rate * (Date.now() - this.startTime)) / this.finalSize
    if(percentage <= 1) {
      return this.rate * (Date.now() - this.startTime);
    } else {
      return Math.max(this.finalSize + (this.finalSize - (this.rate * (Date.now() - this.startTime))), -1);
    }
  };
}
function Building(x, y, length, height, type) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.length = length;
  this.height = height;
}
var missileArray   = [];
var explosionArray = [];
structureArray = [
  new Building(85*1, 600, 40, 10, "city"),
  new Building(85*2, 600, 40, 10, "city"),
  new Building(85*3, 600, 40, 10, "city"),
  new Building(85*4, 600, 40, 10, "city"),
  new Building(85*5, 600, 40, 10, "city"),
  new Building(85*6, 600, 40, 10, "city"),
]


function drawMissileArray(ctx, missileArray) {
  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.lineWidth = 2;
  for(i=0; i < missileArray.length; i++) {
    currentMissile = missileArray[i];
    if(currentMissile.getCurrentDistance() <= currentMissile.finalDistance) {
      ctx.moveTo(currentMissile.startCords.x, currentMissile.startCords.y);
      currentCords = currentMissile.getCurrentCords();
      //console.log(currentCords);
      ctx.lineTo(currentCords.x, currentCords.y);
    } else {
      missileArray.splice(i,1);
      addExplosion(currentMissile, i, 25, .01, missileArray);
    }
  }
  ctx.stroke();
}

function drawExplosionArray(ctx, explosionArray) {
  for(i=0; i < explosionArray.length; i++) {

    //console.log("test");
    currentExplosion = explosionArray[i];

    currentSize = currentExplosion.currentSize();
    finalSize   = currentExplosion.finalSize;
    percentage  = currentSize / finalSize;
//console.log(currentSize);
    if(percentage < 1 && percentage >= 0) {
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.fillStyle = "white";
      ctx.lineWidth = 2;
      //console.log(currentSize <= finalSize);
      ctx.arc(currentExplosion.x, currentExplosion.y, percentage * currentExplosion.finalSize, 0, 2 * Math.PI);
      ctx.stroke();
    } else {
      explosionArray.splice(i,1);
    }
    //console.log(percentage);
  }
}

function drawDebug(ctx, missileArray, explosionArray) {
  for(i=0; i < explosionArray.length; i++) {
    for(j=0; j < missileArray.length; j++) {
      ctx.beginPath();
      currentExplosion = explosionArray[i];
      currentMissile   = missileArray[j];

      //console.log("Distance: " + distance(missile.currentX, missile.currentY, explosion.x, explosion.y));
      //console.log("Explosion Size: " + explosion.currentSize);
      currentCords = currentMissile.getCurrentCords();

      //hit = currentExplosion.currentSize() >= distance(currentCords.x, currentCords.y, currentExplosion.x, currentExplosion.y)

      if(currentExplosion.currentSize() >= distance(currentCords.x, currentCords.y, currentExplosion.x, currentExplosion.y)) {
        ctx.strokeStyle = "red";
      } else {
        ctx.strokeStyle = "green";
      }
      ctx.moveTo(currentExplosion.x, currentExplosion.y);
      ctx.lineTo(currentCords.x, currentCords.y);
      ctx.stroke();
      //if(hit == true) {
      //  addExplosion(missile, j, 50)
      //}
    }
  }
}

function drawStructuresArray(ctx, structureArray) {
  for(i=0; i<structureArray.length; i++) {
    currentStructure = structureArray[i];
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    //ctx.lineWidth = 1;
    ctx.rect(currentStructure.x-(currentStructure.length/2), currentStructure.y-(currentStructure.height), currentStructure.length, currentStructure.height);
    ctx.fill();
    ctx.stroke();
  }
}

function addExplosion(missile, index, size, rate, missileArray) {
  currentCords = missile.getCurrentCords();
  explosionArray.push(new Explosion(currentCords.x, currentCords.y, 0, size, rate));
  //missileArray.splice(i,1);
}

function checkHitBoxes(ctx, explosionArray, missileArray) {
  for(i=0; i < explosionArray.length; i++) {
    for(j=0; j < missileArray.length; j++) {
      ctx.beginPath();
      currentExplosion = explosionArray[i];
      currentMissile   = missileArray[j];

      //console.log("Distance: " + distance(missile.currentX, missile.currentY, explosion.x, explosion.y));
      //console.log("Explosion Size: " + explosion.currentSize);
      currentCords = currentMissile.getCurrentCords();

      hit = currentExplosion.currentSize() >= distance(currentCords.x, currentCords.y, currentExplosion.x, currentExplosion.y)

      if(hit) {
        missileArray.splice(j,1);
        addExplosion(currentMissile, j, 10, .01, missileArray);
      }
    }
  }

  for(j=0; j < missileArray.length; j++) {
    currentMissile   = missileArray[j];

    //console.log("Distance: " + distance(missile.currentX, missile.currentY, explosion.x, explosion.y));
    //console.log("Explosion Size: " + explosion.currentSize);
    currentCords = currentMissile.getCurrentCords();


    for(k=0; k < structureArray.length; k++) {
      currentStucture = structureArray[k];
      //console.log(currentCords.y);
      //console.log(currentStructure.y);

      if(currentCords.x > currentStucture.x-25 && currentCords.x < currentStucture.x+25) {
        if(currentCords.y > currentStucture.y-currentStucture.height && currentCords.y > currentStucture.y-currentStucture.height) {
          missileArray.splice(j,1);
          addExplosion(currentMissile, j, 10, .01, missileArray);
          structureArray.splice(k,1);
        }
      }
    }
  }
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
}

for(i=0; i < 3; i++) {
  startX = (Math.floor(Math.random() * 600 + 1));
  endX   = structureArray[(Math.floor(Math.random() * structureArray.length))].x;
  missileArray.push(new Missile(startX, 0, endX, 600, .03));
}

function SpawnWaves() {
  this.waveEvery = 60*10;
  this.currentTime = 0;
  this.waveSize  = 4;
  this.numOfWaves = 0;
}
waves = new SpawnWaves();

const playerSprite = new Image();
playerSprite.src = "sprites/city.png";

function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
  ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}



var debug = false;
var showLines = false;
function clearCTX(ctx) {
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();
  ctx.stroke();
}
function startAnimating(fps) {
  fpsInterval = 1000/fps;
  then = Date.now();
  startTime = then;
  animate();
}
function animate() {
  requestAnimationFrame(animate);
  now = Date.now();
  elapsed = now - then;
  if(elapsed > fpsInterval) {
    if(structureArray.length != 0) {
      clearCTX(ctx);
      drawSprite(playerSprite, 0,0,16,16,300,300,16,16);
      if(waves.waveEvery < waves.currentTime) {
      for(i=0; i < waves.waveSize; i++) {
        startX = (Math.floor(Math.random() * 600 + 1));
        endX   = structureArray[(Math.floor(Math.random() * structureArray.length))].x;//(Math.floor(Math.random() * 600 + 1));
        missileArray.push(new Missile(startX, 0, endX, 600, .03));
      }
      waves.currentTime = 0;
      waves.numOfWaves = waves.numOfWaves + 1;
      waves.waveSize = waves.waveSize + (waves.numOfWaves * 2);
    } else {
      if(waves.currentTime < 120) {
        ctx.fillStyle = "green";
        ctx.font = "bold 64px Arial";
        ctx.fillText("Wave: " + waves.numOfWaves, (canvas.width / 2)-64*2, (canvas.height / 2));
      }
      waves.currentTime = waves.currentTime + 1;
      //console.log(waves.waveSize);
    }
      then = now - (elapsed % fpsInterval);
      checkHitBoxes(ctx, explosionArray, missileArray);
      drawStructuresArray(ctx, structureArray);
      drawMissileArray(ctx, missileArray);
      drawExplosionArray(ctx, explosionArray);
      if(debug == true) {
        if(showLines == true) {
          drawDebug(ctx, missileArray, explosionArray);
        }
      }
    } else {
      ctx.fillStyle = "red";
      ctx.font = "bold 64px Arial";
      ctx.fillText("Game over!", (canvas.width / 2)-64*3, (canvas.height / 2));
    }
  }
}


startAnimating(60);


window.addEventListener("click", function(event) {
  missileArray.push(new Missile(300, 585, event.clientX-11, event.clientY-11, .1));
});

window.addEventListener("keydown", function(event) {
  if(event.code == "KeyF") {
    if(debug == true) {debug=false;} else {debug=true;}
  }
});

window.addEventListener("keydown", function(event) {
  if(event.code == "Digit1") {
    if(debug == true) {
      startX = (Math.floor(Math.random() * 600 + 1));
      endX   = (Math.floor(Math.random() * 600 + 1));
      missileArray.push(new Missile(startX, 0, endX, 600, .03));
    }
  }
});

window.addEventListener("keydown", function(event) {
  if(event.code == "Digit2") {
    if(debug == true) {
      if(showLines == true) {showLines=false;} else {showLines=true;}
    }
  }
});
