/*
    CA Curriculum Visualization
    Prototype v1
    
    node map generation from masterSheet csv
    August Luhrs and Despina Papadopolous
*/


//FOR FISHTANK -- EVENTUALLY WILL USE INSTANCE, PLACEHOLDER
// let hand; //png of cursor
let handX, handY; //mouseX mouseY
let hand = {
  cursor: null,
  width: 0,
  height: 0,
  pos: null,
  vel: null,
  acc: null
}

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
  //remote sending heading and mag

  // handX += data.x;
  // handY += data.y;
})



//design/UI variables
let fonts = {};
// let testColors = areaColors;
let mousePos;
let buttonsDiv, physicsButton, bounceButton, mouseAvoidButton;
let physicsDiv, speedSlider, forceSlider, frictionSlider;
let lastPhysics = {}; //for bounce mode reset TODO clean up
let speedDiv, forceDiv, frictionDiv;
let title; //ca title logo
let canvas, coursePanel, coursePanelButton;
let courseInfo = {}; //stores the divs for the diff class info stuff in the coursePanel
let panelLeftEdge; //TODO should have all the course panel stuff in own object
// let clusterCenter;
let bounceDelay; //stores the interval ID to clear the physics toggle in bounceToggle
let keywordPanel, keywordPanelButton;
let keywordCheckboxes = {};
let blobControlDiv, blobUnitDiv, wobbleOffsetDiv, wobbleMaxDiv, wobbleSpeedDiv; 
let wobbleSpeedSlider, wobbleOffsetSlider, wobbleMaxSlider, blobUnitSlider;
let otherDiv, familyControlDiv, familyNumDiv, familyNumSlider, alphaDiv, alphaSlider;
let designDiv, fontsDropdown, fontLoader;
let colorInputs = {};

let warningText = "";

//now that design is on own page, but want to keep changes up to date, 
//need to update prefix for path related strings
let pagePrefix = ( window.location.pathname == "/" ) ? "" : "../"; //hmm.... ../ works on main... why....
let isMainSite = ( window.location.pathname == "/" );

//csv variables
let masterSheet;
let courses = []; //stores the cNodes
let clusters = {}; //stores the vector locations of the web clusters by area
let reunion = {}; //stores course relationships by name as key

