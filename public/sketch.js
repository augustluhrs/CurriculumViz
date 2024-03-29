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
let webOffset, clusterOffset, idealSeparation, mouseRepel;
let mousePos;
let speedSlider;

//csv variables
let airtable;
let courses = []; //stores the cNodes
let areas = ["CORE", "IMAGE", "PERFORMANCE", "MUSIC & SOUND", "EMERGING MEDIA & TECH", "TEXT", "VISUAL ART", "STUDIES (RESEARCH)"];
let clusters = []; //stores the vector locations of the web clusters by area

//options/filters/visuals
let options = {
  isWeb: false,
  isMoving: false,
  isAquarium: false,
  isPhysics: false,
  isDraggable: false,
  isGravity: false,
  isAlphaPaint: false,
};
options.isWeb = true;
options.isMoving = true;
options.isPhysics = true;
options.isAlphaPaint = true;

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
  textWrap(WORD);
  ellipseMode(CENTER);
  rectMode(CENTER);
  angleMode(DEGREES); //just for 360/7 areas
  // bg = color("#616708"); //olive
  // bg = color("#aaef74"); //light pale green
  bg = color('#aaff55'); // light green
  // nodeCol = color("#f3a9b0");
  // nodeStroke = color("#f0c5c4");
  // titleCol = color("#00fffa");
  if(options.isAlphaPaint){
    bg.setAlpha(4);
  }

  //control UI
  speedSlider = createSlider(0.2, 10, 1, 0.1).changed(()=>{
    for (let cNode of courses) {
      cNode.maxSpeed = speedSlider.value();
    }
  });

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
  textSize(nodeSize / 9);

  //distances from clusters to center of web and nodes to clusters
  webOffset = (-nodeSize * 4);
  clusterOffset = (-nodeSize * 1.3);
  idealSeparation = nodeSize;
  mouseRepel = idealSeparation * 2;

  //get the web cluster locations per area
  push();
  translate(width/2, height/2);
  clusters.push({
    name: "CORE",
    pos: createVector(width/2, height/2),
    count: 0,
    currentIndex: 0,
  });
  //needs to be relative to node scale (shorter side) or else will be off screen
  let angle = 360/7;
  for (let i = 0; i < 7; i++){
    // rotate(angle);
    // let clusterPos = rotationCoords(-nodeSize * 4, 0, angle);
    let clusterPos = rotationCoords(webOffset, 0, angle);
    // console.log(clusterPos);
    clusterPos.x += width/2; //so we don't have to translate anymore
    clusterPos.y += height/2;
    clusters.push({
      name: areas[i+1],
      pos: clusterPos,
      count: 0,
      currentIndex: 0, //for offset counting
    });
    // console.log(clusterPos);

    angle += 360/7;
    // rect(-nodeSize * 4, 0, 100);
  }
  pop();

  //cycle through the table to generate the CNodes
  for (let r = 0; r < airtable.getRowCount(); r++){
    let newCourse = new CNode(airtable.rows[r].arr, createVector(random(0, width), random(0, height)));
    courses.push(newCourse);
  }

  //get web positions from cluster count
  for (let cNode of courses) {
    cNode.getClusterOffset();
  }

  //set up mousePos variable
  mousePos = createVector(0, 0);
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
    noStroke();
    fill(50, 205, 100);
    for (let i = 0; i < 8; i++){
      fill(50, 205, 100);
      rect(clusters[i].pos.x, clusters[i].pos.y, nodeSize);
      fill(0);
      text(clusters[i].name, clusters[i].pos.x, clusters[i].pos.y, nodeSize);
    }
    pop();
  }

  //cNode display
  if (options.isMoving) {
    if (options.isPhysics) {
      mousePos.x = mouseX;
      mousePos.y = mouseY;
      for (let cNode of courses) {
        cNode.checkDist(mousePos);
      }
    }
    for (let cNode of courses){
      cNode.checkBounds();
    }
    for (let cNode of courses){
      cNode.update();
      // cNode.showLines();
    }
  }
  for (let cNode of courses) {
    cNode.show();
  }
  
}


function rotationCoords(x, y, angle){
  //getting vector from rotation around center
  //thanks chat-gpt
  let newX = x * cos(angle) - y * sin(angle);
  let newY = x * sin(angle) + y * cos(angle);
  return createVector(newX, newY);
}
