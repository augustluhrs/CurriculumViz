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

    //css element
    // this.button = createButton(this.course).class("cNode").parent("mainContainer");
    this.button = createButton(this.course).class("cNode");
    this.button.elt.style.width = defaults.nodeSize_px;
    this.button.elt.style.height = defaults.nodeSize_px;
    this.button.mousePressed(this.click.bind(this));
    this.clickCallback = clickCallback;

    // cluster position and colors by area (later display option toggle TODO)
    this.cluster = clusters[this.area];
    this.color = color(this.cluster.color.toString());
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
    
    //physics
    this.acc = createVector(0, 0); //acceleration
    this.vel = createVector(0,0); //current movement

    //overwritten immediately by slider defaults
    this.maxSpeed = 1; //speed of movement
    this.maxForce = .2; //speed of change to movement
    this.friction = 0.9; //drags to stop

    //animations
    this.rainbowOffset = 0; //for selection animation
    this.blob = [];
    this.initBlob();

    //for keyword/panel modes
    this.isVisible = true;
    this.isSelected = false;
    this.fitsKeywords = true;
    this.haveKeywordsChanged = false;
    this.hasClusterSelectionChanged = false;
    this.keyArr = this.keywords.split(",");
    this.hasCollisions = true; //for ignoring other nodes
    this.shouldCheckCollision = false; //so the collision only gets turned off once per big event, to prevent edge bugs

    //family reunion keyword mode
    this.familyMember = null; //the focus of the family reunion
    this.orbit = 0;
    this.relationships = {
      tally: {},//holds the number of similar keywords by course
      unsorted: [],
      sorted: [],
      siblings: [],
      cousins: [],
      relatives: [], //the "others"
    };
    
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
    } else if(state.mode == "family"){
      //check for updated pos stuff?
      this.checkFamilyPosition(); //hmm only run once?
    }

    if (this.hasClusterSelectionChanged){
      this.clusterHighlight();
    }
    
    if (this.haveKeywordsChanged){
      this.checkKeywords();
    }

  }
  
  updateAccFromState(mousePos, coursesCopy){ //mousePos not needed... steps for substepping...
    //using global state object for various modes and info
    //state is... global main modes? options is optional stuff that is mode-agnostic?
    //new update vector manager
    if (state.mode == "default"){
      this.checkNodeDist(coursesCopy);
      this.checkClusterDist();
    }
    else if (state.mode == "family"){
      this.checkNodeDist(coursesCopy);
      this.goFamilyReunion();
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
      let offset = p5.Vector.sub(this.pos, state.clusterCenter);
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

  checkFamilyPosition(){
    //assigns itself an orbit based on relationship to currentCourse
    //hmm what changes would happen here, as in, why am i calling this every loop?
    if (this.familyMember == state.selectedCourse){return;}
    
    this.familyMember = state.selectedCourse;

    //if self, goFamilyReunion will handle center seek
    this.orbit = 0;
    //orbitDistMin and orbitDistMax in defaults
    // if (courses[])//hmmmmmmmmmmm might be dumb, but going to make a reunion object for searching outside of courses array
    // for (let i = 0; i < 3; i++){
    //   for (let)
    // }
    //going to assign an orbit property for now for spiral anim
    for (let i = 0; i < 3; i++){
      for (let member of reunion[this.familyMember][i]){
        if (member[0] == this.course){
          this.orbit = i+1; //0 is center;
          return;
        }
      }
    }
    //resets collision if off --nvm this should be handled by checkVisiblity
    // this.hasCollisions = true; 
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
    this.relationships.sorted = this.relationships.unsorted.sort((a, b)=>{return b[1] - a[1]}); 

    //get the siblings and cousins from the sorted array
    //first see where to draw the line between siblings/cousins/others
    // let siblingMin = 5;
    // let cousinMin = 8;
    let orbitMinMembers = 6; //hmm
    let k_threshold = this.relationships.sorted[0][1]; //the highest number of same keywords
    let family = this.relationships.sorted;
    let familyOrbits = [
      this.relationships.siblings, //0
      this.relationships.cousins, //1
      this.relationships.relatives //2
    ]
    let currentOrbit = 0;
    for (let i = 0; i < family.length; i++){
      //add all at top to siblings, increasing tally threshold until minimum is met, then move to cousins
      if (family[i][1] >= k_threshold){
        familyOrbits[currentOrbit].push(family[i]);
      } else {
        k_threshold--;
        if (familyOrbits[currentOrbit].length < orbitMinMembers || currentOrbit == 2){
          familyOrbits[currentOrbit].push(family[i]);
        } else {
          currentOrbit++;
          familyOrbits[currentOrbit].push(family[i]);
        }
      }
      reunion[this.course] = familyOrbits;
    }
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
      if (state.mode == "family"){
        this.isSelected = true;
      }
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

  goFamilyReunion(){
    let centerOffset = p5.Vector.sub(this.pos, state.clusterCenter);
    let dist = centerOffset.mag();

    this.hasCollisions = false;
    if (dist < defaults.orbitDist * this.orbit){ //too close to center
      centerOffset.setMag(defaults.idealSeparation); //hmm same force okay?
      this.acc.add(centerOffset);
    } else if (dist > defaults.orbitDist * (this.orbit + 1)){ //too far from center
      centerOffset.setMag(-defaults.idealSeparation);
      this.acc.add(centerOffset);
    } else {
      this.hasCollisions = true;
    }

    //should i make a softbody organism with spring links... that's one way to ensure spacing...

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

  updateColors(){
    this.color = color(this.cluster.color.toString());
    this.button.elt.style.background = this.color;

    if (this.area == "CORE"){
      this.color2 = color(this.secondCluster.color.toString());
      this.button.elt.style.background = `radial-gradient(${this.color} 25%, ${this.color2}, ${this.color})`;
    } else if (this.area == "SOUL") {
      this.color2 = color(clusters["CORE"].color.toString());
      this.button.elt.style.background = `radial-gradient(${this.color} 25%, ${this.color2}, ${this.color})`;
    }
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
