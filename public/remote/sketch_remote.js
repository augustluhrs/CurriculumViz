/*
    CA Curriculum Visualization
   
    Mobile Fishtank Controller
    (simulates mouse cursor on monitor)
 
    August Luhrs
*/

// MARK: SOCKET STUFF
//open and connect the input socket
let socket = io('/remote', {
  withCredentials: true
});

//listen for the confirmation of connection 
socket.on('connect', () => {
    console.log('now connected to server');
    if (socket.recovered) {
      console.log('previous connection reestablished')
    }
});

// socket.on('mouseMoved', (data) => {
  //should add relative amount so multiple people can control at once
  // console.log('mouse moved');
  // handX += data.x;
  // handY += data.y;
// });


//UI
let bg;
let joyCol, knobCol;
// let joystick = {};
let mousePos;
let mouseSpeedScale = 0.03;
// let click = {
  // butt: null,
  // pos: null,
  // radius: 0
// }
let linkButt;
let clickButt, clickButtPos;
let joystick = {
  // xPos: 0, 
  // yPos: 0,
  pos: null,
  // xVal: 0,
  // yVal: 0,
  // xCenter: 0,
  // yCenter: 0,
  radius: 0,
  knob: {
    radius: 0,
    pos: null
  }
  // w: 0,
  // h: 0
}

function setup(){
  createCanvas(windowWidth, windowHeight);//stretches to fit whatever windowSize the user has
  noStroke();
  // angleMode(RADIANS);
  angleMode(DEGREES);


  bg = color("#99c80011");
  joyCol = color("#db7093");
  knobCol = color("#db7093");
  stroke("#6c702d");
  strokeWeight(3);
  textAlign(CENTER, CENTER);
  textSize(width/10);
  // joystick.x = width/2;
  // joystick.y = height * .75;
  joystick.pos = createVector(width * .66, height * .75);
  joystick.knob.pos = joystick.pos;
  joystick.radius = width / 4;
  joystick.knob.radius = joystick.radius / 2;
  mousePos = createVector();

  //click button UI
  clickButt = createButton("CLICK").class("buttons").position(width * .15, height * .5);
  clickButt.size(width/4, height/10);
  clickButt.mousePressed(()=>{
    console.log("click");
    socket.emit("mouseClicked");
  });
  clickButtPos = createVector(width * .15, height * .3);

  //link to main site
  linkButt = createButton("GO TO MAIN SITE").class("buttons").position(width * .65, height * .15);
  linkButt.size(width/4, height/10);
  linkButt.mousePressed(()=>{
    console.log("link");
    window.location = "https://ca-curriculum-viz.glitch.me";
  });


  fill(joyCol);

  ellipse(joystick.pos.x, joystick.pos.y, joystick.radius);
  // stroke(0);
}

function draw(){
  background(bg);
  // mousePos.x = mouseX;
  // mousePos.y = mouseY;
  // fill(155);
  // ellipse(joystick.pos.x, joystick.pos.y, 200, 200)
  textSize(width/10);
  text('FISHTANK \n REMOTE', width/2, height * .15);
  push();
  strokeWeight(1);
  textSize(width/26);
  text('MOVE', joystick.pos.x, joystick.pos.y + (joystick.radius * .75));
  pop();
  strokeWeight(4);

  // push();
  // fill(joyCol);
  ellipse(joystick.pos.x, joystick.pos.y, joystick.radius);
  // fill(knobCol);
  ellipse(joystick.knob.pos.x, joystick.knob.pos.y, joystick.knob.radius);
  // pop();
}

function mouseDragged(){
  mousePos.x = mouseX;
  mousePos.y = mouseY;

  //check if over button
  if (clickButtPos.dist(mousePos) < width / 4) {
    console.log('no move, click');
    return;
  } 
  joystick.knob.pos = mousePos;
  
  let dist = joystick.pos.dist(mousePos);
  dist *= mouseSpeedScale;
  console.log(dist);
  if (dist < .15) {return;} //prevent weird behavior when knob beginning to move

  let dir = p5.Vector.sub(mousePos, joystick.pos).heading();

  push();
  translate(joystick.pos.x, joystick.pos.y);
  rotate(dir);
  strokeWeight(4);
  line(0, 0, dist, 0);
  pop();
  socket.emit('mouseMoved', {heading: dir, mag: dist});
}

function mouseReleased(){
  joystick.knob.pos.x = joystick.pos.x;
  joystick.knob.pos.y = joystick.pos.y;
}
