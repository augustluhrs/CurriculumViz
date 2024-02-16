/*
    CA Curriculum Visualization
    Prototype 0.0.1
    
    testing node generation from airtable csv
    August Luhrs and Despina Papadopolous
*/

//design/UI variables
let bg, nodeCol, nodeStroke, titleCol;

//csv variables
let airtable;
let courses = [];

function preload(){
  airtable = loadTable("data/table.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);//stretches to fit whatever windowSize the user has
  textAlign(CENTER, CENTER);
  
  //background and UI
  bg = color("#616708");
  nodeCol = color("#f3a9b0");
  nodeStroke = color("#f0c5c4");
  titleCol = color("#00fffa");
  // bg.setAlpha(10);

  //font scale 
  textSize(38); 
  
  // console.log(airtable)
  
  //cycle through the table
  for (let r = 0; r < airtable.getRowCount(); r++){
    // console.log(airtable.rows[r].arr);
    let newCourse = new CourseNode(airtable.rows[r].arr, createVector(random(0, width), random(0, height)));
    courses.push(newCourse);
  }
}

function draw() {
  background(bg);

  for (let node of courses){
    node.check();
  }
  for (let node of courses){
    node.update();
    // node.showLines();
  }
  
  for (let node of courses) {
    node.show();
  }
  
}
