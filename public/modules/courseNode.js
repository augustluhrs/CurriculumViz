let rainbowSpacing = 10;

class CNode { //courseNode
  // constructor(data, pos){
  constructor(data, clickCallback){
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

    //for keyword/panel modes
    this.isVisible = true;
    this.isSelected = false;
    this.fitsKeywords = true;
    this.haveKeywordsChanged = false;
    this.hasClusterSelectionChanged = false;
    this.keyArr = this.keywords.split(",");
    this.relationships = {
      tally: {},//holds the number of similar keywords by course
      unsorted: [],
      sorted: [],
      siblings: [],
      cousins: [],
      relatives: [], //the "others"
    };
    this.hasCollisions = true; //for ignoring other nodes
    this.shouldCheckCollision = false; //so the collision only gets turned off once per big event, to prevent edge bugs

    //css element
    this.button = createButton(this.course).class("cNode");
    this.button.elt.style.width = defaults.nodeSize_px;
    this.button.elt.style.height = defaults.nodeSize_px;
    this.button.mousePressed(this.click.bind(this));
    this.clickCallback = clickCallback;

    // cluster position and colors by area (later display option toggle TODO)
    // https://coolors.co/aaef74-89608e-428722-5792c3-fac9b8
    this.cluster = clusters[this.area];
    // console.log(this.cluster.color._array);
    // this.color = color(this.cluster.color);
    // console.log(this.cluster.color.toString())
    this.color = color(this.cluster.color.toString());
    // console.log(this.color);
    // console.log(this.color == this.cluster.color);
    this.color2 = null; //only soul/core have 2
    this.cluster.count++;
    this.button.elt.style.background = this.color;

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
      this.color2 = color(this.secondCluster.color.toString());
      this.button.elt.style.background = `radial-gradient(${this.color} 25%, ${this.color2}, ${this.color})`;
    } else if (this.area == "SOUL") {
      this.color2 = color(clusters["CORE"].color.toString());
      this.button.elt.style.background = `radial-gradient(${this.color} 25%, ${this.color2}, ${this.color})`;
    }
    
    
    //other display info
    this.size = defaults.nodeSize;
    this.pos = createVector(this.cluster.pos.x, this.cluster.pos.y);

    //animations
    this.rainbowOffset = 0; //for selection animation
    this.blob = [];
    this.initBlob();
    
    //physics
    this.acc = createVector(0, 0); //acceleration
    // this.vel = createVector(random(-5, 5), random(-5, 5)); //start with random direction
    this.vel = createVector(0,0); //no movement unless too close or aquarium mode

