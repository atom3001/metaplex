
/**
 * An array of image file paths to pre-load.
 */
var preloadables = ['images/SolApeFam.svg'];

/**
 * The Player object; an Actor controlled by user input.
 */
var player;
var svgBall, bb, fullBall;
var centerText = 'Tap to Play';
var background;
//var overlay; //nearly there need to a svg to index to make colour updatable
var cnftCo;
var columns = 7;
var rows = 6;

var layout =  "   B   \n   B   \n   B   ";

function updateLayout(){
  var ops = [" ","B"];
  var end = "\n";
  var newLayout = [];
  for(i=1;i<=rows;i++){
    var newRow = [];
    for(j=1;j<=columns;j++)
    {
      newRow.push(ops[Math.floor(Math.random()*4)]);
    }
    newRow.push(end);
    newLayout.push(newRow);
  };
  layout = newLayout;
}
/**
 * Keys used for various directions.
 */
var keys = {
  up: ['up', 's'],
  down: ['down', 'w'],
  left: ['left', 'a'],
  right: ['right', 'd'],
};

//const canvas = document.getElementById("canvas");
var cnftHeader = document.getElementById("cnftHeader");

//make bricks cnfts
var collection;
var tones = ["#f6d9cb","#efc0a4","#d68d6a","#edb886","#c98558","#5b3c28","#9f6946","#49240e","#d5e87e","#d397ea","#fe7e94","#ffd42a"]
var toneSelect = Math.floor(Math.random()*11)+1; 
var desSelect = Math.floor(Math.random()*5)+1;
var select = Math.floor(Math.random()*3000)+1;
var cnft = "https://arweave.net/UuWSZ_PY0fzFDSjhqVlL9PxtGbMp_3gc4H7pgTvnmAc";
function updateBall(){
  svgBall = document.getElementById("ballSvg");
  if(collection[0].title==="Hive Mind"){
    svgBall = document.getElementById("ballSvg2");
  } else {
    console.log("design = "+collection[0].title);
    svgBall = document.getElementById("ballSvg");
  }
  //var svgBall = 'images/ball_eb_01.svg';
  bb = svgBall.getElementById("bb");
  var randCol = collection[select].colours.substring((desSelect*17)+9,(desSelect*17)+16);
  bb.setAttribute("fill", randCol);
  var tone = svgBall.getElementById("tone");
  if(collection[select].tone==="null"){
    tone.setAttribute("fill",tones[toneSelect]);
  } else {
    tone.setAttribute("fill",collection[select].tone);
  }
  fullBall = svgBall.outerHTML;
  let blob = new Blob([fullBall], {type : 'image/svg+xml'});
  ball.src = URL.createObjectURL(blob);
}
function updateFoot(){
  var foot = document.getElementById("foot");
  //var svgBall = 'images/ball_eb_01.svg';
  var leg = foot.getElementById("leg");
  var randCol = collection[select].colours.substring((desSelect*17)+9,(desSelect*17)+16);
  console.log("bg colour = "+collection[select].bgc);
  console.log("foot and ball colour = "+randCol);
  leg.setAttribute("fill", randCol);
  var tone = foot.getElementById("tone");
  if(collection[select].tone==="null"){
    tone.setAttribute("fill",tones[toneSelect]);
  } else {
    tone.setAttribute("fill",collection[select].tone);
  }
  var fullLeg = foot.outerHTML;
  let blob = new Blob([fullLeg], {type : 'image/svg+xml'});
  player.src = URL.createObjectURL(blob); 
}
function updateHeader(){
  //cnftHeader.innerHTML = collection[select].title+" #"+collection[select].num;
}
function updateCnft(){
  desSelect = Math.floor(Math.random()*5)+1;
  select = Math.floor(Math.random()*3000)+1;
  switch (desSelect) {
    case 1:
      collection = kwCollection;
      break;
    case 2:
      collection = ebCollection;
      break;
    case 3:
      collection =  csCollection;
      break;
    case 4:
      collection = toCollection;
      break;
    case 5:
      collection = hmCollection
  }
  cnft = collection[select].path;
  console.log('cnft is '+cnft);

  canvas.style.backgroundColor = collection[select].bgc; //'rgba(255, 240, 40, 0)' 
  
  var ctx  = canvas.getContext("2d");
  background = new Image();
  background.src = collection[select].path;
  //overlay = new Image();
  //overlay.src = "images/top_rec_001.svg"
  //overlay.url = "https://x.com/atom3000_";
  //"images/grad_v1.png"
  
  // Make sure the image is loaded first otherwise nothing will draw.
  background.onload = function(){
  ctx.drawImage(background,0,0,600,600);
  
  }
  //overlay.onload = function(){
    //ctx.drawImage(overlay,0,599,600,21);
  //}
  

  updateBall();
  updateFoot();
  updateHeader();
}
// Track lives and score.
var lives, score;
var burn = new Box(-555, -555, 80, 80);
function burnOff(){
  burn = new Box(-555, -555, 80, 80)
}
var extraLives = "";
function extraLivesReset(){
  extraLives = "";
  drawHUD();
};
var winner = "";


