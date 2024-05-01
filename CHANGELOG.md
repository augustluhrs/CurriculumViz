# Changelog

## v0

### v0.1.24

#### *4/28/24 20 mins and 4/30/24 2hrs*

- family reunion
  - abandoned spring body system because i'm a dingus that forgot big picture, doing same distribution method as cluster
  - evenly spaced around orbit, second layer offset by 45 degrees
  - links connect course to siblings and cousins
  - orbit size slider in controls for testing
  - spiral anim for outermost relatives
  - adjusted cluster center b/c was a little left when shifted

### v0.1.23

#### *4/28/24 1 hr*

- family reunion
  - added more springs to keep shape
  - selected course only cares about center
- alpha slider in controls

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
  