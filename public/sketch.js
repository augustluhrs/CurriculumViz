/*
    CA Curriculum Visualization
    Prototype v0
    
    August Luhrs and Despina Papadopolous
*/

//MARK: testing


//design/UI variables -- TODO should just init before their functions... starting to do that
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
let searchDiv, searchInput, searchResults;
let searchButtons = [];

let warningText = "";

//now that design is on own page, but want to keep changes up to date, 
//need to update prefix for path related strings
let pagePrefix = ( window.location.pathname == "/" ) ? "" : "../"; //hmm.... ../ works on main... why....
let isMainSite = ( window.location.pathname == "/" );

//table variables
// let masterSheet;
let tableCourses = {}; //from the server, loaded from db / api
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
  cycleInterval: 20000, //20 seconds cycle
  fadeAlpha: 0.03, // the hidden nodes alpha value
  familyOrbitSize: 4, //the minimum number of siblings and cousins
  frictionStart: 0.99,
  fontName: "tiltneon",
  forceMax: 2,
  forceStart: 0.25,
  idealSeparation: null,
  keywordWeights: {
    //how much relationships are worth in keyword comparison
    besties: 10, //share primaries
    pals: 5, //my primary is their secondary
    workfriends: 2, //we share secondaries (no check for their primary is intentional)
  },
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
  isCycling: false, // random selection cycle
  isDraggable: false,
  isGravity: false,
  isFlocking: false,
  isKeywordWeighted: false, //for showing siblings/cousins
  isMoving: false,
  isPhysics: false,
  isShowingKeywords: false, //ugh naming, this is a panel too...
  isShowingPanel: false,
};
//mode toggles for testing
options.isAlphaPaint = true;
// options.isAvoidingMouse = true;
options.isMoving = true;
options.isPhysics = true;

//MARK: state
let state = { //need to refactor this vs options
  bg: null,
  bgAlpha: 0.1,
  clusterCenter: null,  //center of cluster web, is shifted by panels opening
  // cycleTimer: 0, //counts up to defaults.cycleInterval
  cycleLastTime: 0,
  isMobile: checkIfMobile(),
  isMouseInOrbit: false,
  selectedKeywords: [],
  selectedCluster: null,
  selectedCourse: null,
  semester: "ALL",
  shouldCheckOrbit: false,
  mode: "default" //default, keyword, bounce, cycle
}

function preload(){  
  // masterSheet = loadTable(`${pagePrefix}data/master_12-15.csv`, "csv", "header");
  // title = loadImage("https://cdn.glitch.global/119042a0-d196-484e-b4d0-393548c41275/ca_title.png?v=1712723968514");
  title = loadImage("https://cdn.glitch.global/119042a0-d196-484e-b4d0-393548c41275/ca_pink_logo.png?v=1730229378674");
  font = loadFont("https://cdn.glitch.global/119042a0-d196-484e-b4d0-393548c41275/tiltneon.ttf?v=1712723959662");

  // title = loadImage(`${pagePrefix}assets/brand/ca_title.png`);
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
  // state.bg = color("#aaef74"); //light pale green
  state.bg = color("#eeffff"); //ithai rev. Nov 24 -- light grey
  // (state.isMobile) ? state.bg = color("#aaef74") : state.bg = color("#74eeff");
  // state.bg = color('#aaff55'); // light green
  if(options.isAlphaPaint){
    state.bg.setAlpha(state.bgAlpha);
  }
  
  //mobile warning
  if (width < height){
    warningText = "NOT READY FOR MOBILE, PLEASE CHECK THIS OUT ON A COMPUTER";
  }

  //title logo and curve
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
  // shiftCenterPos = createVector(width * 0.36, height/2);
  state.clusterCenter = createVector(width/2, height/2);
  panelLeftEdge = width * .72; //course panel
  panelRightEdge = width * .15; //keyword panel
  defaults.orbitRadius = defaults.nodeSize * 1.25;


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
  initSearchUI();
  initModeUI();

  //hmm, easiest way to turn off testing stuff without errors?
  if (isMainSite) {
    document.getElementById("footer").style.display = "none";
    physicsButton.hide();
    bounceButton.hide();
    mouseAvoidButton.hide(); 
  } else {
    state.bg = color("#74eeff"); //blue color for test site
  }
}

/**
 * 
 *  MARK: DRAW
 * 
 */