// Constants. Tweak these to change the game dynamics.
var PADDLE_WIDTH = 180, //120 liked 140 on v6 svg
    PADDLE_HEIGHT = 80 // 80 for foot only, 280 really long
    INITIAL_LIVES = 3,
    BRICK_SCORE = 30, // Points for destroying a single block
    LEVEL_SCORE = 100, // Points for destroying all blocks in a level
    SPIN_FACTOR = 100, // 100 is arbitrary, but it should be above the FPS.
    BALL_RADIUS = 35,
    BALL_SPEED = 600, // In pixels per second was 400
    MAX_BALL_SPEED = 1000, // was 1000
    BALL_SPEED_LEVEL_INCREASE = 35, //was 25
    PAUSE = 1500; // ms to pause after losing a life or winning a level

/**
 * A magic-named function where all updates should occur.
 *
 * @param {Number} delta
 *   The amount of time since the last update. Use this to smooth movement.
 *   This has the same value as the global `App.physicsDelta`.
 * @param {Number} timeElapsed
 *   The amount of time elapsed while animating. This is useful for time-based
 *   movement and limiting the frequency of events. This has the same value as
 *   the global `App.physicsTimeElapsed`.
 */

function update(delta, timeElapsed) {
  player.update();
  //added TH to update paddle width quickly
  player.width = PADDLE_WIDTH;
  // Paddle-ball collision
  var o = ball.collideSolid(player);
  ball.bounce(o.x, o.y, true);

  // Bricks-ball collision
  bricks.forEach(function(brick) {
    o = ball.collideSolid(brick);
    ball.bounce(o.x, o.y);
    // Increment score and kill the brick if we hit it.
    if (o.x || o.y) {     
      burn = new Box(brick.x, brick.y, 80, 80);     
      burn.src = 'images/MM_Sun_Ball_006.svg';
      setTimeout(() => {
        burnOff();
      }, "100");
      player.increaseScore(BRICK_SCORE);
      var boost = Math.floor(Math.random()*10)+1;
      if(boost<2){
        player.addLife();
      }
    }
    return o.x || o.y;
  });

  ball.update();

  //If you reach a certain scrore
  if(score>2999){ //2999
    console.log("!! YOU WIN !!");
    winner = "!! YOU WIN !!";
    drawHUD();
    stopAnimating();
    player.destroy();
    //setTimeout(App.reset, PAUSE);
  }
  // If we're out of bricks, reset the level and speed up the ball.
  if (!bricks.getAll().length && !ball.levelUp) {
    ball.levelUp = true;
    Ball.prototype.MOVEAMOUNT = Math.min(
    Ball.prototype.MOVEAMOUNT+BALL_SPEED_LEVEL_INCREASE, MAX_BALL_SPEED);
    player.increaseScore(LEVEL_SCORE);
    stopAnimating();
    player.destroy();
    updateCnft();
    setTimeout(App.reset, PAUSE);
  }
}

/**
 * A magic-named function where all drawing should occur.
 */
function draw() {
  //context.drawCheckered(100, 0, 0, world.width, world.height);
  //context.drawImage('images/SolApeFam.svg',0,0,600,600);
  context.drawImage(background,0,0,600,600);
  //context.drawImage(overlay,0,599,600,21);
  hud.draw();
  cen.draw();
	player.draw();
	bricks.draw();
	ball.draw();
  burn.draw();
}

/**
 * A magic-named function for one-time setup.
 *
 * @param {Boolean} first
 *   true if the app is being set up for the first time; false if the app has
 *   been reset and is starting over.
 */
