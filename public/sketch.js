/*
    CA Curriculum Visualization
    Prototype 0.0.1
    
    testing node generation from airtable csv
    August Luhrs and Despina Papadopolous
*/

//design/UI variables
let bg, nodeCol, nodeStroke, titleCol;
let nodeSize, nodeScale;
// let cNodeTemplate;

//csv variables
let airtable;
let courses = [];

//options/filters/visuals
let options = {
  isMoving: false,
  isDraggable: false,
  isGravity: false,
  isAlphaPaint: false,
};
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
  // rectMode(CENTER);
  // bg = color("#616708"); //olive
  bg = color("#aaef74"); //light pale green
  nodeCol = color("#f3a9b0");
  nodeStroke = color("#f0c5c4");
  titleCol = color("#00fffa");
  if(options.isAlphaPaint){
    bg.setAlpha(3);
  }

  //setup the css element properties
  //get the relative node size
  nodeScale = .08; //5% of shorter side of window
  if (width > height) { 
    nodeSize = height * nodeScale; 
  } else {
    nodeSize = width * nodeScale;
  }
  //turn to string for css
  nodeSize = nodeSize.toString();
  nodeSize += 'px';
  console.log(nodeSize)
  // cNodeTemplate = createElement("cNodeBlock").id("cNodeBlock");
  // cNodeTemplate.elt.style.width = nodeSize;
  // cNodeTemplate.elt.style.height = nodeSize;

  //cycle through the table to generate the CNodes
  for (let r = 0; r < airtable.getRowCount(); r++){
    // console.log(airtable.rows[r].arr);
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
