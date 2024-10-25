/*
    CA Curriculum Visualization
   
    Mobile Fishtank Controller
    (simulates mouse cursor on monitor)
 
    August Luhrs
*/

// MARK: SOCKET STUFF
//open and connect the input socket
let socket = io('/fishtank', {
  withCredentials: true
});

//listen for the confirmation of connection 
socket.on('connect', () => {
    console.log('now connected to server');
    if (socket.recovered) {
      console.log('previous connection reestablished')
    }
});

socket.on('mouseMoved', (data) => {
  //should add relative amount so multiple people can control at once
  console.log('mouse moved');
  handX += data.x;
  handY += data.y;
});


//UI
let test;
let joystick = {};
let mousePos;
let mouseSpeedScale = 0.01;

function setup(){
  createCanvas(windowWidth, windowHeight);//stretches to fit whatever windowSize the user has
  noStroke();
  background("#55ff23");
  angleMode(RADIANS);
  // joystick.x = width/2;
  // joystick.y = height * .75;
  joystick.pos = createVector(width/2, height * .75);
  mousePos = createVector();

  fill(155);

  ellipse(joystick.pos.x, joystick.pos.y, 200, 200)
  stroke(0);
}

function draw(){
  // mousePos.x = mouseX;
  // mousePos.y = mouseY;
  // fill(155);
  // ellipse(joystick.pos.x, joystick.pos.y, 200, 200)
}

function mouseDragged(){
  mousePos.x = mouseX;
  mousePos.y = mouseY;
  let dist = joystick.pos.dist(mousePos);
  console.log(dist * mouseSpeedScale);

  let dir = p5.Vector.sub(joystick.pos, mousePos).heading();
  console.log(dir);

  push();
  translate(joystick.pos.x, joystick.pos.y);
  rotate(dir);
  line(0, 0, -dist, 0);
  pop();
  socket.emit('mouseMoved', {heading: dir, mag: dist * mouseSpeedScale});
}
