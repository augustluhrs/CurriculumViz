/*
    CA Curriculum Visualization
    Prototype v1
    
    node map generation from masterSheet csv
    August Luhrs and Despina Papadopolous
*/

//design/UI variables
let font;
let mousePos;
let physicsButton, speedSlider, forceSlider, frictionSlider, bounceButton, mouseAvoidButton;
let lastPhysics = {}; //for bounce mode reset TODO clean up
let speedDiv, forceDiv, frictionDiv;
let title; //ca title logo
let canvas, coursePanel, coursePanelButton;
let courseInfo = {}; //stores the divs for the diff class info stuff in the coursePanel
let panelLeftEdge; //TODO should have all the course panel stuff in own object
let clusterCenter; //center of cluster web, is shifted by panels opening
let bounceDelay; //stores the interval ID to clear the physics toggle in bounceToggle

let keywordPanel, keywordPanelButton;
let keywordCheckboxes = {};


let warningText = "";

//csv variables
let masterSheet;
let courses = []; //stores the cNodes
let clusters = {}; //stores the vector locations of the web clusters by area

//defaults --> settings
let defaults = {
  allowedDistFromCluster: null, //will change in setup
  bg: null,
  boundaryForce: null,
  clusterOffset: null,
  fadeAlpha: 0.03, // the hidden nodes alpha value
  frictionStart: 0.99,
  forceMax: 2,
  forceStart: 0.25,
  idealSeparation: null,
  mouseRepel: null,
  nodeScale: 0.09, //9% of shorter side of window
  nodeSize: null,
  nodeSize_px: null,
  speedMax: 4,
  speedStart: 0.8,
  subSteps: 8,
  titleSize: null,
  titleRatio: null,
  webOffset: null,
}

//options/filters/visuals
let options = {
  isAlphaPaint: false,
  isAvoidingMouse: false,
  isBounce:false,
  isDraggable: false,
  isGravity: false,
  isFlocking: false,
  isKeywordWeighted: false, //for showing siblings/cousins
  isMoving: false,
  isPhysics: false,
  isShowingKeywords: false, //ugh naming, this is a panel too...
  isShowingPanel: false,
};
options.isAlphaPaint = true;
// options.isAvoidingMouse = true;
options.isMoving = true;
options.isPhysics = true;

let state = { //need to refactor this vs options
  bgAlpha: 0.1,
  selectedKeywords: [],
  selectedCluster: null,
  mode: "default" //default, keyword, bounce
}

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
  colorMode(HSB);
  // bg = color("#616708"); //olive
  defaults.bg = color("#aaef74"); //light pale green
  // defaults.bg = color('#aaff55'); // light green
  if(options.isAlphaPaint){
    defaults.bg.setAlpha(state.bgAlpha);
  }
  
  //mobile warning
  if (width < height){
    warningText = "NOT READY FOR MOBILE, PLEASE CHECK THIS OUT ON A COMPUTER";
  }

  //title logo
  defaults.titleSize = width/8;
  defaults.titleRatio = title.height / title.width;
  
   //mobile warning
  if (width < height){
    warningText = "NOT READY FOR MOBILE, PLEASE CHECK THIS OUT ON A COMPUTER";
  }

  //setup the css element properties
  //get the relative node size
  if (width > height) { 
    defaults.nodeSize = height * defaults.nodeScale; 
  } else {
    defaults.nodeSize = width * defaults.nodeScale;
  }
  //turn to string for css
  defaults.nodeSize_px = defaults.nodeSize.toString();
  defaults.nodeSize_px += 'px';
  textSize(defaults.nodeSize / 6);

  //distances from clusters to center of web and nodes to clusters
  defaults.webOffset = (-defaults.nodeSize * 4);
  defaults.clusterOffset = (-defaults.nodeSize * 1.3);
  defaults.idealSeparation = defaults.nodeSize;
  defaults.mouseRepel = defaults.idealSeparation * 4;
  defaults.boundaryForce = 1000;
  defaults.allowedDistFromCluster = defaults.nodeSize * 2.5;
  // shiftCenterPos = createVector(width * 0.31, height/2);
  clusterCenter = createVector(width/2, height/2);
  panelLeftEdge = width * .72; //course panel
  panelRightEdge = width * .1; //keyword panel

  //set up mousePos variable
  mousePos = createVector(0, 0);

  //main setup functions
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
  background(defaults.bg);
  //CA logo in top left corner
  image(title, 10, 10, defaults.titleSize, defaults.titleSize * defaults.titleRatio);
  
  push();
  textSize(defaults.nodeSize / 3);
  text(warningText, width/2, height/10);
  pop();

  //draw the clusters (checks for mode first)
  showClusters();

  // node updates and animation calculations
  // if (options.isAvoidingMouse){
    mousePos.x = mouseX;
    mousePos.y = mouseY;
  // }
  if (options.isMoving){ 
    //run the physics updates
    nodeUpdates();

  }
  for (let cNode of courses) {
    //draw the nodes
    cNode.show(); 
  } 
}

