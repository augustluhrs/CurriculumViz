/*
    CA Curriculum Visualization
    Prototype v0
    
    testing node generation from airtable csv
    August Luhrs and Despina Papadopolous
*/

//design/UI variables
let bg;
// let nodeCol, nodeStroke, titleCol;
let nodeSize, nodeSize_px;
let nodeScale = 0.09; // 9% of shorter side of window

//csv variables
let airtable;
let courses = []; //stores the cNodes
let clusters = []; //stores the vector locations of the web clusters by area

//options/filters/visuals
let options = {
  isWeb: false,
  isMoving: false,
  isDraggable: false,
  isGravity: false,
  isAlphaPaint: false,
};
options.isWeb = true;
options.isMoving = true;
// options.isAlphaPaint = true;

function preload(){
  airtable = loadTable("data/table.csv", "csv", "header");
}

/**
 * 
 *  SETUP
 * 
 */

function setup() {
  //background and UI
  createCanvas(windowWidth, windowHeight);//stretches to fit whatever windowSize the user has
  textAlign(CENTER, CENTER);
  ellipseMode(CENTER);
  rectMode(CENTER);
  angleMode(DEGREES); //just for 360/7 areas
  // bg = color("#616708"); //olive
  bg = color("#aaef74"); //light pale green
  // nodeCol = color("#f3a9b0");
  // nodeStroke = color("#f0c5c4");
  // titleCol = color("#00fffa");
  if(options.isAlphaPaint){
    bg.setAlpha(3);
  }

  //setup the css element properties
  //get the relative node size
  // nodeScale = .08; //5% of shorter side of window
  if (width > height) { 
    nodeSize = height * nodeScale; 
  } else {
    nodeSize = width * nodeScale;
  }
  //turn to string for css
  nodeSize_px = nodeSize.toString();
  nodeSize_px += 'px';

  //get the web cluster locations per area
  push();
  translate(width/2, height/2);
  //needs to be relative to node scale (shorter side) or else will be off screen
  let angle = 360/7;
  for (let i = 0; i < 7; i++){
    // rotate(angle);
    let clusterPos = rotationCoords(-nodeSize * 4, 0, angle)
    console.log(clusterPos);
    clusters.push(clusterPos);
    angle += 360/7;
    // rect(-nodeSize * 4, 0, 100);
  }
  pop();

  //cycle through the table to generate the CNodes
  for (let r = 0; r < airtable.getRowCount(); r++){
    let newCourse = new CNode(airtable.rows[r].arr, createVector(random(0, width), random(0, height)));
    courses.push(newCourse);
  }
}

/**
 * 
 *  DRAW
 * 
 */

function draw() {
  background(bg);

  //web test
  if (options.isWeb){
    push();
    translate(width/2, height/2);
    noStroke();
    fill(50, 205, 100);
    rect(0, 0, 200);
    for (let i = 0; i < 7; i++){
      rect(clusters[i].x, clusters[i].y, 100);
    }
    pop();
  }

  //cNode display
  if (options.isMoving) {
    for (let node of courses){
      node.check();
    }
    for (let node of courses){
      node.update();
      // node.showLines();
    }
  }
  for (let node of courses) {
    node.show();
  }
  
}


function rotationCoords(x, y, angle){
  //getting vector from rotation around center
  //thanks chat-gpt
  let newX = x * cos(angle) - y * sin(angle);
  let newY = x * sin(angle) + y * cos(angle);
  return createVector(newX, newY);
}
