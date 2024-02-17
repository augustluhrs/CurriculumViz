class CNode { //courseNode
  constructor(data, pos){
    //data from table
    [this.name, this.short, this.long, this.professor, this.area, this.keywords, this.skills, this.credits, this.core, this.offered, this.image] = data;
    
    //css element
    this.button = createButton(this.name).class("cNode");
    this.button.elt.style.width = nodeSize;
    this.button.elt.style.height = nodeSize;
    this.button.mousePressed(this.click.bind(this));

    //display info
    this.col = nodeCol;
    this.ske = nodeStroke; //stroke, idk
    this.skw = 5; //stroke weight
    this.size = 50;
    this.pos = pos;
    
    //physics
    this.acc = createVector(0, 0); //acceleration
    this.vel = createVector(random(-5, 5), random(-5, 5)); //start with random direction
    this.maxSpeed = 1; //speed of movement
    this.maxForce = 0.1; //speed of change to movement
    
  }
  
  check(){
    //check the current pos of other nodes 
    //so we can calculate our distance and create an offset
    //that is the difference of our actual distance to our desired distance (the ranking relationship)
    /*
    for (let node of group){
      if (node.name !== this.name) {
        let offset = p5.Vector.sub(node.pos, this.pos);
        let distMag = offset.mag()
        
        let desiredMag = distMag - this.relationships[node.name];
        offset.setMag(desiredMag);
        this.acc.add(offset);
        
      }
    }
    */
    
    //make sure it's staying in bounds
    if (this.pos.x > width - (this.size*2)) {this.acc.add(createVector(-1, 0))}
    if (this.pos.x < (this.size*2)) {this.acc.add(createVector(1, 0))}
    if (this.pos.y > height - (this.size*2)) {this.acc.add(createVector(0, -1))}
    if (this.pos.y < (this.size*2)) {this.acc.add(createVector(0, 1))}
    
  }
  
  update(){
    this.vel.add(this.acc); //add the current forces to velocity
    this.vel.limit(this.maxSpeed); //make sure we're not going too fast
    this.acc.mult(0); //reset the forces for the next loop
    this.pos.add(this.vel); //move the node
    
  }

  show(){
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