function initClusters(){
  //get the web cluster locations per area
  push();
  // translate(width/2, height/2);
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
    let clusterPos = rotationCoords(defaults.webOffset, 0, angle);
    clusterPos.x += width/2;
    clusterPos.y += height/2;
    clusters[areas[i][0]] = {
      color: color(areas[i][1]),
      pos: clusterPos,
      count: 0,
      currentIndex: 0, //for offset counting
    };

    angle += 360/8;
  }
  pop();
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
  speedSlider = createSlider(0, defaults.speedMax, defaults.speedStart, 0.1).parent("speedDiv").changed(()=>{
    for (let cNode of courses) {
      cNode.maxSpeed = speedSlider.value();
    }
  });
  forceDiv = createDiv("maxForce").parent("controlDiv").id("forceDiv").class("controls");
  forceSlider = createSlider(0.1, defaults.forceMax, defaults.forceStart, 0.1).parent("forceDiv").changed(()=>{
    for (let cNode of courses) {
      cNode.maxForce = forceSlider.value();
    }
  });
  frictionDiv = createDiv("friction").parent("controlDiv").id("frictionDiv").class("controls");
  frictionSlider = createSlider(0, 1, defaults.frictionStart, 0.01).parent("frictionDiv").changed(()=>{
    for (let cNode of courses) {
      cNode.friction = frictionSlider.value();
    }
  });

  //set all CNode physics variables here based on slider defaults
  updateNodePhysics();
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
  courseInfo["courseTitle"] = createDiv("COURSE TITLE").parent("coursePanel").class("infoDivs").id("courseTitle");
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

  keywordPanelButton = createButton('KEYWORDS >>>').class("buttons");
  keywordPanelButton.position(0, keywordPanelHeight);
  keywordPanelButton.mousePressed(()=>{
    options.isShowingKeywords = !options.isShowingKeywords;
    
    //reset checkboxes
    for (let keybox of Object.keys(keywordCheckboxes)){
      keywordCheckboxes[keybox].checked(false);
    }
    
    //reset opacity (note: might be annoying if you want your selections to persist upon closing)
    //don't auto show/hide if selected cluster
    //TODO refactor and put this in node class
    // if (state.selectedCluster == null){
    //   for (let cNode of courses){
    //     cNode.button.html(cNode.course);
    //     cNode.fitsKeywords = true;
    //     cNode.col.setAlpha(1);
    //     if(cNode.col2 !== undefined){
    //       cNode.col2.setAlpha(1);
    //       cNode.button.elt.style.background = `radial-gradient(${cNode.col} 25%, ${cNode.col2}, ${cNode.col})`;
    //     } else {
    //       cNode.button.elt.style.background = cNode.col;
    //     }
    //   }
    // } else {
      keywordCheck();
    // }
    

    if (options.isShowingKeywords){
      // clusterCenter.x += panelRightEdge;
      if(options.isShowingPanel){shiftClusters()};
      keywordPanel.show();
      keywordPanelButton.html('<<<');
      keywordPanelButton.position(panelRightEdge, keywordPanelHeight);
    } else {
      // clusterCenter.x -= panelRightEdge;
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

function keywordCheck(){
  for (let cNode of courses) {
    // cNode.fitsKeywords = checkNodeForSelectedKeywords(cNode);
    cNode.haveKeywordsChanged = true;
  }
}

function mousePressed(){
  //just using for cluster highlight atm
  for (let i = 0; i < 10; i++){
    if (i == 1){continue;};//skipping soul, is dumb b/c i dumb
    if (p5.Vector.dist(clusters[areas[i][0]].pos, mousePos) < defaults.nodeSize * 0.6){
      if (state.selectedCluster == null){
        state.selectedCluster = areas[i][0];
      } else if (i == 0) { //clicking on current cluster to reset (is in core position)
        state.selectedCluster = null;
      }

      for (let cNode of courses){
        cNode.hasClusterSelectionChanged = true;
      }
    }
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

  options.isShowingPanel = true;
  shiftClusters();
}

function nodeUpdates(){
  for (let cNode of courses){
    cNode.adjustSelfBeforeUpdate(); //checks for state/modes and toggles internal values
  }
  subStepUpdate(mousePos, 1);
}

function rotationCoords(x, y, angle){
  //getting vector from rotation around center
  //thanks chat-gpt
  let newX = x * cos(angle) - y * sin(angle);
  let newY = x * sin(angle) + y * cos(angle);
  return createVector(newX, newY);
}

function shiftClusters(){
  //when side panel opens, move the clusters
  if (options.isShowingPanel){
    clusterCenter.x = width * 0.31;
    if (options.isShowingKeywords){
      clusterCenter.x += panelRightEdge;
    }
  }
  
  push();
  // translate(clusterCenter.x, clusterCenter.y); //hmm
  clusters["CORE"].pos = clusterCenter;
  clusters["SOUL"].pos = clusterCenter;

  let angle = 360/8;
  for (let i = 2; i < 10; i++){ //skipping core and soul
    let clusterPos = rotationCoords(defaults.webOffset, 0, angle);
    clusterPos.x += clusterCenter.x; //so we don't have to translate anymore
    clusterPos.y += clusterCenter.y;
    clusters[areas[i][0]].pos = clusterPos;

    angle += 360/8;
  }
  pop();
}

function shiftClustersHome(){
  //when side panel closes, move the clusters back home
  clusterCenter.x = width/2;

  push();
  translate(width/2, height/2); //hmm
  clusters["CORE"].pos = clusterCenter;
  clusters["SOUL"].pos = clusterCenter;

  let angle = 360/8;
  for (let i = 2; i < 10; i++){ //skipping core and soul
    let clusterPos = rotationCoords(defaults.webOffset, 0, angle);
    clusterPos.x += width/2; //so we don't have to translate anymore
    clusterPos.y += height/2;
    clusters[areas[i][0]].pos = clusterPos;

    angle += 360/8;
  }
  pop();
}

function showClusters(){
  if (state.mode == "keywords"){return;}//don't show if in keywords mode
  push();
  noStroke();
  if (state.selectedCluster == null){ //need to figure out what the mode vs options pattern is...
    for (let cluster of Object.keys(clusters)){
      if (cluster == "SOUL") {continue;}
      stroke(255);
      strokeWeight(4);
      fill(clusters[cluster].color);
      rect(clusters[cluster].pos.x, clusters[cluster].pos.y, defaults.nodeSize);
      noStroke();
      fill(0);
      text(cluster, clusters[cluster].pos.x, clusters[cluster].pos.y, defaults.nodeSize);
    }
  } else { //if clicked on one
    stroke(255);
    strokeWeight(4);
    //TODO refactor, add cluster class and fix the center pos / shift stuff
    if (options.isShowingPanel){
      fill(clusters[state.selectedCluster].color);
      rect(clusterCenter.x, clusterCenter.y, defaults.nodeSize);
      noStroke();
      fill(0);
      text(state.selectedCluster, clusterCenter.x, clusterCenter.y, defaults.nodeSize);
    } else {
      fill(clusters[state.selectedCluster].color);
      rect(width/2, height/2, defaults.nodeSize);
      noStroke();
      fill(0);
      text(state.selectedCluster, width/2, height/2, defaults.nodeSize);
    }
  }
  pop();
}

function subStepUpdate(mousePos, subStep){
  // let stepCourses = structuredClone(coursesCopy);
  // let stepCourses = JSON.parse(JSON.stringify(coursesCopy));
  let coursesCopy = [];
  for (let cNode of courses){
    let nodeCopy = {
      course: cNode.course,
      pos: createVector(cNode.pos.x, cNode.pos.y), //le sigh
      hasCollisions: cNode.hasCollisions, //needs this for the collision pass through to work
    }
    coursesCopy.push(nodeCopy);
  }
  
  // for (let cNode of coursesCopy){ //need two diff courses array so later don't have earlier's changes
  for (let cNode of courses){ //need two diff courses array so later don't have earlier's changes
    cNode.updateAccFromState(mousePos, coursesCopy, 1/defaults.subSteps);
    cNode.updatePos(1/defaults.subSteps);
  }

  subStep++;
  if (subStep > defaults.subSteps){
    // return nextCourses;
    return;
  } else {
    subStepUpdate(mousePos, subStep);
  }
}

function togglePhysics(){ //separating b/c bounce mode needs to call this
  options.isPhysics = !options.isPhysics;
  physicsButton.html(options.isPhysics ? "TURN PHYSICS OFF" : "TURN PHYSICS ON");
}

function toggleBounce(){
  options.isBounce = !options.isBounce;
  bounceButton.html(options.isBounce ? "BOUNCE HOUSE OFF" : "BOUNCE HOUSE ON");
  options.isBounce? state.mode = "bounce" : state.mode = "default";
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
      speedSlider.value(defaults.speedMax);
      forceSlider.value(defaults.forceMax);
      frictionSlider.value(1);
      updateNodePhysics();

      //give them all a random start direction
      for (let cNode of courses){
        cNode.vel = createVector(random(-1, 1), random(-1, 1))
      }

      //make the background no alpha so we get trails
      // if(options.isAlphaPaint){
        defaults.bg.setAlpha(0);
      // }

      //hiding physics button to not get confused
      physicsButton.hide();
      // mouseAvoidButton.hide();
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
        defaults.bg.setAlpha(state.bgAlpha);
      }
      physicsButton.show();
      // mouseAvoidButton.show();

      //turn collisions off so they go back home faster
      for (let cNode of courses){
        cNode.shouldCheckCollision = true;
      }

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
