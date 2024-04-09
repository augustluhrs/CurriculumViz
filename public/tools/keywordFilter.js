let form; //the csv from the google form responses sheet
let scrapes = []; //collects the strings in column 5 and 6
let filtered = [];
let output; //the object that will record the tallys and convert to csv for exporting
const punctuationRegex = /[!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~]/g; //not including "/"

function preload(){
  form = loadTable('responses_4-8.csv', 'csv', 'header');
}

function setup() {
  // createCanvas(400, 400);
  // console.log(form);
  
  output = new p5.Table();
  output.addColumn('course');
  output.addColumn('keywords');
  
  for (let r = 1; r < form.getRowCount(); r++) {
    let newScrape = [form.rows[r].arr[0],""];
    
    for (let k of form.rows[r].arr[5]){
      // newScrape[1].push(k);
    }
    for (let k of form.rows[r].arr[6]){
      // newScrape[1].push(k);
    }
    newScrape[1] += form.rows[r].arr[5];
    newScrape[1] += form.rows[r].arr[6];
    
    scrapes.push(newScrape);
  }
  // console.log(scrapes);
  for (let scrape of scrapes) {
    // console.log(scrape);
    let [course, keywords] = processKeywords(scrape);
    // if (keywords == false) { continue; }
    // console.log(course)
    let newRow = output.addRow();
    newRow.setString('course', course);
    newRow.setString('keywords', keywords);
  }

  // for (let [keyword, value] of Object.entries(keywords)){
  //   let newRow = output.addRow();
  //   newRow.setString('keyword', keyword);
  //   newRow.setString('count', value);
  // }
  console.log(output);
  
  // saveTable(output, "keywordFilter_4-8.csv");
}

function processKeywords(scrape){
  //eliminates common variations and lumps together similar keywords:
    if (scrape[1] == "") { return; }
    let filteredKeywords = "";
  
    //remove differences based on capitalization
    let lowerScrape = scrape[1].toLowerCase();
    let splitScrape = split(lowerScrape, ', ');
  
    for (let word of splitScrape) {
      if (word == "") { continue; }
      //remove all punctuation
      word = word.replace(punctuationRegex, "");
      //eliminate difference between plural and singular
      if (word.endsWith("s") && !word.includes("analy")){ word = word.slice(0, -1); }
      
      //filter by main keywords
      if (word.includes("acting") || word.includes("audition")) {
        word = "acting"; } //didn't include "building character"
      
      else if (word.includes("studio")) { 
        word = "art studio"; }
      
      else if (word.includes("coding")){ 
        word = "coding"; }
      
      else if (word.includes("collab")){ 
        word = "collaboration"; }
      
      else if (word.includes("making")){
        word = "critical making"; }
      
      else if (word.includes("thinking")){
        word = "critical thinking"; }
      
      else if (word.includes("design")){ 
        word = "design"; }
      
      else if (word.includes("directing")){
        word = "directing"; }
      
      else if (word.includes("electronics") || word.includes("pcomp") || word.includes("sensor")){ 
        word = "electronics"; }
      
      else if (word.includes("fabrication")){ 
        word = "fabrication"; }
      
      else if (word.includes("garment") || word.includes("fabric") || word.includes("wearable") || word.includes("fashion") || word.includes("sew")){ 
        word = "fashion/wearable"; }
      
      else if (word.includes("camera") || word.includes("film") || word.includes("video") ){ 
        word = "film/video"; } //not image? not photography? || word.includes("edit")
      
      else if (word.includes("guest")) {
        word = "guest artists"; }
      
      else if (word.includes("game") || word.includes("interact")){ 
        word = "interactive"; } //|| word.includes("play")
      
      else if (word.includes("light")){ 
        word = "lighting"; }
      
      else if (word.includes("art in nyc") || word.includes("live nyc") || word.includes("gallery")){ 
        word = "live nyc"; }
      
      else if (word.includes("performance")){ 
        word = "live performance"; }
      
      else if (word.includes("choreo") || word.includes("dance") || word.includes("mocap")){ 
        word = "movement"; }
      
      else if (word.includes("music") || word.includes("sonic") || word.includes("scoring") || word.includes("speech") || word.includes("talk") || word.includes("listen") || word.includes("voice") || word.includes("dj")){ 
        word = "music/sound"; }
      
      else if (word.includes("research")){ 
        word = "research"; }
      
      else if (word.includes("theater") || word.includes("improv") || word.includes("set")){ //set? what about music improv? 
        word = "theater"; }
      
      else if (word.includes("3d") || word.includes("visual art") || word.includes("installation") || word.includes("vj")){ 
        word = "visual art"; }
      
      else if (word.includes("words") || word.includes("writing") || word.includes("script")){
        word = "writing"; }
      
      else {
        continue;
        // return [false, false]; //yeah idk
      }
      
      if (!filteredKeywords.includes(word)){
        if (filteredKeywords == "") {
          filteredKeywords += word;
        } else {
          filteredKeywords += "," + word;
        }
      }
      
      // if (word.includes("devising")){ word = "devising"; }
      // if (word.includes("ensemble")){ word = "ensemble"; }
      // if (word.includes("experiment")){ word = "experimental"; }
      // if (word.includes("machine learning") || word.includes("ai") || word.includes("chatbot")){ word = "AI"; }
      // if (word.includes("online") || word.includes("web")){ word = "online performance"; }
      // if (word.includes("reading") || word.includes("word")){ word = "reading"; } //hmm
      // if (word.includes("improv")){ word = "improvisation"; }
      // if (word.includes("touch") && word.includes("design")){ word = "Touch Designer"; }
      // if (word.includes("word")){ word = ""; }
      // if (word.includes("virtual")){ word = "virtual production"; }
      // if (word.includes("vj") || word.includes("dj")){ word = "DJ / VJ"; } //a/v systems?
    }
  
  return [scrape[0], filteredKeywords];
}