//MARK: defaults
//defaults --> settings // not mutable besides in control panel
let defaults = {
  allowedDistFromCluster: null, //will change in setup
  blobUnit: null, //scale of blobWobble/petals
  boundaryForce: null,
  clusterOffset: null,
  fadeAlpha: 0.03, // the hidden nodes alpha value
  familyOrbitSize: 4, //the minimum number of siblings and cousins
  frictionStart: 0.99,
  fontName: "tiltneon",
  forceMax: 2,
  forceStart: 0.25,
  idealSeparation: null,
  mouseRepel: null,
  nodeScale: 0.09, //9% of shorter side of window
  nodeSize: null,
  nodeSize_px: null,
  orbitRadius: null, //familyReunion spacing, even for now
  // orbitDistMax: null,
  outlineMax: 1.7, //for rainbow anim
  outlineSpeed: 5,
  rainbowSpacing: 6, //hueOffset
  speedMax: 4,
  speedStart: 0.8,
  subSteps: 8,
  titleSize: null,
  titleRatio: null,
  webOffset: null,
  wobbleOffset: 25, //0 = uniform blob pulse
  wobbleSpeed: 3.4, 
  wobbleMax: null, //scale of blob wobble anim
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

//MARK: state
let state = { //need to refactor this vs options
  bg: null,
  bgAlpha: 0.1,
  clusterCenter: null,  //center of cluster web, is shifted by panels opening
  isMobile: checkIfMobile(),
  selectedKeywords: [],
  selectedCluster: null,
  selectedCourse: null,
  mode: "default" //default, keyword, bounce
}

function preload(){
  // hand = loadImage(`${pagePrefix}assets/brand/ca_cursor.png`);
  masterSheet = loadTable(`${pagePrefix}data/master_5-1.csv`, "csv", "header");
  
  // title = loadImage("https://cdn.glitch.global/119042a0-d196-484e-b4d0-393548c41275/ca_title.png?v=1712723968514");
  font = loadFont("https://cdn.glitch.global/119042a0-d196-484e-b4d0-393548c41275/tiltneon.ttf?v=1712723959662");

  title = loadImage(`${pagePrefix}assets/brand/ca_pink_logo.png`);
  fonts["tiltneon"] = {name: "tiltneon", font: loadFont(`${pagePrefix}assets/fonts/fontTests/tiltneon.ttf`)};
  fonts["yk_med"] = {name: "yk_med", font: loadFont(`${pagePrefix}assets/fonts/fontTests/yk_med.ttf`)};
  fonts["ibmPlex_sans_med"] = {name: "ibmPlex_sans_med", font: loadFont(`${pagePrefix}assets/fonts/fontTests/ibmPlex_sans_med.ttf`)};
  fonts["ibmPlex_mono_med"] = {name: "ibmPlex_mono_med", font: loadFont(`${pagePrefix}assets/fonts/fontTests/ibmPlex_mono_med.ttf`)};
}

/*
function preload(){
  masterSheet = loadTable(`${pagePrefix}data/master_5-1.csv`, "csv", "header");
  title = loadImage(`${pagePrefix}assets/brand/ca_title.png`);
  fonts["tiltneon"] = {name: "tiltneon", font: loadFont(`${pagePrefix}assets/fonts/fontTests/tiltneon.ttf`)};
  fonts["yk_med"] = {name: "yk_med", font: loadFont(`${pagePrefix}assets/fonts/fontTests/yk_med.ttf`)};
  fonts["ibmPlex_sans_med"] = {name: "ibmPlex_sans_med", font: loadFont(`${pagePrefix}assets/fonts/fontTests/ibmPlex_sans_med.ttf`)};
  fonts["ibmPlex_mono_med"] = {name: "ibmPlex_mono_med", font: loadFont(`${pagePrefix}assets/fonts/fontTests/ibmPlex_mono_med.ttf`)};
}

function preload(){
  masterSheet = loadTable("data/master_5-1.csv", "csv", "header");
  title = loadImage("https://cdn.glitch.global/119042a0-d196-484e-b4d0-393548c41275/ca_title.png?v=1712723968514");
  font = loadFont("https://cdn.glitch.global/119042a0-d196-484e-b4d0-393548c41275/tiltneon.ttf?v=1712723959662");

  // title = loadImage("assets/brand/ca_title.png");
  fonts["tiltneon"] = {name: "tiltneon", font: loadFont("assets/fonts/fontTests/tiltneon.ttf")};
  fonts["yk_med"] = {name: "yk_med", font: loadFont("assets/fonts/fontTests/yk_med.ttf")};
  fonts["ibmPlex_sans_med"] = {name: "ibmPlex_sans_med", font: loadFont("assets/fonts/fontTests/ibmPlex_sans_med.ttf")};
  fonts["ibmPlex_mono_med"] = {name: "ibmPlex_mono_med", font: loadFont("assets/fonts/fontTests/ibmPlex_mono_med.ttf")};
}
*/

/**
 * 
 *  SETUP
 * 
 */
//MARK:setup
function setup() {
  //background and UI
  canvas = createCanvas(windowWidth, windowHeight);//stretches to fit whatever windowSize the user has
  canvas.parent("mainContainer");
  textAlign(CENTER, CENTER);
  textWrap(WORD);
  textFont(fonts[defaults.fontName].font); //default
  ellipseMode(CENTER);
  rectMode(CENTER);
  angleMode(DEGREES); //just for 360/7 areas
  colorMode(HSB, 360, 100, 100, 1);
  // colorMode(HSB, 1, 1, 1, 1); //normalizing for color _array
  // bg = color("#616708"); //olive
  state.bg = color("#aaef74"); //light pale green
  // (state.isMobile) ? state.bg = color("#aaef74") : state.bg = color("#74eeff");
  // state.bg = color('#aaff55'); // light green
  if(options.isAlphaPaint){
    state.bg.setAlpha(state.bgAlpha);
  }
  
  //mobile warning
  if (width < height){
    warningText = "NOT READY FOR MOBILE, PLEASE CHECK THIS OUT ON A COMPUTER";
  }

  //title logo
  // defaults.titleSize = width/8;
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

  defaults.titleSize = defaults.nodeSize;


  //distances from clusters to center of web and nodes to clusters
  defaults.webOffset = (-defaults.nodeSize * 4);
  defaults.clusterOffset = (-defaults.nodeSize * 1.3);
  defaults.idealSeparation = defaults.nodeSize;
  defaults.mouseRepel = defaults.idealSeparation * 4;
  defaults.boundaryForce = 1000;
  defaults.allowedDistFromCluster = defaults.nodeSize * 2.5;
  // shiftCenterPos = createVector(width * 0.36, height/2);
  state.clusterCenter = createVector(width/2, height/2);
  panelLeftEdge = width * .72; //course panel
  panelRightEdge = width * .15; //keyword panel
  defaults.orbitRadius = defaults.nodeSize * 1.5;

  //blob anim
  defaults.blobUnit = defaults.nodeSize / 4;
  defaults.wobbleMax = defaults.blobUnit * 2; //can adjust scale of wobble without messing with petal size

  //set up mousePos variable
  mousePos = createVector(0, 0);

  //main setup functions
  initClusters();
  initCourseNodes();
  initPanelUI();
  initControlUI();

  //hmm, easiest way to turn off testing stuff without errors?
  if (isMainSite) {
    document.getElementById("footer").style.display = "none";
    physicsButton.hide();
    bounceButton.hide();
    mouseAvoidButton.hide(); 
  } else {
    state.bg = color("#74eeff"); //blue color for test site
  }

  //cursor for fishtank control
  // cursor(hand);
  // cursor(`${pagePrefix}assets/brand/ca_cursor.png`);
  noCursor(); //using drawn one instead
  hand.cursor = new p5.Element(document.getElementById("custom-cursor"));
  hand.width = width * 0.15;
  hand.height = height * 0.05;
}

/**
 * 
 *  DRAW
 * 
 */
//MARK: draw
function draw() {
  background(state.bg);
  //CA logo in top left corner
  image(title, 10, 10, defaults.titleSize, defaults.titleSize * defaults.titleRatio);
  push();
  textSize(width/40)
  text(warningText, width/2, 25);
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

  //remote controlled cursor
  // image(hand, handX, handY, 80, 80);
  hand.cursor.position(hand.width, hand.height);

};

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

//MARK: controlUI
function initControlUI(){
  //control UI
  // buttonsDiv = createDiv()
  physicsButton = createButton("TURN MOTION OFF").class("buttons").position(20, height - 50).mousePressed(()=>{
    togglePhysics();
  });
  bounceButton = createButton("BOUNCE HOUSE ON").class("buttons").position(300, height - 50).mousePressed(()=>{
    toggleBounce();
  });
  mouseAvoidButton = createButton(options.isAvoidingMouse ? "IGNORE MOUSE" : "AVOID MOUSE").class("buttons").position(600, height - 50).mousePressed(()=>{
    options.isAvoidingMouse = !options.isAvoidingMouse;
    mouseAvoidButton.html(options.isAvoidingMouse ? "IGNORE MOUSE" : "AVOID MOUSE");
  });


  physicsDiv = createDiv("PHYSICS TESTING").parent("controlDiv").id("physicsDiv").class("controls");
  createDiv("- - - - - - - - - ").parent("physicsDiv").elt.style.setProperty('width', '100%');
  speedDiv = createDiv("maxSpeed").parent("physicsDiv").id("speedDiv");
  speedSlider = createSlider(0, defaults.speedMax, defaults.speedStart, 0.1).parent("speedDiv").changed(()=>{
    for (let cNode of courses) {
      cNode.maxSpeed = speedSlider.value();
    }
  });
  forceDiv = createDiv("maxForce").parent("physicsDiv").id("forceDiv");
  forceSlider = createSlider(0.1, defaults.forceMax, defaults.forceStart, 0.1).parent("forceDiv").changed(()=>{
    for (let cNode of courses) {
      cNode.maxForce = forceSlider.value();
    }
  });
  frictionDiv = createDiv("friction").parent("physicsDiv").id("frictionDiv");
  frictionSlider = createSlider(0, 1, defaults.frictionStart, 0.01).parent("frictionDiv").changed(()=>{
    for (let cNode of courses) {
      cNode.friction = frictionSlider.value();
    }
  });

  //set all CNode physics variables here based on slider defaults
  updateNodePhysics();

  //misc controls

  otherDiv = createDiv("OTHER CONTROLS").parent("controlDiv").id("otherDiv").class("controls");
  createDiv("- - - - - - - - - ").parent("otherDiv").elt.style.setProperty('width', '100%');
  familyControlDiv = createDiv().parent("otherDiv").id("familyControlDiv");
  familyNumDiv = createDiv(`min family members per orbit: ${defaults.familyOrbitSize}`).parent("familyControlDiv").id("familyNumDiv");
  familyNumSlider = createSlider(1, 12, defaults.familyOrbitSize, 1).parent("familyControlDiv").changed(()=>{
    defaults.familyOrbitSize = familyNumSlider.value();
    familyNumDiv.html(`min family members per orbit: ${defaults.familyOrbitSize}`);
    for (let cNode of courses){
      //TODO refactor
      cNode.familyMember = null; //will get reset immediately in checkFamilyPosition()
      cNode.generateFamilyReunion();
    }
  });
  createDiv("- - - - - - - - - ").parent("otherDiv").elt.style.setProperty('width', '100%');
  alphaDiv = createDiv("background transparency").parent("otherDiv").id("alphaDiv");
  alphaSlider = createSlider(0, 1, state.bgAlpha, 0.01).parent("alphaDiv").changed(()=>{
    state.bgAlpha = alphaSlider.value();
    state.bg.setAlpha(state.bgAlpha);
  });
  //design testing controls
  designDiv = createDiv("DESIGN TESTING").parent("controlDiv").id("designDiv").class("controls");
  createDiv("- - - - - - - - - ").parent("designDiv").elt.style.setProperty('width', '100%');
  fontsDropdown = createSelect().parent("designDiv").id("fontsDropdown");
  for (let font of Object.keys(fonts)){
    // fontsDropdown.option(font.name, font.font);
    fontsDropdown.option(font);
  }
  fontsDropdown.changed(()=>{
    textFont(fonts[fontsDropdown.selected()].font);
    document.body.style.setProperty('font-family', fontsDropdown.selected(), 'important'); //thanks Chat GPT
    // document.getElementById("mainContainer").style.setProperty('font-family', fontsDropdown.selected(), 'important'); //thanks Chat GPT
    // document.getElementsByClassName
    for (let cNode of courses){
      cNode.button.elt.style.setProperty('font-family', fontsDropdown.selected(), 'important');
    }
    console.log(fonts[fontsDropdown.selected()])
  });
  createDiv("- - - - - - - - - ").parent("designDiv").elt.style.setProperty('width', '100%');

  for (let area of Object.keys(areaColors)){
    let colorSwatch = createDiv(area).parent("designDiv").class("colorSwatch").id(`colorSwatch-${area}`);
    let colorHex = createDiv(areaColors[area]).parent("designDiv").class("colorSwatch").id(`colorHex-${area}`);
    colorInputs[area] = {
      area: area,
      hex: areaColors[area], 
      // input: createInput(areaColors[area]).parent("designDiv").class("inputs"),
      input: createColorPicker(areaColors[area]).parent("designDiv").class("inputs"),
    }
    colorInputs[area].input.changed(inputColorChange.bind(colorInputs[area]));
    colorSwatch.elt.style.setProperty('background-color', colorInputs[area].hex);
    colorHex.elt.style.setProperty('background-color', colorInputs[area].hex);
  }

  //anim testing controls
  blobControlDiv = createDiv('WOBBLE BLOB ANIM TESTING').parent("controlDiv").id("blobControlDiv").class("controls");
  createDiv("- - - - - - - - - ").parent("blobControlDiv").elt.style.setProperty('width', '100%');
  blobUnitDiv = createDiv(`blobUnit: ${defaults.blobUnit}`).parent("blobControlDiv").id("blobUnitDiv");
  blobUnitSlider = createSlider(defaults.nodeSize / 8, defaults.nodeSize, defaults.blobUnit, defaults.nodeSize / 16).parent("blobControlDiv").changed(()=>{
    defaults.blobUnit = blobUnitSlider.value();
    blobUnitDiv.html(`blobUnit: ${defaults.blobUnit}`);
  });
  wobbleOffsetDiv = createDiv('wobbleOffset').parent("blobControlDiv").id("wobbleOffsetDiv");
  wobbleOffsetSlider = createSlider(0.1, 40, defaults.wobbleOffset, 0.1).parent("blobControlDiv").changed(()=>{
    defaults.wobbleOffset = wobbleOffsetSlider.value();
    wobbleOffsetDiv.html(`wobbleOffset: ${defaults.wobbleOffset}`);
  });
  wobbleMaxDiv = createDiv('wobbleMax').parent("blobControlDiv").id("wobbleOffsetDiv");
  wobbleMaxSlider = createSlider(defaults.nodeSize / 8, defaults.nodeSize, defaults.wobbleMax, defaults.nodeSize / 8).parent("blobControlDiv").changed(()=>{
    defaults.wobbleMax = wobbleMaxSlider.value();
    wobbleMaxDiv.html(`wobbleMax: ${defaults.wobbleMax}`);
  });
  wobbleSpeedDiv = createDiv('wobbleSpeed').parent("blobControlDiv").id("wobbleSpeedDiv");
  wobbleSpeedSlider = createSlider(0.1, 20, defaults.wobbleSpeed, 0.1).parent("blobControlDiv").changed(()=>{
    defaults.wobbleSpeed = wobbleSpeedSlider.value();
    wobbleSpeedDiv.html(`wobbleSpeed: ${defaults.wobbleSpeed}`);
  });
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

//MARK:panelUI
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
      // cNode.isSelected = false; //turning off for panel to be optional for family reunion
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
  keywordPanelHeight = height / 8;
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
    
    keywordCheck();

    if (options.isShowingKeywords){
      // state.clusterCenter.x += panelRightEdge;
      if(options.isShowingPanel){shiftClusters()};
      keywordPanel.show();
      keywordPanelButton.html('<<<');
      keywordPanelButton.position(panelRightEdge, keywordPanelHeight);
    } else {
      // state.clusterCenter.x -= panelRightEdge;
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

function inputColorChange(){
  //binds to the color input for "this"
  // let code = this.input.value();
  let code = this.input.color();
  // if (code.length == 7 && code.startsWith("#")){
    this.hex = code.toString('#rrggbb');
    console.log(this.hex);
    updateClusterColors(this.area);
  // }
}

function keywordCheck(){
  for (let cNode of courses) {
    // cNode.fitsKeywords = checkNodeForSelectedKeywords(cNode);
    cNode.haveKeywordsChanged = true;
  }
}

function mousePressed(){
  //just using for cluster highlight atm
  if ( state.mode !== "default" ){ return; }

  for (let i = 0; i < 10; i++){
    if (i == 1){continue;};//skipping soul, is dumb b/c i dumb
    if (p5.Vector.dist(clusters[areas[i][0]].pos, mousePos) < defaults.nodeSize * 0.6){
      //TODO this is dumb, but want to reset canvas when clicking area to remove ghosts
      state.bg.setAlpha(1);
      background(state.bg);
      state.bg.setAlpha(state.bgAlpha); //ugh defaults vs state...
      // console.log(areas[i]);
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

//MARK: click
function nodeClick(node) {
  //when a node is clicked... as the name suggests...
  if(state.selectedCourse !== node.course){
    state.selectedCourse = node.course;
    state.mode = "family";
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
  } else {
    //reset
    state.selectedCourse = null;
    state.mode = "default";
    for (let cNode of courses){ //ugh TODO redo 'cNode' naming
      cNode.isSelected = false;
      cNode.shouldCheckCollision = true;
    }
    coursePanel.hide();
    shiftClustersHome();
    options.isShowingPanel = false;
  }
  
}

function nodeUpdates(){
  for (let cNode of courses){
    cNode.adjustSelfBeforeUpdate(); //checks for state/modes and toggles internal values
  }
  subStepUpdate(mousePos, 1);
}

function rotationCoords(x, y, angle){
  //getting vector from rotation around center
  //something something polar coordinates
  let newX = x * cos(angle) - y * sin(angle);
  let newY = x * sin(angle) + y * cos(angle);
  return createVector(newX, newY);
}

function shiftClusters(){
  //when side panel opens, move the clusters
  if (options.isShowingPanel){
    state.clusterCenter.x = width * 0.36;
    if (options.isShowingKeywords){
      state.clusterCenter.x += panelRightEdge/2; //TODO issue with new width
    }
  }

  //have all the nodes refresh if in family mode
  if (state.selectedCourse !== null) {
    for (let cNode of courses) {
      cNode.needsUpdate = true;
    }
  }
  
  push();
  // translate(state.clusterCenter.x, state.clusterCenter.y); //hmm
  clusters["CORE"].pos = state.clusterCenter;
  clusters["SOUL"].pos = state.clusterCenter;

  let angle = 360/8;
  for (let i = 2; i < 10; i++){ //skipping core and soul
    let clusterPos = rotationCoords(defaults.webOffset, 0, angle);
    clusterPos.x += state.clusterCenter.x; //so we don't have to translate anymore
    clusterPos.y += state.clusterCenter.y;
    clusters[areas[i][0]].pos = clusterPos;

    angle += 360/8;
  }
  pop();
}

function shiftClustersHome(){
  //when side panel closes, move the clusters back home
  state.clusterCenter.x = width/2;

  //have all the nodes refresh if in family mode
  if (state.selectedCourse !== null) {
    for (let cNode of courses) {
      cNode.needsUpdate = true;
    }
  }

  push();
  translate(width/2, height/2); //hmm
  clusters["CORE"].pos = state.clusterCenter;
  clusters["SOUL"].pos = state.clusterCenter;

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

//MARK: show
function showClusters(){
  if (state.mode == "family"){return;}//don't show if in keywords mode
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
      rect(state.clusterCenter.x, state.clusterCenter.y, defaults.nodeSize);
      noStroke();
      fill(0);
      text(state.selectedCluster, state.clusterCenter.x, state.clusterCenter.y, defaults.nodeSize);
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
  // options.isPhysics = !options.isPhysics;
  options.isMoving = !options.isMoving;
  physicsButton.html(options.isPhysics ? "TURN MOTION OFF" : "TURN MOTION ON");
}

function toggleBounce(){
  options.isBounce = !options.isBounce;
  bounceButton.html(options.isBounce ? "BOUNCE HOUSE OFF" : "BOUNCE HOUSE ON");
  options.isBounce? state.mode = "bounce" : state.mode = "default";
  if (options.isBounce) {
    
    // if (options.isPhysics){ //when we turn bounce on and physics is still on
      //store the values of physics the first time so we can reset them after
      lastPhysics.speed = speedSlider.value();
      lastPhysics.force = forceSlider.value();
      lastPhysics.friction = frictionSlider.value();

      // togglePhysics(); //need to wait a second for the nodes to be able to move
      // bounceButton.hide(); //just to prevent them from clicking again too early and messing with physics toggle
      // bounceDelay = setInterval(()=>{
        // togglePhysics();
      //   bounceButton.show();
      //   clearInterval(bounceDelay);
      // }, 1000);

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
        state.bg.setAlpha(0);
      // }

      //hiding physics button to not get confused
      // physicsButton.hide();
      // mouseAvoidButton.hide();
    // }
    // bounceButton.html("BOUNCE HOUSE OFF");
  } else {
    // if (!options.isMoving){ //when we turn bounce off, reset physics to old values
      speedSlider.value(lastPhysics.speed);
      forceSlider.value(lastPhysics.force);
      frictionSlider.value(lastPhysics.friction);
      // togglePhysics();
      updateNodePhysics();
      if(options.isAlphaPaint){
        state.bg.setAlpha(state.bgAlpha);
      }
      // physicsButton.show();
      // mouseAvoidButton.show();

      //turn collisions off so they go back home faster
      for (let cNode of courses){
        cNode.shouldCheckCollision = true;
      }

    // };
    // bounceButton.html("BOUNCE HOUSE ON");
  }
}

function updateClusterColors(area){
  for (let cluster of Object.keys(clusters)){
    if (cluster == area){
      clusters[cluster].color = color(colorInputs[area].hex);
      document.getElementById(`colorSwatch-${area}`).style.setProperty('background-color', colorInputs[area].hex);
      document.getElementById(`colorHex-${area}`).style.setProperty('background-color', colorInputs[area].hex);
      select(`#colorHex-${area}`).html(colorInputs[area].hex);
    }
  }
  for (let cNode of courses){
    cNode.updateColors();
  }
}

function updateNodePhysics(){
  for (let cNode of courses){
    cNode.maxSpeed = speedSlider.value();
    cNode.maxForce = forceSlider.value();
    cNode.friction = frictionSlider.value();
  }
}

//MARK: mobile functions
function checkIfMobile(){
  return /Mobi|Android/i.test(navigator.userAgent);
}
