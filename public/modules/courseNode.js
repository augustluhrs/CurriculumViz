class CNode { //courseNode
  // constructor(data, pos){
  constructor(data){
    //data from table
    [this.name, this.short, this.long, this.professor, this.area, this.keywords, this.skills, this.credits, this.core, this.offered, this.image] = data;
    
    //css element
    this.button = createButton(this.name).class("cNode");
    this.button.elt.style.width = nodeSize_px;
    this.button.elt.style.height = nodeSize_px;
    this.button.mousePressed(this.click.bind(this));

    // cluster position and colors by area (later display option toggle TODO)
    // https://coolors.co/aaef74-89608e-428722-5792c3-fac9b8
    if (!this.area) { this.col = nodeCol }
    else {
      switch(this.area){
        case "Image":
          this.col = color("#14BDEB"); //aero blue
          this.cluster = clusters[1];
          this.cluster.count ++;
        break;
        case "Performance":
          this.col = color("#89608E"); //pomp and power (dark lilac)
          this.cluster = clusters[2];
          this.cluster.count ++;
        break;
        case "Music/Sound":
          this.col = color("#F08700"); //tangerine
          this.cluster = clusters[3];
          this.cluster.count ++;
        break;
        case "Emerging Media & Tech":
          this.col = color("#428722"); //forest green
          this.cluster = clusters[4];
          this.cluster.count ++;
        break;
        case "Text":
          this.col = color("#5792C3"); //celestial blue
          this.cluster = clusters[5];
          this.cluster.count ++;
        break;
        case "Visual Art":
          this.col = color("#FB3640"); // imperial red
          this.cluster = clusters[6];
          this.cluster.count ++;
        break;
        case "Studies (Research)":
          this.col = color("#fac9b8"); //pale dogwood (pink)
          this.cluster = clusters[7];
          this.cluster.count ++;
        break;
        case "Core":
          this.col = color("#DB7093"); //thulian pink (palevioletred css)
          this.cluster = clusters[0];
          this.cluster.count ++;
        break;
      }
    }
    this.button.elt.style.background = this.col;

    //cluster position info
    
    //other display info
    // this.ske = nodeStroke; //stroke, idk
    // this.skw = 5; //stroke weight
    this.size = nodeSize;
    // this.pos = pos;
    this.pos = createVector(this.cluster.pos.x, this.cluster.pos.y);
    

    
    //physics
    this.acc = createVector(0, 0); //acceleration
    // this.vel = createVector(random(-5, 5), random(-5, 5)); //start with random direction
    this.vel = createVector(0,0); //no movement unless too close or aquarium mode
    this.maxSpeed = 1; //speed of movement
    this.maxForce = 0.2; //speed of change to movement
    this.friction = 0.95; //drags to stop
    
  }

  getClusterOffset(){ // use cluster count to create vector offset -- need method after construction
    push();
    let angle = (360/this.cluster.count) * this.cluster.currentIndex;
    translate(this.cluster.pos.x, this.cluster.pos.y);
    let nodePos = rotationCoords(clusterOffset, 0, angle);
    nodePos.x += this.cluster.pos.x;
    nodePos.y += this.cluster.pos.y;
    this.pos = nodePos;
    this.cluster.currentIndex ++;
    pop();
  }
  
  checkDist(mousePos){
    //check the current pos of other nodes 
    //so we can calculate our distance and create an offset
    //that is the difference of our actual distance to our desired distance (the ranking relationship)
    for (let cNode of courses) {
      if (cNode.name !== this.name) {
        let offset = p5.Vector.sub(cNode.pos, this.pos);
        let distMag = offset.mag();
        
        if (distMag <= idealSeparation) {
          // let desiredMag = distMag + idealSeparation;
          // offset.setMag(desiredMag);
          offset.setMag(-idealSeparation);
          this.acc.add(offset);
        }
      }
    }
    
    //also try to stay in "home" cluster (area)
    let offset = p5.Vector.sub(this.pos, this.cluster.pos);
    let distMag = offset.mag();

    if (distMag > idealSeparation) {
      offset.setMag(-idealSeparation * .1); //weaker so they aren't too attracted to center
      this.acc.add(offset);
    }

    //avoid mouse if too close
    let mouseDist = p5.Vector.sub(mousePos, this.pos);
    let mouseDistMag = mouseDist.mag();

    if (mouseDistMag < mouseRepel) {
      // mouseDist.setMag(-mouseRepel * (mouseRepel - mouseDistMag) * 10);
      let mf = mouseRepel - (mouseRepel - mouseDistMag);
      mouseDist.setMag(-(mf * mf));
      this.acc.add(mouseDist)
    }
  }
  
  checkBounds() {
    //make sure it's staying in bounds
    if (this.pos.x > width - (this.size / 2)) {this.acc.add(createVector(-boundaryForce, 0))}
    if (this.pos.x < (this.size / 2)) {this.acc.add(createVector(boundaryForce, 0))}
    if (this.pos.y > height - (this.size / 2)) {this.acc.add(createVector(0, -boundaryForce))}
    if (this.pos.y < (this.size / 2)) {this.acc.add(createVector(0, boundaryForce))}
    
  }
  
  update(){
    this.vel.add(this.acc); //add the current forces to velocity
    this.vel.limit(this.maxSpeed); //make sure we're not going too fast
    this.vel.mult(this.friction);
    this.acc.mult(0); //reset the forces for the next loop
    this.pos.add(this.vel); //move the node
    
  }

  show(){
    //for alpha paint trails
    if (options.isAlphaPaint) {
      push();
      noStroke();
      fill(this.col);
      ellipse(this.pos.x, this.pos.y, this.size);
      pop();
    }
    this.button.position(this.pos.x, this.pos.y);
  }

  click(){
    console.log(this.name)
  }
  
  // showLines(){
  //   //lines?
  //   push();
  //   // stroke(150, 0, 255)
  //   strokeWeight(1);
  //   pop();
  // }
  
  /*
  show(){
    push();
    strokeWeight(this.skw);
    fill(this.col);
    stroke(this.ske);
    ellipse(this.pos.x, this.pos.y, this.size);
    pop();
    push();
    textSize(15);
    // fill(0, 150, 255);
    fill(titleCol);
    text(this.name, this.pos.x, this.pos.y);
    pop();
  }
  */
}
