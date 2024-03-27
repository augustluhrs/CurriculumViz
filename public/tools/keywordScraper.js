let form; //the csv from the google form responses sheet

let output; //the object that will record the tallys and convert to csv for exporting

//table format:
// keyword,count

//misc variables
let scrapes = []; //collects the strings in column 5 and 6
let keywords = {}; //goes through the scrapes and tallies keywords

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
    if (scrapes == "") {continue;}
    let lowerScrape = scrape.toLowerCase();
    let splitScrape = split(lowerScrape, ', ');
    for (let s of splitScrape) {
      if (s == "") {continue;}
      if (keywords[s] != undefined) {
        keywords[s]++;
      } else {
        keywords[s] = 1;
      }
    }
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
