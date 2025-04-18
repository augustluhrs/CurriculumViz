# Changelog

## v0

### v0.3.5

#### *4/7/25 2.5hrs*

- kept aspect ratio of panel imgs (dfImg)
- pressing "=" does random cycle of courses (all for now, TODO fall)
- changed search visibility check
- removed search box and buttons, replaced with magnifying glass and bottom border
- adjusted css and positions of search, semester, and keyword Divs
- added "filter by semester" text to modePanel
- removed bg color from modePanel
- fixed "OCCASIONAL" logic bug
- moved semester panel, changed toggles to dropdown
- moved keyword panel down, adjusted height
- extended range of click reset so that clicking words resets also (`titleSize * 1.2`)

#### *3/30/25 45 mins*

- boundary size changes b/c UI? no, kept same for now
- pulled to glitch, TODO way of keeping env between versions

### v0.3.4

#### *3/29/25 5hrs*

- fixed search div blocking node click -- adjusts z-index in input check
- prevented first click from stopping orbit until the cursor moves away from orbit layer
- in family orbit mode, if mouse in outer layer, stops the spiral anim
- adjusted orbitRadius (reduced) and eliminated adjustments except for original setup declaration and spiralOut
- reenabled collisions on outer orbit nodes
- added keyword weights to /test, made relationship properties of cNodes reset when checking each time
- basic semester view with transparency toggles
- prototype mode UI panel with semester view toggles
- simple image default display in info panel (creating an img elt each time, better TODO)
- curved text around logo for "click to reset"
- finally fixed the soul stroke
- changed font size of search input and results
- [refactoring and pattern research](https://refactoring.guru/design-patterns)

API call est. this month total: 19

#### *3/28/25 2hrs*

- clicking search result acts as if you clicked the cNode
- search UI style, scrollbar auto showing, background opacity if results only
- ~~removed scrollbar of results box, need to test for confusion~~
- search box div w/ input and results box (scrollable)
- simple search function (all terms must be present at least once across all strings in cNode)

API call est. this month total: 17

### v0.3.3

#### *3/26/25 3 hrs*

- removing spaces of keywords when creating cNodes and in keyword check function (annoying, need to figure out if formatting in airtable or here, this is messy)
- adjusted gradient of core so that more white (42%)
- skipping SOUL classes in family check, or else art palace always in center
- new keyword weights, tally normalized
- courseNode.js keyword updates
- updated mainkeywords in areas.js (just for checkboxes)

API call est. this month total: 16

### v0.3.2

#### *3/26/25 1.5hrs*

- updated server to pull from SOURCE instead of apitest
- changed TECHNOLOGY to TECH
- created UPDATES and SOURCE tables on AirTable, the former added by automations checking for changes to NEW MASTER. Also added Subtitle and ShortTitle fields.
- courseNodes created from new json tableCourses, needs keyword update to fully implement
- tableCourses created (json object) from db / api, sent to client instead of csv load
- rough pass at data format guidelines on notion

API call est. this month total: 15

### v0.3.1

#### *3/25/25 2.5hrs*

- server checks if table has been updated today, replaces db doc if not
- removed node-cache, added nedb
- updated tasks and deliverables timeline
- cleaned areas.js of commented sections
- [local database research](https://rxdb.info/alternatives.html)

#### *3/15/25 1hr*

- merged glitch branch into main and dev
- typesense and cloud storage research
- diy search and storage plan/notes

### v0.3.0

#### *3/14/25 2hrs*

- testing airtable img links
- airtable.js web api install and test call
- database and search research
- node-cache for local storage of json response
- dotenv added for airtable api key
- .env in gitignore
- installed lodash as dependency b/c airtable.js apparently requires it?
- the image URLs may not work because they intentionally use URLs that expire after a couple hours

API call est.: 7

TODO:

- cNode-soul:hidden stroke

#### *Feb+Mar 2hrs*

- misc airtable work/config/setup

### v0.2.11

#### *12/15/24 1.5 hrs*

- color updates from Ithai
- placeholder soul and area border strokes
- added courses to areas, but TODO descriptions and keywords
- reduced font size of buttons and cnodes (left soul tho... TBD)

#### *11/??/24 30 mins*

- minor tweaks after brand meeting

### v0.2.10

#### *11/1/24 30 mins*

- fixed cursor link to reflect glitch url
- added remote reset via socket.emit('reset') -- just resets fishtank
- moved buttons up on fishtank
- removed mouse avoid
- adjusted joystick size and emitted speed
- updated logo on main site and moved keyword pos down

TODO:

- scale and reposition the buttons for vertical
- figure out performance hack for raspi or get new computer
- mode buttons (test motion off cursor)
- mode timers
- updated classes
- spring schedule
- if multiple fishtanks, need server cursor pos, not clientside

### v0.2.9

#### *10/29/24 2.5hrs*

Glitch:

- added asset paths
- changed remote window scaling touch stuff to prevent moving window
- font size updates for fishtank
- control text for qr code
- logo scale
- raspi monitor doesn't sleep

### v0.2.8

#### *10/29/24 2hrs*

- set up raspi on nyu wifi
- got 12th floor monitor up and running (socket dead)
- remote control QR code on fishtank
- link to main site on remote
- removed mobile warning on fishtank

### v0.2.7

#### *10/28/24 30 mins*

- .click() event bypassed, now using MouseEvent dispatch on the element
  
### v0.2.6

#### *10/27/24 3.5 hrs*

- added socket event sending mouse heading and dir
- hand object on fishtank
- vector based cursor movement
- pacman boundary check
- joystick UI with knob / colors / deadzones
- click button
- checking .click() event

#### TODO

- bind functions to all elements for click simulation events
- make main sketch a p5 instance for use across pages
- keyword exclusion mode
- timer for modes/events activated
- fishtank mode with flocking
- QR code at bottom
- ask Sarah D. about left-handed remote usability

### v0.2.5

#### *10/25/24 2 hrs*

- remote mouse control tests
- made custom cursor with [https://www.pixilart.com/](https://www.pixilart.com/) and made it the default across all pages
- turned off cursor by default on fish tank, using remote to control virtual cursor
- added socket logic on server and admin UI plugin
- remote joystick tests, sending cursor move direction as vector heading and magnitude (scaled for speed)

### v0.2.4

#### *10/9/24 1hr && 10/13/24 1hr*

- design sketches for fishtank and remote control page
- miro flowchart for planning out fishtank tasks/schedule
- started namespaces/folders for fishtank and remote
- installed socket.io
- changed background color of test site to a light blue

### v0.2.3

#### *9/15/24 1hr*

- added pink circle logo
- committing misc changes from summer leftover
- testing strapi for headless CMS

### v0.2.2

#### *6/3/24 1 hr*

- mobile beta
  - flag that is set based on portrait or landscape
  - researched feature detection library [Modernizr](https://modernizr.com/docs/#what-is-modernizr) but just using navigator.userAgent for now.

### v0.2.1

#### *6/2/24 45 mins*

- link to site and QR code
  - [bit.ly/collabartswebsite](https://bit.ly/collabartswebsite)
- researched CSS libraries
- clean up beta / add testing site
  - made a new '/test' namespace for what the old version looked like
  - added flag for not showing control stuff on main site

### v0.2.0

#### *5/19/24 30 mins*

- updated TODO with new version tasks
- researched touch gesture canvas zoom/pan options
- researched strapi CMS hosting on glitch

### v0.1.25

#### *5/2/24 1.25hrs*

- keyword panel shifted up and width increased from 10% to 15% (reduced shift center by half)
- added the warning text for mobile that was just on glitch previously
- csv updates
  - tweaked capstone entry in csv to be "final cohort experience" and added one-liner
  - updated steven's entries and added Performing Anatomy keywords and short
- closing panels shift all family orbits and still wobbles selected
- changed cohort to be all spiral

### v0.1.24

#### *4/28/24 20 mins and 4/30/24 2hrs*

- family reunion
  - abandoned spring body system because i'm a dingus that forgot big picture, doing same distribution method as cluster
  - evenly spaced around orbit, second layer offset by 45 degrees
  - links connect course to siblings and cousins
  - orbit size slider in controls for testing
  - spiral anim for outermost relatives
  - adjusted cluster center b/c was a little left when shifted

next:
- technology --> tech in cluster display
- course info
  - example image
  - (strapi research)
  - other info
- keywords
  - should do a family mode toggle
  - spiral anim
- dragging node (how if click is toggle...)
- keyword panel spacing
- click areas during bounce
- test accumulating nodeDist dir before applying force
- add latest courses
- clock mode?
- courses object

### v0.1.23

#### *4/28/24 1 hr*

- family reunion
  - added more springs to keep shape
  - selected course only cares about center
- alpha slider in controls

### v0.1.22

#### *4/27/24 3 hrs*

- rainbow selection anim
  - go away when not visible
  - increase hue shift offset
- family reunion
  - spring connections WIP
  - using magSq now, but maybe shouldn't... (edit: bug in center orbit, removed)

### v0.1.21

#### *4/25/24 1.75hrs*

- family reunion keyword state
  - placeholder relationship sort based on minimum of 6 per orbit
  - check and go methods
  - working click toggle to activate family reunion mode, but spacing is weird
- organized courseNode constructor sections

### v0.1.20

#### *4/24/24 2.5hrs*

- control updates
  - spaced out div sections
  - added design controls
    - font select (doesn't change buttons or fontsize)
    - color tester (inputs then color picker, with hex updating)

### v0.1.19

#### *4/23/24 3.75 hrs*

- changed physics toggle to motion toggle
  - bounce mode no longer has timeout, can pause in bounce mode
  - hasCollisions inconsistent in bounce mode, but i like it
- added isVisible to nodes
  - can't click on invisible node for panel info
  - simplifies checkVisibility's effects
- fixed alpha of bg ellipse not reset for core classes
  - cluster col reference --> new Color()
  - .col vs .color...
  - had to create colors off .toString()
- changed "keywords" state to "relationships" to remove overlap with keywords checks
- refresh background on area click
- added blob shape and animation to selected course
  - [p5 editor blob sketch](https://editor.p5js.org/augustluhrs/sketches/_AEKGMMOXB)
  - increased radius of rainbow fade

### v0.1.18

#### *4/21/24 3hrs*

- click cluster to hide all others and only show courses from that area
  - keep fade settings with regards to keyword panel
- ugh super frustrating refactor of show/hide with checkVisibility()
- collision check and flag, so nodes go home faster after big shifts
- refactored cluster center shift vector
- update bounce max values
- alphabetize the functions in sketch.js

### v0.1.17

#### *4/21/24 3.5 hrs*

- refactored sketch variables and added defaults object
- refactored node update methods --> updateState()
- added substepping and refactored animation physics functions
  - new adjust check for mode
  - fixed bounce house not working with new state checks (new look...)
  - adjusted default speed, force, friction
  - moved stepsize from individual checks to just checkPos()
  - tested hasCollisions but not working atm
- refactored keyword check and moved the sketch functions to node methods
- stopped hiding the avoid mouse button during bounce house

### v0.1.16

#### *4/20/24 30 mins*

- new state pattern init
- changed bg alpha to lessen stains
- courseTitle font size
- area font size
- init of collision check for ignoring other nodes

### v0.1.15

#### *4/19/24 2hrs*

- tested new color palette and alternatives
- keyword panel
  - button with label
  - hides text on fade nodes, reset on button close
- switched to HSB and updated setAlpha's
- rainbow select anim

### v0.1.14

#### *4/17/24 1hr*

- keyword sorting (WIP)
- todo updates from meeting

### v0.1.13

#### *4/16/24 45mins*

- fixed bug on keyword panel where the nodes would reset but not the checkboxes
- changed colors on node select (panel hide resets, if mismatch keywords, red)
- fixed bug where opacity on background ellipse wouldn't reset on keyword/panel reset
- fixed bug where core gradients wouldn't reset on panel close
- post-commit: fixed link on readme for second image

### v0.1.12

#### *4/16/24 2.5hrs*

- keyword panel, selecting makes non-fitting courses transparent
- made nodes avoid course and keyword panels and increased boundaryForce
- bounce house mode
- mouse avoid toggle

### v0.1.11

#### *4/11/24 1.5hrs*

- added control footer divs
- added mainContainer and panel divs
- basic courseInfo panel on node click, with hide button
- cleaned up setup a bit, moved chunks to init functions

### v0.1.10

#### *4/10/24 2 hrs*

- moved areas declaration to module so flow could have access
- working alluvial charts sans node colors
- new dev branch

### v0.1.9

#### *4/9/24 3.25 hrs*

- added radial gradient for core/soul classes
- core classes seek out their outer area (hard, then balanced out)
- adjusted forces to make the nodes move snappier and reduce vibration when still
- added physics toggle button
- changed font from Verdana to TiltNeon and increased textSize

### v0.1.8

#### *4/9/24 1.33 hrs*

- node map changes
  - loading from new masterSheet csv
  - 8 areas, added soul color
  - area clusters colored and repelling nodes that get too close to center
  - fixed bug where some nodes would be on top of each other if offsetMag = 0

### v0.1.7

#### *4/9/24 3.5 hrs*

- updated readme with new tasks and separated TODO and CHANGELOG
- master sheet changes:
  - 8 areas and sorted performance as best I could
  - compiled info from responses, AirTable4CSV, and MissingClasses
  - one example media and credit for each course from responses
  - assigned semester and credits, but missing several
  - 24 main keywords filtered from response sheet
- new keyword filter script that uses current "main" keywords (23)
- cleaned up google sheet tabs

### v0.1.6

#### *3/29/24 20 mins*

- new fall courses to node map

### v0.1.5

#### *3/29/24 15 mins*

- updated forces in node map to fix boundary issues

### v0.1.4

#### *3/29/24: 1 hr*

- fixed node map name mislabelling
- added mouse push and speed slider

### v0.1.3

#### *3/28/24: 2 hrs*

- sankey demo display bug fixes
- form adjustments for alluvial data structure processing

### v0.1.2

#### *3/27/24: 2 hrs*

- updated keyword script to lump together similar fields and remove punctuation differences
- started alluvial chart updates with initial keywords

### v0.1.1

#### *3/26/24: 1.5 hrs*

- formatting responses csv
- keyword tally scraping script

### v0.1.0

#### *2/28/24:  1.5 hrs*

- added sankey chart / alluvial diagram placeholder via highcharts api
- started to add course nodes to sankey

### v0.0.4

#### *2/21/24: 2.5 hrs*

- drafting the web positions of each cluster of areas
- centered buttons and adjusted scale slightly (0.09)
- cluster position formation
- area labels and text wrapping
- physics mode for auto spacing of nodes (desired dist from node and cluster, friction)

### v0.0.3

#### *2/19/24: 30 mins*

- updated table with areas, adjusted titles that were too long
- placeholder area color palette

### v0.0.2

#### *2/16/24: 3 hrs*

- git repo init
- file structure/lfs setup
- glitch project init

### v0.0.1

#### *2/13/24: 1 hr*

- basic p5 template
- testing airtable csv load
- auto-populate nodes with titles and motion