function setup(first) {
//  updateCnft();

  // Initialize the paddle.
  player = new Player(world.width/2-PADDLE_WIDTH/2, world.height, PADDLE_WIDTH, PADDLE_HEIGHT, '#2e2b2b');
  player.MOVEAMOUNT = 800; // Speed up arrow-key movement.
  /*
  player.drawDefault = function(ctx, x, y, w, h) {
    // Draw as a box, not as a smiley face.
    ctx.fillRect(x, y, w, h);
  };
  */
  player.src = 'images/Foot_006.svg';
  

  // Ignore up/down keys.
  player.keys = {
    up: [],
    down: [],
    left: ['left', 'a'],
    right: ['right', 'd'],
  };
  // Track score.
  player.increaseScore = function(amount) {
    score += amount;
    drawHUD();
  };
  // Track lives.
  player.takeLife = function() {
    lives--;
    drawHUD();
  };
  player.addLife = function() {
    lives++; 
    extraLives = "!!!! BONUS LIFE !!!!";
    BALL_RADIUS = 55;
    ball.width = BALL_RADIUS*2;
    ball.height = BALL_RADIUS*2;
    setTimeout(() => {
      extraLivesReset();
      BALL_RADIUS = 35;
      ball.width = BALL_RADIUS*2;
      ball.height = BALL_RADIUS*2;
    }, "2000");
    console.log("Bonus life added!!!!");
    drawHUD();
  };
  
  player.hasLivesLeft = function() {
    return lives > 1;
  };
  // Reset lives and score.
  if (first || lives === 0) {
    lives = INITIAL_LIVES;
    score = 0;
    Ball.prototype.MOVEAMOUNT = Actor.prototype.MOVEAMOUNT;
  }

  // Initialize the ball. (We could use a Collection for multiple balls...)
  ball = new Ball(25 + BALL_RADIUS, world.height / 2);
  ball.src = 'images/ball_eb_01.svg';
  if(!first){
    updateBall();
    updateFoot();
  }


  if (first) {
    updateCnft();
    // Make the paddle follow the mouse.
    $canvas.off('.setup').on('mousemove.setup touchmove.setup', function(e) {
      player.x = Mouse.Coords.worldX() - player.width/2;
    });


    // Set up the Heads-Up Display layer.
    hud = new Layer({
      relative: 'canvas',
    });
    hud.context.font = '34px slackey_regular';
    hud.context.textAlign = 'right';
    hud.context.textBaseline = 'top';
    hud.context.fillStyle = '#2e2b2b';
    hud.context.strokeStyle = 'rgba(211, 211, 211, 0.5)';
    hud.context.lineWidth = 5;
    // Set up center display.
    cen = new Layer({
      relative: 'canvas',
    });
    cen.context.font = '64px slackey_regular';
    cen.context.textAlign = 'right';
    cen.context.textBaseline = 'top';
    cen.context.fillStyle = '#2e2b2b';
    cen.context.strokeStyle = 'rgba(211, 211, 211, 0.5)';
    cen.context.lineWidth = 9;

    // Add the countdown element.
    jQuery('#countdown').remove();
    $canvas.after('<div id="countdown" style="background-color: rgba(255, 255, 255, 0); display: none; font-size: 60px; height: 80px; left: 0; overflow: hidden; position: absolute; text-align: center; top: 30%; width: 100%; z-index: 10;">0</div>');
  }
  drawHUD();
  drawCEN(625);

  // Initialize the bricks at the beginning of a new level.
  if (typeof bricks === 'undefined' || !bricks.getAll().length || lives === 3) {
    updateLayout();
    bricks = new TileMap(layout, {B: background}, {
      cellSize: [80, 80],
      startCoords: [20, 50],
    });
  }
  
  // Go after countdown.
  draw();

  //countdown(startAnimating);
  if(gameOn){
    countdown(startAnimating);
  }
  return false;
}

// 3... 2... 1... Go!
function countdown(callback) {
  centerText = '3';
  drawCEN(300);
  draw();
  onCount = true;
  setTimeout(function() {
    //$countdown.text('1');
    centerText = '';
    drawCEN(625);
    draw();
  }, 4000);
  setTimeout(function() {
    //$countdown.text('Go!').fadeOut(1000);
    centerText = 'Go!';
    drawCEN(625);
    draw();
    if (typeof callback == 'function') {
      callback();
    };
    onCount = false;
  }, 3000);
  setTimeout(function() {
    //$countdown.text('1');
    centerText = '1';
    drawCEN(500);
    draw();
  }, 2000);
  setTimeout(function() {
    //$countdown.text('2');
    centerText = '2';
    drawCEN(400);
    draw();
  }, 1000);
}

