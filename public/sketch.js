/*
    CA Curriculum Visualization
    Prototype v1
    
    node map generation from masterSheet csv
    August Luhrs and Despina Papadopolous
*/

//design/UI variables
let bg;
// let nodeCol, nodeStroke, titleCol;
let font;
let nodeSize, nodeSize_px;
let nodeScale = 0.09; // 9% of shorter side of window
let webOffset, clusterOffset, idealSeparation, mouseRepel, boundaryForce;
let mousePos;
let physicsButton, speedSlider, forceSlider, frictionSlider;
let speedDiv, forceDiv, frictionDiv;
let title, titleSize, titleRatio; //ca title logo

let canvas, coursePanel, coursePanelButton;
let courseInfo = {}; //stores the divs for the diff class info stuff in the coursePanel
let shiftCenterPos;

let warningText = "";

//csv variables
let masterSheet;
let courses = []; //stores the cNodes
// let areas = ["CORE", "SOUL", "IMAGE", "MOVEMENT", "ACTING", "SOUND", "TECHNOLOGY", "WRITING", "VISUAL ART", "STUDIES"];
// let areas; //now in modules
let clusters = {}; //stores the vector locations of the web clusters by area

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
  masterSheet = loadTable("data/master_4-8.csv", "csv", "header");
  title = loadImage("https://cdn.glitch.global/119042a0-d196-484e-b4d0-393548c41275/ca_title.png?v=1712723968514");
  font = loadFont("https://cdn.glitch.global/119042a0-d196-484e-b4d0-393548c41275/tiltneon.ttf?v=1712723959662");
}

/**
 * 
 *  SETUP
 * 
 */

function setup() {
  //background and UI
  canvas = createCanvas(windowWidth, windowHeight);//stretches to fit whatever windowSize the user has
  canvas.parent("mainContainer");
  textAlign(CENTER, CENTER);
  textWrap(WORD);
  textFont(font);
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
    bg.setAlpha(0);
  }
  
  //mobile warning
  if (width < height){
    warningText = "NOT READY FOR MOBILE, PLEASE CHECK THIS OUT ON A COMPUTER";
  }

  //title logo
  titleSize = width/8;
  titleRatio = title.height / title.width;

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
  textSize(nodeSize / 7);

  //distances from clusters to center of web and nodes to clusters
  webOffset = (-nodeSize * 4);
  clusterOffset = (-nodeSize * 1.3);
  idealSeparation = nodeSize;
  mouseRepel = idealSeparation * 4;
  boundaryForce = 100;
  shiftCenterPos = createVector(width * 0.31, height/2);
  // shiftWebOffset =

  //set up mousePos variable
  mousePos = createVector(0, 0);


  initClusters();
  initCourseNodes();
  initPanelUI();
  initControlUI();
  
}

/**
 * 
 *  DRAW
 * 
 */