function draw() {
  background(state.bg);
  //CA logo in top left corner
  image(title, 10, 10, defaults.titleSize, defaults.titleSize * defaults.titleRatio);
  push();
  textSize(width/40)
  text(warningText, width/2, height * .15);

  //curved text along logo
  showTextCurve("click to reset");
  pop();
  //draw the clusters (checks for mode first)
  showClusters();

  // node updates and animation calculations
  // if (options.isAvoidingMouse){
    mousePos.x = mouseX;
    mousePos.y = mouseY;
  // }

  //cycle mode timer interval
  if (options.isCycling){
    if (millis() - state.cycleLastTime >= defaults.cycleInterval){
      //pick random node and click it
      let randNode = random(courses);
      randNode.click();
      state.cycleLastTime = millis();
    }
  }

  //check for spiral overlap so orbit stops
  if (state.mode == "family"){
    //check for mouse being in outer orbit, if so, stop animations
    let mDist = dist(mousePos.x, mousePos.y, state.clusterCenter.x, state.clusterCenter.y);
    // console.log(mDist/width); //.2 - .35 
    if (mDist/width >= 0.2 && mDist/width <= 0.35){
      if (state.shouldCheckOrbit){ //need a flag so doesn't do this on first click
        state.isMouseInOrbit = true;
      }
    } else {
      if (!state.shouldCheckOrbit){
        state.shouldCheckOrbit = true; //TODO ugh
      }
      state.isMouseInOrbit = false;
    }

  }
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

//MARK: controlUI
let keywordWeightsDiv;
let bestiesWeightSlider, palsWeightSlider, workfriendsWeightSlider;
// keywordWeights: {
//   //how much relationships are worth in keyword comparison
//   besties: 10, //share primaries
//   pals: 5, //my primary is their secondary
//   workfriends: 2, //we share secondaries (no check for their primary is intentional)
// },
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
  createDiv("- - - - - - - - - ").parent("otherDiv").elt.style.setProperty('width', '100%');
  keywordWeightsDiv = createDiv("keyword weights").parent("otherDiv").id("keywordWeightsDiv");
  bestiesDiv = createDiv(`besties: ${defaults.keywordWeights.besties}`).parent("keywordWeightsDiv").id("bestiesDiv");
  bestiesWeightSlider = createSlider(1, 20, defaults.keywordWeights.besties, 1).parent("keywordWeightsDiv").changed(()=>{
    defaults.keywordWeights.besties = bestiesWeightSlider.value();
    bestiesDiv.html(`besties: ${defaults.keywordWeights.besties}`);
    for (let cNode of courses){
      //TODO refactor
      cNode.familyMember = null; //will get reset immediately in checkFamilyPosition()
      cNode.checkRelationships(courses);
    }
  });
  palsDiv = createDiv(`pals: ${defaults.keywordWeights.pals}`).parent("keywordWeightsDiv").id("palsDiv");
  palsWeightSlider = createSlider(1, 20, defaults.keywordWeights.pals, 1).parent("keywordWeightsDiv").changed(()=>{
    defaults.keywordWeights.pals = palsWeightSlider.value();
    palsDiv.html(`pals: ${defaults.keywordWeights.pals}`);
    for (let cNode of courses){
      //TODO refactor
      cNode.familyMember = null; //will get reset immediately in checkFamilyPosition()
      cNode.checkRelationships(courses);
    }
  });
  workfriendsDiv = createDiv(`workfriends: ${defaults.keywordWeights.workfriends}`).parent("keywordWeightsDiv").id("workfriendsDiv");
  workfriendsWeightSlider = createSlider(1, 20, defaults.keywordWeights.workfriends, 1).parent("keywordWeightsDiv").changed(()=>{
    defaults.keywordWeights.workfriends = workfriendsWeightSlider.value();
    workfriendsDiv.html(`workfriends: ${defaults.keywordWeights.workfriends}`);
    for (let cNode of courses){
      //TODO refactor
      cNode.familyMember = null; //will get reset immediately in checkFamilyPosition()
      cNode.checkRelationships(courses);
    }
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

async function getTableCourses(){
  try {
    const response = await fetch("/data"); // Fetch JSON from the server
    const data = await response.json(); // Convert response to JSON
    console.log("Received Data:", data); // Debugging output
    return data;
  } catch (err) {
    console.log(err);
  }
}

//MARK: initCourseNodes
async function initCourseNodes(){
  //tableCourses fetched from server, json object of course info
  tableCourses = await getTableCourses();
  for (let [course, courseInfo] of Object.entries(tableCourses)){
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
    if (cNode.imageDefault == null) {continue;}
    // cNode.imageDefault.img = loadImage(cNode.imageDefault.url); //doing this as elt instead for now


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
  //default image
  courseInfo["courseImage"] = createDiv().id("courseImage").parent("coursePanel").class("infoDivs");
    // .position()
  // courseInfo["courseImage"] = createImg().parent("coursePanel").class("infoDivs");

  //keyword panel UI
  keywordPanelHeight = height * 0.4;
  keywordPanel = createDiv().class("panels").id("keywordPanel").parent("mainContainer");
  keywordPanel.size(panelRightEdge, height * 0.5);
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
      keywordPanelButton.position(panelRightEdge - keywordPanelButton.width, keywordPanelHeight);
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

//MARK: mode UI
//eventually should move keyword from above function to its own
let modePanel;
let semesterDropdown;
// let semesterToggleDiv, fallButton, springButton, occasionalButton; 
// let semesterButtons = [];
let semesterColors = [ //when toggled on, else just normal button color
  {bg: "#e1a834", col: "#8a00ed"}, //fall
  {bg: "#99c800", col: "#0070ed"}, //spring
  {bg: "#7cf4f1", col: "#ff92fb"}, //occasional
  {bg: "#f2f2f2", col: "#0097a7"}, //default
];

function initModeUI(){
  //for the various mode UI (feature toggles, options)
  
  modePanel = createDiv().class("panels").id("modePanel").parent("mainContainer");
  modePanel.size(panelRightEdge, defaults.titleSize * 0.3);
  modePanel.position(0, height * 0.3); 
  // modePanel.size(width * 0.25, defaults.titleSize * 0.3);
  // modePanel.position(panelLeftEdge - modePanel.width * 1.15, defaults.titleSize * 0.1); 
  //TODO need to come up with a design grid for this, this is going to get really bad
  // modePanel.position(defaults.titleSize * 3.15, defaults.titleSize * 0.1);
  // modePanel.hide();

  semesterDiv = createDiv().class("panels").parent("modePanel").id("semesterDiv");
  semesterDiv.style("margin", "2%"); //TODO really need to stick to one way/place of setting style
  semesterDiv.style("padding", "2%");
  semesterDiv.style("height", "90%");

  semesterTextDiv = createDiv("Filter by Semester:").parent("semesterDiv").id("semesterTextDiv");
  semesterTextDiv.style("font-size", "125%");

  semesterDropdown = createSelect().class("dropdowns").parent("semesterDiv");
  semesterDropdown.option("FALL");
  semesterDropdown.option("SPRING");
  semesterDropdown.option("OCCASIONAL");
  semesterDropdown.option("ALL");
  semesterDropdown.selected("ALL");
  semesterDropdown.changed(switchSemesterView);

  // fallButton = createButton("FALL").class("buttons").parent("semesterToggleDiv");
  // fallButton.mousePressed(switchSemesterView.bind({semester: "FALL"}));

  // springButton = createButton("SPRING").class("buttons").parent("semesterToggleDiv");
  // springButton.mousePressed(switchSemesterView.bind({semester: "SPRING"}));

  // occasionalButton = createButton("OCCASIONAL").class("buttons").parent("semesterToggleDiv");
  // occasionalButton.mousePressed(switchSemesterView.bind({semester: "OCCASIONAL"}));

  // semesterButtons = [fallButton, springButton, occasionalButton];
  // for (let butt of semesterButtons){ //set all at start to default
  //   butt.style("width", `${semesterToggleDiv.width/4}px`);
  //   butt.style("height", "auto");
  //   butt.style("background-color", semesterColors[3].bg);
  //   butt.style("color", semesterColors[3].col);
  // }
}

function switchSemesterView(){

  let sem = semesterDropdown.selected();
  console.log(sem);
  if (sem == "ALL"){
    semesterDropdown.style("background-color", semesterColors[3].bg);
    semesterDropdown.style("color", semesterColors[3].col);
    state.semester = "ALL";
  }
  if (sem == "FALL"){
    semesterDropdown.style("background-color", semesterColors[0].bg);
    semesterDropdown.style("color", semesterColors[0].col);
    state.semester = "FALL";
  }
  if (sem == "SPRING"){
    semesterDropdown.style("background-color", semesterColors[1].bg);
    semesterDropdown.style("color", semesterColors[1].col);
    state.semester = "SPRING";
  }
  if (sem == "OCCASIONAL"){
    semesterDropdown.style("background-color", semesterColors[2].bg);
    semesterDropdown.style("color", semesterColors[2].col);
    state.semester = "OCCASIONAL";
  }
  for (let cNode of courses){
    cNode.checkVisibility(); //TODO refactor
  }

    // for (let butt of semesterButtons){
    //   //reset all first
    //   butt.style("background-color", semesterColors[3].bg);
    //   butt.style("color", semesterColors[3].col);
    // }
    // if (state.semester == this.semester){
    //   state.semester = "ALL";
    //   for (let cNode of courses){
    //     cNode.checkVisibility(); //TODO refactor
    //   }
    //   return; //toggling off b/c clicked same as active
    // } 
  
    // if (this.semester == "FALL"){
    //   fallButton.style("background-color", semesterColors[0].bg);
    //   fallButton.style("color", semesterColors[0].col);
    //   state.semester = "FALL";
    // }
    // if (this.semester == "SPRING"){
    //   springButton.style("background-color", semesterColors[1].bg);
    //   springButton.style("color", semesterColors[1].col);
    //   state.semester = "SPRING";
    // }
    // if (this.semester == "OCCASIONAL"){
    //   occasionalButton.style("background-color", semesterColors[2].bg);
    //   occasionalButton.style("color", semesterColors[2].col);
    //   state.semester = "OCCASIONAL";
    // }
}

//MARK: search UI
let nodesMatchingSearch = [];
function initSearchUI(){
  //let searchWidth
  // searchDiv = createDiv().id("searchDiv").parent("mainContainer");
  searchDiv = createDiv().class("panels").id("searchDiv").parent("mainContainer");
  // searchDiv.size(defaults.titleSize * 2, defaults.titleSize); //orig height defaults.titleSize * defaults.titleRatio but that's same
  searchDiv.size(panelRightEdge * 0.5, defaults.titleSize * 0.15)
  searchDiv.position(0, height * 0.25);
  
  // searchDiv.position(defaults.titleSize * 1.25, 0);
  // searchDiv.hide();
  searchIconDiv = createDiv("🔎").id("searchIconDiv").parent("searchDiv");
  

  searchInput = createInput("search").class("inputs").id("searchInput").parent("searchDiv");
  // searchInput.size(defaults.titleSize * 1.8, defaults.titleSize * 0.25);
  // searchInput.size(panelLeftEdge, defaults.titleSize * 0.3);
  searchInput.changed(()=>{
    //no more buttons, just store results in global array, then check in courseNode.checkVisibility()
    searchDiv.style("z-index", 0);
    if (searchInput.value() == "" || searchInput.value() == "search"){
      nodesMatchingSearch = [];
      // return;
    } else {
      //search function in modules/search.js
      let terms = searchInput.value().split(" ");
      // let results = search(terms);
      nodesMatchingSearch = search(terms);
    }
    
    if (nodesMatchingSearch.length == 0){
      for (let course of courses){
        course.checkVisibility();
      }
      return;
    }
    searchDiv.style("z-index", 9999);
    for (let course of courses){
      course.checkVisibility();
    }
  }); 
  // searchInput.changed(()=>{
  //   for (let sb of searchButtons){
  //     sb.remove();
  //   }
  //   searchButtons = [];
  //   searchResults.style("background-color", "rgba(255, 255, 255, 0)");
  //   searchDiv.style("z-index", 0);
  //   if (searchInput.value() == ""){return;}
  //   //search function in modules/search.js
  //   let terms = searchInput.value().split(" ");
  //   let results = search(terms);
  //   if (results.length == 0){return;}
  //   searchResults.style("background-color", "rgba(255, 255, 255, 0.83)");
  //   searchDiv.style("z-index", 9999);

  //   for (let result of results){
  //     //already sorted, so just make div and add to parent
  //     let cN = result[0]; //the course Node is the first element, second is numHits
  //     searchButtons.push(
  //       createButton(cN.course).class("searchButtons").parent("searchResults").mousePressed(()=>{
  //       // cN.click().bind(cN);
  //       cN.click();
  //       }).style("background-color", areaColors[cN.area])
  //     );
  //   }
  // });

  // searchResults = createDiv().class("scrollBox").id("searchResults").parent("searchDiv");
  // searchResults.size()

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

//MARK: mousePressed
function mousePressed(){
  //TODO -- this is just a temp fix for clicking logo to reset
  if (mouseX < defaults.titleSize * 1.2 && mouseY < defaults.titleSize * 1.2){
    window.location.reload();
  }

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

function keyPressed(){
  //using this as a quick secret toggle for fishtank cycle
  if (keyCode == 187){ //187 is "="
    if (!options.isCycling){
      // semesterDropdown.selected("FALL");
      options.isCycling = true;
      state.mode = "family";
      random(courses).click();
    } else {
      // semesterDropdown.selected("ALL");
      options.isCycling = false;
      // state.cycleTimer = millis();
      state.cycleLastTime = millis();
      state.mode = "default";
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
    if (node.professor == undefined){ 
      courseInfo.courseShort.html("TBA")
    } else {
      courseInfo.courseShort.html(node.professor);
    }
    courseInfo.courseProfessor.html(node.professor);
    if (node.short == undefined){ 
      courseInfo.courseShort.html("")
    } else {
      courseInfo.courseShort.html(node.short);
    }
    // courseInfo.courseKeywords.html(node.secondaryKeywords);

    //default image test //second param is alt text TODO
    // if (courseInfo.courseImage.elt.hasChildNodes()){
    if (courseInfo.courseImage.elt.children.length > 0){
      // select("defaultImage").elt.remove();
      courseInfo.courseImage.elt.children[0].remove(); //i know there's a simpler way, i'm tired
    }

    if (node.imageDefault != null){
      let dfImg = createImg(node.imageDefault.url, node.course, 'anonymous', ()=>{
        //loaded callback
        // console.log(dfImg);
        let aspectRatio = dfImg.width / dfImg.height;
        // console.log(aspectRatio);
        // dfImg.size(constrain(aspectRatio * coursePanel.width * 0.6, 0, coursePanel.width), (1/aspectRatio) * coursePanel.width * 0.6 )

        //quick hack
        if (aspectRatio >= 1){
          dfImg.size(coursePanel.width * 0.7, (1/aspectRatio) * coursePanel.width * 0.7);
        } else {
          dfImg.size(aspectRatio * coursePanel.width * 0.7, coursePanel.width * 0.7);

        }

      })
      .id("defaultImage") //just so can remove easily later
      .class("panelImage")
      // .size(coursePanel.width * 0.6, coursePanel.width * 0.6) //TODO do this in class?
      .parent(courseInfo.courseImage.elt);
      
    }
    
    

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

    //default image test
    // coursePanel.courseImage.elt.getChildren([name])
    // select("defaultImage").elt.remove();
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
      stroke(0);
      strokeWeight(2);
      fill(clusters[cluster].color);
      rect(clusters[cluster].pos.x, clusters[cluster].pos.y, defaults.nodeSize);
      noStroke();
      fill(0);
      text(cluster, clusters[cluster].pos.x, clusters[cluster].pos.y, defaults.nodeSize);
    }
  } else { //if clicked on one
    stroke(0);
    strokeWeight(2);

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

function showTextCurve(phrase){
  //shows text curved around the logo in the corner
  //TBD depends on what the logo purpose ends up being
  push();
  angleMode(RADIANS);
  textAlign(CENTER, TOP);

  //split phrase into array, calc arcLength based on how many chars
  let chars = phrase.split("");
  // how expensive to do this instead of in setup? TODO
  let lc = defaults.titleSize / 2; //logo center xy
  let r = lc * 1.15; //radius from center to top of characters
  let a = PI/2; //start rotation (bottom of logo)
  let arcStep = (PI/2) / (chars.length - 1); //amount to rotate between each char
  textSize(lc * 0.2);

  //for each char, translate, rotate, text()
  for (let char of chars){
    push();
    translate(lc + (r * cos(a)), lc + (r * sin(a)));
    rotate(a - PI/2);
    text(char, 0, 0);
    // ellipse(0, 0, 20);
    pop();
    a -= arcStep;
    // console.log(a);
  }
  pop();
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
}

//MARK: physics
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
