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
let physicsButton, speedSlider, forceSlider, frictionSlider, bounceButton, mouseAvoidButton;
let lastPhysics = {}; //for bounce mode reset TODO clean up
let speedDiv, forceDiv, frictionDiv;
let title, titleSize, titleRatio; //ca title logo
let canvas, coursePanel, coursePanelButton;
let courseInfo = {}; //stores the divs for the diff class info stuff in the coursePanel
let shiftCenterPos, panelLeftEdge; //TODO should have all the course panel stuff in own object
let bounceDelay; //stores the interval ID to clear the physics toggle in bounceToggle

let keywordPanel, keywordPanelButton;
let keywordCheckboxes = {};


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
  isBounce:false,
  isAvoidingMouse: false,
  isShowingPanel: false,
  isShowingKeywords: false, //ugh naming, this is a panel too...
  isKeywordWeighted: false, //for showing siblings/cousins
};
options.isWeb = true;
options.isMoving = true;
options.isPhysics = true;
options.isAlphaPaint = true;
// options.isAvoidingMouse = true;

function preload(){
  masterSheet = loadTable("data/master_4-8.csv", "csv", "header");
  title = loadImage("assets/brand/ca_title.png");
  font = loadFont("assets/fonts/tiltneon.ttf");
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
  colorMode(HSB);
  // bg = color("#616708"); //olive
  bg = color("#aaef74"); //light pale green
  // bg = color('#aaff55'); // light green

  // nodeCol = color("#f3a9b0");
  // nodeStroke = color("#f0c5c4");
  // titleCol = color("#00fffa");
  if(options.isAlphaPaint){
    bg.setAlpha(.03);
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
  boundaryForce = 1000;
  shiftCenterPos = createVector(width * 0.31, height/2);
  panelLeftEdge = width * .72; //course panel
  panelRightEdge = width * .1; //keyword panel

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

  //deselect any existing nodes, the one that's clicked will select itself
  for (let cNode of courses){ //ugh TODO redo 'cNode' naming
    cNode.isSelected = false;
  }
  // console.log(node.course);
  coursePanel.show();
  courseInfo.courseTitle.html(node.course);
  courseInfo.courseProfessor.html(node.professor);
  courseInfo.courseShort.html(node.short);
  courseInfo.courseKeywords.html(node.keywords);

  shiftClusters();
  options.isShowingPanel = true;
}

function initPanelUI(){
  //course panel UI
  coursePanel = createDiv().class("panels").id("coursePanel").parent("mainContainer");
  coursePanel.size(width - panelLeftEdge, height);
  coursePanel.position(panelLeftEdge, 0);
  coursePanel.hide();

  coursePanelButton = createButton('>>>').class("buttons").parent("coursePanel");
  coursePanelButton.mousePressed(()=>{
    coursePanel.hide();
    shiftClustersHome();
    options.isShowingPanel = false;
    
    //reset the selected node (TODO, just store which is selected?)
    for (let cNode of courses){
      cNode.isSelected = false;
    }
  })

  //course info for coursePanel
  courseInfo["courseTitle"] = createDiv("COURSE TITLE").parent("coursePanel").class("infoDivs");
  courseInfo["courseProfessor"] = createDiv().parent("coursePanel").class("infoDivs");
  courseInfo["courseBreak"] = createDiv().parent("coursePanel").class("infoDivs");
  courseInfo["courseShort"] = createDiv().parent("coursePanel").class("infoDivs");
  courseInfo["courseBreak2"] = createDiv().parent("coursePanel").class("infoDivs"); //yeah idk
  courseInfo["courseKeywords"] = createDiv().parent("coursePanel").class("infoDivs");

  //keyword panel UI
  keywordPanelHeight = 1 * height / 3;
  keywordPanel = createDiv().class("panels").id("keywordPanel").parent("mainContainer");
  keywordPanel.size(panelRightEdge, height - keywordPanelHeight);
  keywordPanel.position(0, keywordPanelHeight);
  keywordPanel.hide();

  keywordPanelButton = createButton('>>>').class("buttons");
  keywordPanelButton.position(0, keywordPanelHeight);
  keywordPanelButton.mousePressed(()=>{
    options.isShowingKeywords = !options.isShowingKeywords;
    
    //reset checkboxes
    for (let keybox of Object.keys(keywordCheckboxes)){
      keywordCheckboxes[keybox].checked(false);
    }
    
    //reset opacity (note: might be annoying if you want your selections to persist upon closing)
    for (let cNode of courses){
      cNode.button.html(cNode.course);
      cNode.fitsKeywords = true;
      cNode.col.setAlpha(1);
      if(cNode.col2 !== undefined){
        cNode.col2.setAlpha(1);
        cNode.button.elt.style.background = `radial-gradient(${cNode.col} 25%, ${cNode.col2}, ${cNode.col})`;
      } else {
        cNode.button.elt.style.background = cNode.col;
      }
    }

    if (options.isShowingKeywords){
      shiftCenterPos.x += panelRightEdge;
      if(options.isShowingPanel){shiftClusters()};
      keywordPanel.show();
      keywordPanelButton.html('<<<');
      keywordPanelButton.position(panelRightEdge, keywordPanelHeight);
    } else {
      shiftCenterPos.x -= panelRightEdge;
      options.isShowingPanel ? shiftClusters() : shiftClustersHome();
      keywordPanel.hide();
      keywordPanelButton.html('KEYWORDS >>>');
      keywordPanelButton.position(0, keywordPanelHeight);
    }
  });

  //keywords for keyword panel
  for (let keyword of mainKeywords){
    keywordCheckboxes[keyword] = createCheckbox(keyword, false).class("checkboxes").parent("keywordPanel");
    keywordCheckboxes[keyword].changed(keywordCheck);
  }

}

function initControlUI(){
  //control UI
  physicsButton = createButton("TURN PHYSICS OFF").class("buttons").position(20, height - 50).mousePressed(()=>{
    togglePhysics();
  });
  bounceButton = createButton("BOUNCE HOUSE ON").class("buttons").position(300, height - 50).mousePressed(()=>{
    toggleBounce();
  });
  mouseAvoidButton = createButton(options.isAvoidingMouse ? "IGNORE MOUSE" : "AVOID MOUSE").class("buttons").position(600, height - 50).mousePressed(()=>{
    options.isAvoidingMouse = !options.isAvoidingMouse;
    mouseAvoidButton.html(options.isAvoidingMouse ? "IGNORE MOUSE" : "AVOID MOUSE");
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

  //set all CNode physics variables here based on slider defaults
  updateNodePhysics();
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

  //get relationships for keyword comparison
  for (let cNode of courses) {
    cNode.checkRelationships(courses);
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

function keywordCheck(){
  for (let cNode of courses) {
    cNode.fitsKeywords = checkNodeForSelectedKeywords(cNode);
  }
}

function checkNodeForSelectedKeywords(cNode){ //hmm
  for (let keybox of Object.keys(keywordCheckboxes)){
    if (keywordCheckboxes[keybox].checked()){
      if (!cNode.keywords.includes(keybox)){
        //if any of the selected keywords are missing, return false
        return false;
      }
    }
  }
  //only return true if all selected keywords are present
  console.log(cNode.course);
  return true;
}

function togglePhysics(){ //separating b/c bounce mode needs to call this
  options.isPhysics = !options.isPhysics;
  physicsButton.html(options.isPhysics ? "TURN PHYSICS OFF" : "TURN PHYSICS ON");
  // options.isPhysics ? 
}

function toggleBounce(){
  options.isBounce = !options.isBounce;
  bounceButton.html(options.isBounce ? "BOUNCE HOUSE OFF" : "BOUNCE HOUSE ON");

  if (options.isBounce) {
    
    if (options.isPhysics){ //when we turn bounce on and physics is still on
      //store the values of physics the first time so we can reset them after
      lastPhysics.speed = speedSlider.value();
      lastPhysics.force = forceSlider.value();
      lastPhysics.friction = frictionSlider.value();

      // togglePhysics(); //need to wait a second for the nodes to be able to move
      bounceButton.hide(); //just to prevent them from clicking again too early and messing with physics toggle
      bounceDelay = setInterval(()=>{
        togglePhysics();
        bounceButton.show();
        clearInterval(bounceDelay);
      }, 1000);

      //change values to party mode
      speedSlider.value(10);
      forceSlider.value(10);
      frictionSlider.value(1);
      updateNodePhysics();

      //make the background no alpha so we get trails
      // if(options.isAlphaPaint){
        bg.setAlpha(0);
      // }

      //hiding physics button to not get confused
      physicsButton.hide();
      mouseAvoidButton.hide();
    }
    // bounceButton.html("BOUNCE HOUSE OFF");
  } else {
    if (!options.isPhysics){ //when we turn bounce off, reset physics to old values
      speedSlider.value(lastPhysics.speed);
      forceSlider.value(lastPhysics.force);
      frictionSlider.value(lastPhysics.friction);
      togglePhysics();
      updateNodePhysics();
      if(options.isAlphaPaint){
        bg.setAlpha(.03);
      }
      physicsButton.show();
      mouseAvoidButton.show();

    };
    // bounceButton.html("BOUNCE HOUSE ON");
  }
}

function updateNodePhysics(){
  for (let cNode of courses){
    cNode.maxSpeed = speedSlider.value();
    cNode.maxForce = forceSlider.value();
    cNode.friction = frictionSlider.value();
  }
}

function rotationCoords(x, y, angle){
  //getting vector from rotation around center
  //thanks chat-gpt
  let newX = x * cos(angle) - y * sin(angle);
  let newY = x * sin(angle) + y * cos(angle);
  return createVector(newX, newY);
}