// Draw the score and lives.
function drawHUD() {
  hud.context.clear();
  hud.context.textAlign = 'left';
  hud.context.strokeText('LIVES: ' + lives, 15, 15);
  hud.context.fillText('LIVES: ' + lives, 15, 15);
  hud.context.textAlign = 'center';
  hud.context.strokeText(extraLives, 300, 300);
  hud.context.fillText(extraLives, 300, 300);
 
  hud.context.textAlign = 'right';
  hud.context.strokeText('COINS: ' + score, canvas.width - 15, 15);
  hud.context.fillText('COINS: ' + score, canvas.width - 15, 15);
  hud.context.font = '34px slackey_regular';
  hud.context.textAlign = 'center';
    if(winner!=""){
    hud.context.font = '80px slackey_regular';
  }
  hud.context.strokeText(winner, 300, 300);
  hud.context.fillText(winner, 300, 300);
  hud.context.font = '34px slackey_regular';

  
}

//var fontCentHeight = 625
// Draw the score and lives.
function drawCEN(fontCentHeight) {
  cen.context.clear();
  cen.context.textAlign = 'center';
  cen.context.strokeText(centerText, 300, fontCentHeight);
  cen.context.fillText(centerText, 300, fontCentHeight);
}

// Ball type
var Ball = Actor.extend({
  MOVEAMOUNT: BALL_SPEED,
  CONTINUOUS_MOVEMENT: true,
  DEFAULT_WIDTH: BALL_RADIUS*2,
  DEFAULT_HEIGHT: BALL_RADIUS*2,
  init: function() {
   this._super.apply(this, arguments);
   this.lastLooked = ['right', 'down']; // Initially go in this direction.
   this.lifeTaken = false; // Flag whether we hit the bottom
   this.levelUp = false; // Flag whether we leveled up
  },
  // Bounce off the sides of the world.  
   // Draw as a smiley face normally, but a frowny face after hitting the bottom.
   drawDefault: function() {
    if (this.lifeTaken) {
    }
    else {
      Actor.prototype.drawDefault.apply(this, arguments);
    }
   },
   // Bounce off the sides of the world.
   stayInWorld: function() {
    if (this.x < 0 || this.x + this.width > world.width) {
      this.bounce(true, false);
    }
    if (this.y < 0) {
      this.bounce(false, true);
    }
    // When hitting the bottom, take a life or end the game.
    else if (this.y + this.height > world.height && !this.lifeTaken) {
      this.lifeTaken = true;
      if (player.hasLivesLeft()) {
        player.takeLife();
        player.destroy();
        extraLives = "!!!! LIFE LOST !!!!";
      console.log("!!YOU DEAD!!");
       setTimeout(() => {
      extraLivesReset();
    }, "2000");
      drawHUD()
      //var svgBall = document.getElementById("bb");
    /*  bb.setAttribute("fill", "red");
      fullBall = svgBall.outerHTML;
      let blob2 = new Blob([fullBall], {type : 'image/svg+xml'});
  ball.src = URL.createObjectURL(blob2);
  //draw();
  */
        stopAnimating();
        setTimeout(App.reset, PAUSE);
      }
      else {
        player.takeLife();
        App.gameOver();
      }
    }
    this._super.apply(this, arguments);
   },
   // Switch directions.
  bounce: function(x, y, hitPlayer) {
   // X axis (wall, side of brick, or side of paddle)
   if (x) {
     this.lastLooked[0] = this.lastLooked[0] == 'right' ? 'left' : 'right';
     this.xAcceleration = -this.xAcceleration;
   }
   // Y axis (ceiling, top or bottom of brick, top of paddle)
   if (y) {
     this.lastLooked[1] = this.lastLooked[1] == 'down' ? 'up' : 'down';
     // Spin the ball based on where the player's paddle was hit.
     if (hitPlayer) {
       var m2 = 2*this.MOVEAMOUNT*SPIN_FACTOR;
       this.xAcceleration += (this.xC() - player.xC()) / player.width * m2;
       // Clamp; don't get too fast.
       this.xAcceleration = Math.max(Math.min(this.xAcceleration, m2), -m2);
     }
   }
  },
});