function draw() {
  background(bg);
  image(title, 10, 10, titleSize, titleSize * titleRatio);
  
  push();
  textSize(nodeSize / 3);
  text(warningText, width/2, height/10);
  pop();
  //web test
  if (options.isWeb){
    push();
    noStroke();
    // fill(50, 205, 100);
    // for (let i = 0; i < 8; i++){
    // for (let cluster of clusters){
    for (let cluster of Object.keys(clusters)){
      if (cluster == "SOUL") {continue;}
      stroke(255);
      strokeWeight(4);
      fill(clusters[cluster].color);
      rect(clusters[cluster].pos.x, clusters[cluster].pos.y, nodeSize);
      noStroke();
      fill(0);
      text(cluster, clusters[cluster].pos.x, clusters[cluster].pos.y, nodeSize);
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

function nodeClick(node) {
  //when a node is clicked. as the name suggests.
  console.log(node.course);
  coursePanel.show();
  courseInfo.courseTitle.html(node.course);
  courseInfo.courseProfessor.html(node.professor);
  courseInfo.courseShort.html(node.short);
  courseInfo.courseKeywords.html(node.keywords);

  shiftClusters();
}

function initPanelUI(){
  //panel UI
  coursePanel = createDiv().class("panels").id("coursePanel").parent("mainContainer");
  // panel.width = width * .38;
  // panel.height = height;
  coursePanel.size(width * 0.28, height);
  coursePanel.position(width * .72, 0);
  coursePanel.hide();

  coursePanelButton = createButton('>>>').class("buttons").parent("coursePanel");
  // coursePanelButton.position(0, height/2);
  coursePanelButton.mousePressed(()=>{
    coursePanel.hide();
    shiftClustersHome();
  })

  //course info for coursePanel
  courseInfo["courseTitle"] = createDiv("COURSE TITLE").parent("coursePanel").class("infoDivs");
  courseInfo["courseProfessor"] = createDiv().parent("coursePanel").class("infoDivs");
  courseInfo["courseBreak"] = createDiv().parent("coursePanel").class("infoDivs");
  courseInfo["courseShort"] = createDiv().parent("coursePanel").class("infoDivs");
  courseInfo["courseBreak2"] = createDiv().parent("coursePanel").class("infoDivs"); //yeah idk
  courseInfo["courseKeywords"] = createDiv().parent("coursePanel").class("infoDivs");

}

function initControlUI(){
  //control UI
  physicsButton = createButton("TURN PHYSICS OFF").class("buttons").position(20, height - 50).mousePressed(()=>{
    options.isPhysics = !options.isPhysics;
    if (options.isPhysics) {
      physicsButton.html("TURN PHYSICS OFF");
    } else {
      physicsButton.html("TURN PHYSICS ON");
    }
  });
  speedDiv = createDiv("maxSpeed").parent("controlDiv").id("speedDiv").class("controls");
  speedSlider = createSlider(0, 10, 6, 0.1).parent("speedDiv").changed(()=>{
    for (let cNode of courses) {
      cNode.maxSpeed = speedSlider.value();
    }
  });
  forceDiv = createDiv("maxForce").parent("controlDiv").id("forceDiv").class("controls");
  forceSlider = createSlider(0.1, 10, .4, 0.1).parent("forceDiv").changed(()=>{
    for (let cNode of courses) {
      cNode.maxForce = forceSlider.value();
    }
  });
  frictionDiv = createDiv("friction").parent("controlDiv").id("frictionDiv").class("controls");
  frictionSlider = createSlider(0, 1, 0.93, 0.01).parent("frictionDiv").changed(()=>{
    for (let cNode of courses) {
      cNode.friction = frictionSlider.value();
    }
  });
  // let velocityBufferSlider = createSlider(0, 2, 0.2, .05).changed(()=>{
  //   console.log(velocityBufferSlider.value());
  //   for (let cNode of courses) {
  //     cNode.velocityBuffer = velocityBufferSlider.value();
  //   }
  // });
  //set all CNode physics variables here based on slider defaults
  for (let cNode of courses){
    cNode.maxSpeed = speedSlider.value();
    cNode.maxForce = forceSlider.value();
    cNode.friction = frictionSlider.value();
    // cNode.velocityBuffer = velocityBufferSlider.value();
  }
}


function shiftClusters(){
  //when side panel opens, move the clusters
  push();
  translate(shiftCenterPos.x, shiftCenterPos.y); //hmm
  clusters["CORE"].pos = shiftCenterPos;
  clusters["SOUL"].pos = shiftCenterPos;

  let angle = 360/8;
  for (let i = 2; i < 10; i++){ //skipping core and soul
    let clusterPos = rotationCoords(webOffset, 0, angle);
    clusterPos.x += shiftCenterPos.x; //so we don't have to translate anymore
    clusterPos.y += shiftCenterPos.y;
    clusters[areas[i][0]].pos = clusterPos;

    angle += 360/8;
  }
  pop();
}

function shiftClustersHome(){
  //when side panel closes, move the clusters back home
  push();
  translate(width/2, height/2); //hmm
  clusters["CORE"].pos = createVector(width/2, height/2);
  clusters["SOUL"].pos = createVector(width/2, height/2);

  let angle = 360/8;
  for (let i = 2; i < 10; i++){ //skipping core and soul
    let clusterPos = rotationCoords(webOffset, 0, angle);
    clusterPos.x += width/2; //so we don't have to translate anymore
    clusterPos.y += height/2;
    clusters[areas[i][0]].pos = clusterPos;

    angle += 360/8;
  }
  pop();
}

function initClusters(){
    //get the web cluster locations per area -- this is dumb TODO refactor
    push();
    translate(width/2, height/2);
    clusters["CORE"] = {
      color: color(areas[0][1]),
      pos: createVector(width/2, height/2),
      count: 0,
      currentIndex: 0,
    };
    clusters["SOUL"] = {
      color: color(areas[1][1]),
      pos: createVector(width/2, height/2),
      count: 0,
      currentIndex: 0,
    };
    //needs to be relative to node scale (shorter side) or else will be off screen
    let angle = 360/8;
    for (let i = 2; i < 10; i++){ //skipping core and soul
      // rotate(angle);
      // let clusterPos = rotationCoords(-nodeSize * 4, 0, angle);
      let clusterPos = rotationCoords(webOffset, 0, angle);
      // console.log(clusterPos);
      clusterPos.x += width/2; //so we don't have to translate anymore
      clusterPos.y += height/2;
      clusters[areas[i][0]] = {
        color: color(areas[i][1]),
        pos: clusterPos,
        count: 0,
        currentIndex: 0, //for offset counting
      };
  
      angle += 360/8;
      // rect(-nodeSize * 4, 0, 100);
    }
    pop();
}

function initCourseNodes(){
  //cycle through the table to generate the CNodes
  for (let r = 0; r < masterSheet.getRowCount(); r++){
    let rowArr = masterSheet.rows[r].arr;
    let courseInfo = { //Course,Professor,Area,Credits,Semester,Keywords,Short,Long,Media,Credit,Media,Credit,Media,Credit
      course: rowArr[0],
      professor: rowArr[1],
      area: rowArr[2],
      credits: rowArr[3],
      semester: rowArr[4],
      keywords: rowArr[5],
      short: rowArr[6],
      long: rowArr[7],
      media: [ //url, credit text, p5 Image (added later)
        [rowArr[8], rowArr[9]],
        [rowArr[10], rowArr[11]],
        [rowArr[12], rowArr[13]]
      ]
    }
    let newCourse = new CNode(courseInfo, nodeClick);
    courses.push(newCourse);
  }

  //get web positions from cluster count
  for (let cNode of courses) {
    cNode.getClusterOffset();
  }

  //start to load the images in the cNodes
  for (let cNode of courses){
    // cNode.media[0].push(loadImage(cNode.media[0][0])); //need public link and CORS stuff
  }
}

function rotationCoords(x, y, angle){
  //getting vector from rotation around center
  //thanks chat-gpt
  let newX = x * cos(angle) - y * sin(angle);
  let newY = x * sin(angle) + y * cos(angle);
  return createVector(newX, newY);
}
