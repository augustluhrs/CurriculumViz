let form; //the csv from the google form responses sheet

let output; //the object that will record the tallys and convert to csv for exporting

//table format:
// keyword,count

//misc variables
let scrapes = []; //collects the strings in column 5 and 6
let keywords = {}; //goes through the scrapes and tallies keywords
const punctuationRegex = /[!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~]/g; //not including "/"

function preload(){
  form = loadTable('form_3-26.csv', 'csv', 'header');
}

function setup() {
  createCanvas(400, 400);
  // console.log(form);
  
  for (let r = 1; r < form.getRowCount(); r++) {
    scrapes.push(form.rows[r].arr[5]);
    scrapes.push(form.rows[r].arr[6]);
  }
  // console.log(scrapes);
  for (let scrape of scrapes) {
    processCell(scrape);
  }
  
  console.log(keywords);
  
  output = new p5.Table();
  
  output.addColumn('keyword');
  output.addColumn('count');
  
  for (let [keyword, value] of Object.entries(keywords)){
    let newRow = output.addRow();
    newRow.setString('keyword', keyword);
    newRow.setString('count', value);
  }
  // console.log(output);
  
  // saveTable(output, "keywordCount_3-26.csv");
}

function draw() {
  background(220);
}

function processCell(scrape){
  //eliminates common variations and lumps together similar keywords:
    if (scrape == "") { return; }
    //remove differences based on capitalization
    let lowerScrape = scrape.toLowerCase();
    let splitScrape = split(lowerScrape, ', ');
    for (let word of splitScrape) {
      if (word == "") { continue; }
      //remove all punctuation
      word = word.replace(punctuationRegex, "");
      //eliminate difference between plural and singular
      if (word.endsWith("s") && !word.includes("analy")){ word = word.slice(0, -1); }
      
      //lump common keywords
      if (word.includes("art in nyc")){ word = "art in nyc"; }
      if (word.includes("live nyc")){ word = "live nyc"; }
      if (word.includes("performance") && !word.includes("computer") && !word.includes("performance art")){ word = "live performance"; }
      if (word.includes("3d")){ word = "3d design"; } //not scanning?
      if (word.includes("camera")){ word = "film / video"; }
      if (word.includes("choreo")){ word = "choreography"; }
      if (word.includes("collab")){ word = "collaboration"; }
      if (word.includes("computer")){ word = "computer performance"; }
      if (word.includes("speech") || word.includes("talk") || word.includes("listen") || word.includes("voice")){ word = "speech"; }
      if (word.includes("coding")){ word = "creative coding"; }
      if (word.includes("dance")){ word = "dance"; }
      if (word.includes("devising")){ word = "devising"; }
      if (word.includes("electronics") || word.includes("pcomp")){ word = "electronics / physical computing"; }
      if (word.includes("ensemble")){ word = "ensemble"; }
      if (word.includes("experiment")){ word = "experimental"; }
      if (word.includes("edit")){ word = "editing"; }
      if (word.includes("film") || word.includes("video")){ word = "film / video"; }
      if (word.includes("gallery")){ word = "art in nyc"; }
      if (word.includes("game")){ word = "game design"; } //|| word.includes("play")
      if (word.includes("garment")){ word = "fashion / wearabe"; }
      if (word.includes("install")){ word = "installation"; }
      if (word.includes("interact")){ word = "interactive"; }
      if (word.includes("interdisciplin")){ word = "interdisciplinary"; }
      if (word.includes("light")){ word = "lighting"; }
      if (word.includes("machine learning") || word.includes("ai") || word.includes("chatbot")){ word = "AI"; }
      if (word.includes("making") || word.includes("fabrication")){ word = "fabrication"; }
      if (word.includes("mocap")){ word = "motion capture"; }
      if (word.includes("music") || word.includes("sonic")){ word = "music / sound"; }
      if (word.includes("online") || word.includes("web")){ word = "online performance"; }
      if (word.includes("reading") || word.includes("word")){ word = "reading"; } //hmm
      if (word.includes("research")){ word = "research"; }
      if (word.includes("scoring")){ word = "scoring"; }
      if (word.includes("improv")){ word = "improvisation"; }
      if (word.includes("touch") && word.includes("design")){ word = "Touch Designer"; }
      // if (word.includes("word")){ word = ""; }
      if (word.includes("virtual")){ word = "virtual production"; }
      if (word.includes("vj") || word.includes("dj")){ word = "DJ / VJ"; } //a/v systems?
      
      //add count to keywords object
      if (keywords[word] != undefined) {
        keywords[word]++;
      } else {
        keywords[word] = 1;
      }
    }
}
