// temp solution for search functionality
// just tallying occurrences in all course strings then sorting
// i don't have a CS degree, don't @ me about algorithms or O(n)

//for now, exclusive search so all terms must be present

// TODO tableCourses have capitalized properties......... nvm using courses after all so i can pass nodes along

// https://www.geeksforgeeks.org/how-to-count-string-occurrence-in-string-using-javascript/
function search(terms){
  let results = []; //[course object, numHits]

  //go through each course's strings, find matches, then sort by highest Hits
  for (let course of courses){
    let numHits = 0;
    for (let term of terms){
      let t = new RegExp(term, "gi");
      let tHits = 0;
      if (course.short != "missing short description"){
        let shortHits = course.short.match(t)
        if (shortHits !== null){
          tHits += shortHits.length;
        }
      }

      if (course.long != "missing long description"){
        let longHits = course.long.match(t)
        if (longHits !== null){
          tHits += longHits.length;
        }
      }

      let keyHits = course.secondaryKeywords.match(t);
      if (keyHits != null) {
        tHits += keyHits.length;
      }
      if (tHits === 0){ 
        numHits = 0;
        break; 
      } else {
        numHits += tHits;
      }
    }
    if (numHits > 0){
      results.push([course, numHits]);
    }
  }

  //sort by numHits
  results = results.sort((a,b) => b[1] - a[1]);
  // console.log(results)
  return results;
}