    //overwritten immediately by slider defaults
    this.maxSpeed = 1; //speed of movement
    this.maxForce = .2; //speed of change to movement
    this.friction = 0.9; //drags to stop
    
  }

  adjustSelfBeforeUpdate(){//hmm, prob will refactor, but this is supposed to be where all the state responsive object changes happen
    if (state.mode == "default"){
      if(this.shouldCheckCollision){
        if (p5.Vector.dist(this.pos, this.cluster.pos) > defaults.allowedDistFromCluster){
          this.hasCollisions = false;
          // console.log(this.course);
        } else {
          this.hasCollisions = true; //hmm this is dumb TODO
          this.shouldCheckCollision = false;
        }
      }
    } else if(state.mode == "bounce"){
      //hmm I kind of like how some have collisions and some don't...
      // this.hasCollisions = false;
    } else if(state.mode == "relationships"){

    }

    if (this.hasClusterSelectionChanged){
      this.clusterHighlight();
    }
    
    // if(options.isShowingKeywords){ //so can overlap with bounce house, mode keywords and options.isShowingKeywords are distinct...
      if (this.haveKeywordsChanged){
        this.checkKeywords();
      }
    // }

  }
  
  updateAccFromState(mousePos, coursesCopy){ //mousePos not needed... steps for substepping...
    //using global state object for various modes and info
    //state is... global main modes? options is optional stuff that is mode-agnostic?
    //new update vector manager
    if (state.mode == "default"){
      this.checkNodeDist(coursesCopy);
      this.checkClusterDist();
    }
    else if (state.mode == "keyword"){
      this.checkNodeDist(coursesCopy);
    }
    else if (state.mode == "bounce"){
      this.checkNodeDist(coursesCopy);
    }
    //optional updates
    if (options.isAvoidingMouse){
      this.checkMouseDist(mousePos);
    }

    //always avoids boundaries
    this.checkBounds();
  }

  /**
   * 
   * MISC METHODS
   * 
   */

  anim_selectionRainbow(rainbowOffset){
    push();
    fill(rainbowOffset, 100, 100, .2);
    let leSigh = map(rainbowOffset, 0, 360, this.size, this.size * 1.6);
    ellipse(this.pos.x, this.pos.y, leSigh);
    pop();
  }

  anim_wobbleBlob(){
    //animate the splines via sin
    let time = millis();
    let count = 0;
    for (let petal of this.blob){
      for (let i = 0; i < petal.length; i++){
        if (i < 2 || i >= petal.length - 2){continue}; //ignore anchors
        petal[i][2] = map(sin((time / defaults.wobbleSpeed) + count), -1, 1, 0, defaults.wobbleMax);
        // count+=0.7;
        count+=defaults.wobbleOffset;
      }
      // for (let spline of petal){
      //   spline[2] = map(sin((time / defaults.wobbleSpeed) + count), -1, 1, 0, defaults.wobbleMax);
      //   // count+=0.7;
      //   count+=defaults.wobbleOffset;
      // }
    }

    //draw the petals
    push();
    fill(this.color);
    noStroke();
    translate(this.pos.x, this.pos.y);
    // ellipse(0, 0, defaults.blobUnit * 8);
    for (let petal of this.blob){
      beginShape();
      for (let spline of petal){
        // curveVertex(spline[0], spline[1]); //no animation
        curveVertex(spline[0], spline[1] + spline[2]);
      }
      endShape();
      rotate(45);
    }
    pop();
  }

  checkBounds() {
    //make sure it's staying in bounds
    if (this.pos.x > width - (this.size / 2)) {this.acc.add(createVector(-defaults.boundaryForce, 0))}
    if (this.pos.x < (this.size / 2)) {this.acc.add(createVector(defaults.boundaryForce, 0))}
    if (this.pos.y > height - (this.size / 2)) {this.acc.add(createVector(0, -defaults.boundaryForce))}
    if (this.pos.y < (this.size / 2)) {this.acc.add(createVector(0, defaults.boundaryForce))}
    
    if (options.isShowingPanel) {
      if (this.pos.x > panelLeftEdge - (this.size / 2)) {
        this.acc.add(createVector(-defaults.boundaryForce * 10, 0));
      }
    }
    if (options.isShowingKeywords) {
      if (this.pos.x < panelRightEdge + (this.size / 2)) { //TODO add top check
        this.acc.add(createVector(defaults.boundaryForce * 10, 0));
      }
    }
  }

  checkClusterDist(){
    //also try to stay in "home" cluster (area)
    if (state.selectedCluster == this.area){
      let offset = p5.Vector.sub(this.pos, clusterCenter);
      let distMag = offset.mag();

      if (distMag > defaults.idealSeparation) {
        offset.setMag(-defaults.idealSeparation * .2); 
        this.acc.add(offset);
      } else { //but also be repelled by center...
        offset.setMag(defaults.idealSeparation);
        this.acc.add(offset);
      }

    } else if (state.selectedCluster !== null && state.selectedCluster !== this.area){
      //placeholder for spiral anim  
    } else {
      let offset = p5.Vector.sub(this.pos, this.cluster.pos);
      let distMag = offset.mag();

      if (distMag > defaults.idealSeparation) {
        if (this.area == "SOUL") {
          offset.setMag(-defaults.idealSeparation * .5);
        }
        else {
          offset.setMag(-defaults.idealSeparation * .2);//weaker so they aren't too attracted to center
        }
        this.acc.add(offset);
      } else { //but also be repelled by center...
        offset.setMag(defaults.idealSeparation);
        this.acc.add(offset);
      }

      //the core classes should stay close to their area
      if (this.area == "CORE") {
        let offset2 = p5.Vector.sub(this.pos, this.secondCluster.pos);
        let distMag2 = offset2.mag();

        if (distMag2 > defaults.idealSeparation + this.size) {
          offset2.setMag(-defaults.idealSeparation * this.secondForce); //weaker so they aren't too attracted to center
          this.acc.add(offset2);
        } else { //but also be repelled by center...
          this.secondForce = .1;
          offset2.setMag(defaults.idealSeparation);
          this.acc.add(offset2);
        }
      }
    }
  }

  checkKeywords(){ //toggles the fade on courses that don't match keywords
    //reset so this only happens once per keyword change
    this.haveKeywordsChanged = false;
    this.fitsKeywords = true;
    for (let keybox of Object.keys(keywordCheckboxes)){
      if (keywordCheckboxes[keybox].checked()){
        if (!this.keywords.includes(keybox)){
          this.fitsKeywords = false;
        }
      }
    }
    //only true if all selected keywords are present
    this.checkVisibility();
  }

  checkMouseDist(mousePos){
    let mouseDist = p5.Vector.sub(mousePos, this.pos);
    // let mouseDist = p5.Vector.sub(this.pos, mousePos); //attracts rather than repels
    let mouseDistMag = mouseDist.mag();

    if (mouseDistMag < defaults.mouseRepel) {
      let mf = (-10 * defaults.mouseRepel * defaults.mouseRepel) / (mouseDistMag * mouseDistMag)
      mouseDist.setMag(mf);
      this.acc.add(mouseDist);
    }
  }

  checkNodeDist(coursesCopy){
    if (!this.hasCollisions){return;}
    for (let nodeCopy of coursesCopy) {
      if (nodeCopy.course !== this.course && nodeCopy.hasCollisions) {
        let offset = p5.Vector.sub(nodeCopy.pos, this.pos);
        let distMag = offset.mag();
        if (distMag == 0) {
          offset = createVector(random(-0.1, 0.1), random(-0.1, 0.1));
        }
        if (distMag <= defaults.idealSeparation) {
          offset.setMag(-defaults.idealSeparation);
          //trying a relative scaling instead of toggle collisions (errors with nodes on edge of zone)
          // let distFromCluster = p5.Vector.dist(this.pos, this.cluster.pos);
          // if (!this.hasCollisions){
          //   offset.setMag(-defaults.idealSeparation / 2);
          //   offset.mult(1/((distFromCluster/defaults.allowedDistFromCluster)*(distFromCluster/defaults.allowedDistFromCluster))); //so weaker node force the farther they are from home
          //   console.log(this.course);
          //   console.log(1/((distFromCluster/defaults.allowedDistFromCluster)*(distFromCluster/defaults.allowedDistFromCluster)));
          // } else {
          //   offset.setMag(-defaults.idealSeparation);
          // }
          this.acc.add(offset);
        }
      }
    }
  }

  checkRelationships(courses){ //issue with parameter being global name?
    //tally up number of same keywords
    for (let cNode of courses){
      if (cNode.course == this.course){continue;}
      this.relationships.tally[cNode.course] = 0;
      for (let keyword of this.keyArr){
        if (cNode.keyArr.includes(keyword)){
          this.relationships.tally[cNode.course]++;
        }
      }
    }

    //turn to array and sort by tally
    for (let [key, value] of Object.entries(this.relationships.tally)){
      this.relationships.unsorted.push([key, value]);
    }
    // console.log(this.relationships.unsorted);
    // this.relationships.sorted = this.relationships.unsorted.sort((a, b)=>{a[1] - b[1] 
      // console.log(a)});
    // console.log(this.course, this.relationships.sorted);
  }

  checkVisibility(){
    /** 
     * SCENARIOS:
     * 1) default, no keywords, no cluster = all visible
     * 2) keywords, no cluster = visible if keywords selected and match
     * 3) cluster, no keywords = visible if area
     * 4) keywords and cluster = visible if keywords selected,match, and area
    */
    if ((options.isShowingKeywords && !this.fitsKeywords && state.selectedCluster == null)
      || (!options.isShowingKeywords && state.selectedCluster !== null && (this.area !== state.selectedCluster || (this.area == "SOUL" && state.selectedCluster !== "CORE")))
      || ((options.isShowingKeywords && !this.fitsKeywords) || (state.selectedCluster !== null && (this.area !== state.selectedCluster || (this.area == "SOUL" && state.selectedCluster !== "CORE"))))
    ){ //god i need to refactor so badly wtf
      this.isVisible = false;
      this.hasCollisions = false;
      this.color.setAlpha(defaults.fadeAlpha);
      this.button.html('');
      if (this.area == "CORE" || this.area == "SOUL"){
        this.color2.setAlpha(defaults.fadeAlpha);
        this.button.elt.style.background = `radial-gradient(${this.color} 25%, ${this.color2}, ${this.color})`;
      } else {
        this.button.elt.style.background = this.color;
      }
    } else { //default
      this.isVisible = true;
      this.hasCollisions = true;
      this.color.setAlpha(1);
      this.button.html(this.course);
      if (this.area == "CORE" || this.area == "SOUL"){
        this.color2.setAlpha(1);
        this.button.elt.style.background = `radial-gradient(${this.color} 25%, ${this.color2}, ${this.color})`;
      } else {
        this.button.elt.style.background = this.color;
      }
    }
  }

  click(){
    if (this.isVisible){ //can't click on invisible stuff in background
      this.clickCallback(this);
      this.isSelected = true;
    }
  }

  clusterHighlight(){
    this.hasClusterSelectionChanged = false;
    this.checkVisibility();
  }

  getClusterOffset(){ // use cluster count to create vector offset -- need method after construction
    push();
    let angle = (360/this.cluster.count) * this.cluster.currentIndex;
    translate(this.cluster.pos.x, this.cluster.pos.y);
    let nodePos = rotationCoords(defaults.clusterOffset, 0, angle);
    nodePos.x += this.cluster.pos.x;
    nodePos.y += this.cluster.pos.y;
    this.pos = nodePos;
    this.cluster.currentIndex ++;
    pop();
  }

  initBlob(){
    let blobUnit = defaults.blobUnit;
    for (let i = 0; i < 8; i++){
      let blobPetal = [
        [-blobUnit * 1.5,     -blobUnit], //left anchor
        [-blobUnit * 1.5,     -blobUnit], //left spline
        [-blobUnit * 0.75,  -blobUnit * 2.5], //top left spline
        [0,                 -blobUnit * 3], //top spline
        [blobUnit * 0.75,   -blobUnit * 2.5], //top right spline 
        [blobUnit * 1.5,      -blobUnit], //right spline
        [blobUnit * 1.5,      -blobUnit], //right anchor
      ]
      // let blobPetal = [
      //   [-blobUnit * 2,     -blobUnit * 2], //left anchor
      //   [-blobUnit * 2,     -blobUnit * 2], //left spline
      //   [-blobUnit * 1.25,  -blobUnit * 3.5], //top left spline
      //   [0,                 -blobUnit * 4], //top spline
      //   [blobUnit * 1.25,   -blobUnit * 3.5], //top right spline 
      //   [blobUnit * 2,      -blobUnit * 2], //right spline
      //   [blobUnit * 2,      -blobUnit * 2], //right anchor
      // ]
      for (let petal of blobPetal){
        petal.push(0); //wobble modifier
      }
      this.blob.push(blobPetal);
    }
  }

  show(){
    //for alpha paint trails
    if (options.isAlphaPaint) {
      push();
      noStroke();
      if(this.isSelected){
        //new rainbow fade anim
        if (this.rainbowOffset > 360) {
          this.rainbowOffset = 0;
        } else {
          this.rainbowOffset += rainbowSpacing;
        }
        this.anim_selectionRainbow(this.rainbowOffset);
        //blob petal wobbling
        this.anim_wobbleBlob();
      // } else if (this.fitsKeywords){
      } else if (this.isVisible){
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
      }
      pop();
    }

    this.button.position(this.pos.x, this.pos.y);
  }
  
  updatePos(stepSize){
    this.acc.mult(stepSize);
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
}
