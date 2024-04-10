class CNode { //courseNode
  // constructor(data, pos){
  constructor(data){
    //data from table: Course,Professor,Area,Credits,Semester,Keywords,Short,Long,Media,Credit,Media,Credit,Media,Credit
    this.course = data.course;
    this.professor = data.professor;
    this.area = data.area;
    this.credits = data.credits;
    this.semester = data.semester;
    this.keywords = data.keywords;
    this.short = data.short;
    this.long = data.long; 
    this.media = data.media;
    //this.skills,

    //css element
    this.button = createButton(this.course).class("cNode");
    this.button.elt.style.width = nodeSize_px;
    this.button.elt.style.height = nodeSize_px;
    this.button.mousePressed(this.click.bind(this));

    // cluster position and colors by area (later display option toggle TODO)
    // https://coolors.co/aaef74-89608e-428722-5792c3-fac9b8
    if (!this.area) { this.col = nodeCol }
    else {
      switch(this.area){
        case "CORE":
          this.cluster = clusters["CORE"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
        case "SOUL":
          this.cluster = clusters["SOUL"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
        case "IMAGE":
          this.cluster = clusters["IMAGE"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
        case "ACTING":
          this.cluster = clusters["ACTING"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
        case "MOVEMENT":
          this.cluster = clusters["MOVEMENT"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
        case "SOUND":
          this.cluster = clusters["SOUND"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
        case "TECHNOLOGY":
          this.cluster = clusters["TECHNOLOGY"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
        case "WRITING":
          this.cluster = clusters["WRITING"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
        case "VISUAL ART":
          this.cluster = clusters["VISUAL ART"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
        case "STUDIES":
          this.cluster = clusters["STUDIES"];
          this.col = this.cluster.color;
          this.cluster.count ++;
        break;
      }
    }
    this.button.elt.style.background = this.col;

    //cluster position info
    //core classes have dual cluster homes
    if (this.area == "CORE"){
      this.secondForce = 20; //so they go towards second cluster hard, then balance
      if (this.course == "Making a Scene (Screenwriting)" || this.course == "Making a Scene (Playwriting)" || this.course == "Words and Ideas") {
        this.secondCluster = clusters["WRITING"];
      } else if (this.course == "Cinematic Narratives") {
        this.secondCluster = clusters["IMAGE"];
      } else if (this.course == "Tech in Action") {
        this.secondCluster = clusters["TECHNOLOGY"];
      } else if (this.course == "Music for Media") {
        this.secondCluster = clusters["SOUND"];
      } else if (this.course == "Tech in Action") {
        this.secondCluster = clusters["TECHNOLOGY"];
      } else if (this.course == "Performance: Body / Movement") {
        this.secondCluster = clusters["MOVEMENT"];
      } else if (this.course == "Performance: Voice / Text") {
        this.secondCluster = clusters["ACTING"];
      } else if (this.course == "Studio Art") {
        this.secondCluster = clusters["VISUAL ART"];
      }
      this.button.elt.style.background = `radial-gradient(${clusters["CORE"].color} 25%, ${this.secondCluster.color}, ${clusters["CORE"].color})`;
    } else if (this.area == "SOUL") {
      this.button.elt.style.background = `radial-gradient(${clusters["SOUL"].color} 25%, ${clusters["CORE"].color}, ${clusters["SOUL"].color})`;
    }
    
    //other display info
    // this.ske = nodeStroke; //stroke, idk
    // this.skw = 5; //stroke weight
    this.size = nodeSize;
    this.pos = createVector(this.cluster.pos.x, this.cluster.pos.y);
    
    //physics
    this.acc = createVector(0, 0); //acceleration
    // this.vel = createVector(random(-5, 5), random(-5, 5)); //start with random direction
    this.vel = createVector(0,0); //no movement unless too close or aquarium mode

    //overwritten immediately by slider defaults
    this.maxSpeed = 1; //speed of movement
    this.maxForce = .2; //speed of change to movement
    this.friction = 0.9; //drags to stop
    
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
      if (cNode.course !== this.course) {
        let offset = p5.Vector.sub(cNode.pos, this.pos);
        let distMag = offset.mag();
        if (distMag == 0) {
          offset = createVector(random(-0.1, 0.1), random(-0.1, 0.1));
        }
        if (distMag <= idealSeparation) {
          // let desiredMag = distMag + idealSeparation;
          // offset.setMag(desiredMag);
          offset.setMag(-idealSeparation);
          // offset.mult(0.9);
          this.acc.add(offset);
        }
      }
    }
    
    //also try to stay in "home" cluster (area)
    let offset = p5.Vector.sub(this.pos, this.cluster.pos);
    let distMag = offset.mag();

    if (distMag > idealSeparation) {
      if (this.area == "SOUL") {
        offset.setMag(-idealSeparation * .5);
      }
      else {
        offset.setMag(-idealSeparation * .2);//weaker so they aren't too attracted to center
      }
      // offset.setMag(-idealSeparation * .2); 
      this.acc.add(offset);
    } else { //but also be repelled by center...
      offset.setMag(idealSeparation);
      this.acc.add(offset);
    }

    //the core classes should stay close to their area
    if (this.area == "CORE") {
      let offset2 = p5.Vector.sub(this.pos, this.secondCluster.pos);
      let distMag2 = offset2.mag();

      if (distMag2 > idealSeparation + this.size) {
        offset2.setMag(-idealSeparation * this.secondForce); //weaker so they aren't too attracted to center
        this.acc.add(offset2);
      } else { //but also be repelled by center...
        this.secondForce = .1;
        offset2.setMag(idealSeparation);
        this.acc.add(offset2);
      }
    }

    //avoid mouse if too close
    let mouseDist = p5.Vector.sub(mousePos, this.pos);
    // let mouseDist = p5.Vector.sub(this.pos, mousePos);

    let mouseDistMag = mouseDist.mag();

    if (mouseDistMag < mouseRepel) {
      // mouseDist.setMag(-mouseRepel * (mouseRepel - mouseDistMag) * 10);
      // let mf = mouseRepel - (mouseRepel - mouseDistMag);
      // mouseDist.setMag(-(mf * mf));
      let mf = (-10 * mouseRepel * mouseRepel) / (mouseDistMag * mouseDistMag)
      mouseDist.setMag(mf);
      this.acc.add(mouseDist);
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
    this.acc.limit(this.maxForce);
    this.vel.add(this.acc); //add the current forces to velocity
    this.vel.limit(this.maxSpeed); //make sure we're not going too fast
    this.vel.mult(this.friction);
    if (this.vel.mag() < 1){this.vel.mult(this.vel.mag());} //make sure the force is big enough, avoid the vibrating when in final position
    // if (this.vel.mag() < 1){this.vel.mult(0.01);} //make sure the force is big enough, avoid the vibrating when in final position
    // if (this.course == "Jam House") { console.log(this.vel.mag())};
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
    console.log(this.course)
  }
  
  // showLines(){
  //   //lines?
  //   push();
  //   // stroke(150, 0, 255)
  //   strokeWeight(1);
  //   pop();
  // }
}
