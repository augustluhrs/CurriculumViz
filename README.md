# CurriculumViz

## ROADMAP

- v0
  - Class info-gathering and table complete, information accessible on AirTable
- v1
  - A testable prototype in p5, basic UI, mobile view but not optimized for mobile
- v2
  - More visual options, connections, filters, brand identity
- v3
  - Linked suggestions / recommended classes
- v4
  - Semester course selection / class schedule builder / email form
- v5
  - Saved student history via cookies, 4 year plan

## TODO

- [ ] Project Setup
  - [X] git init
  - [X] glitch clone
  - [X] gitignore
  - [X] git lfs
  - [ ] final csv upload
- [ ] Style // Elements
  - [ ] courseNode css class
    - [ ] colors (area)
    - [ ] stroke/border (semester)
    - [ ] title formatting (use ":" delimiter for two lines?)
    - [ ] title font/color
    - [X] size
    - [X] basic shape
    - [X] button template
  - [ ] default web bubbles
    - [X] cluster positions
  - [ ] mobile scaling
  - [ ] info sidepanel (desktop)
  - [ ] info sidepanel (mobile)
  - [ ] page title
  - [ ] default font
- [ ] Core UI
  - [X] clickable cNodes
  - [ ] desktop navigation
    - [ ] scroll to zoom
    - [ ] click and drag off-node to move window
  - [ ] mobile navigation
    - [ ] pinch zoom
    - [ ] click and drag off-node to move window
  - [ ] sidepanel UI
    - [ ] related links
    - [ ] hide chevron
    - [ ] more info button
  - [ ] search bar for class titles
  - [ ] dropdown widget
    - [ ] desktop/mobile footer
    - [ ] hide chevron to retract/show
  - [ ] dropdown for keywords
  - [ ] dropdown for skills/software
  - [ ] dropdown for instructors
- [ ] Advanced UI / Animation
  - [ ] draggable cNodes
  - [ ] chevron show/hide animation
  - [ ] physics-based relationships
    - [ ] gravity where most relevant is at top
    - [ ] attraction where related have a pull towards selected
  - [ ] Filter Menu
- [ ] Visual Components
  - [ ] cNode highlight/dim for filters
  - [ ] size of cNode relative to credits
  - [ ] connected lines for keywords
  - [ ] connected lines for skills/software
  - [ ] asset preview on hover (desktop)
  - [ ] asset preview (static) on default
- [ ] Filters
  - [ ] colors for area vs default colors
  - [ ] colors/stroke for semesters offered
  - [ ] credit size vs all one size
  - [ ] related classes
  - [ ] semester recommendations
  - [ ] basic view vs asset preview
  - [ ] physics mode toggle
  - [ ] select year/semester
- [ ] Output
  - [ ] course selection list
- [ ] Recommendations
  - [ ] balanced semester
  - [ ] 4 year plan
  - [ ] course blocks (time overlap, etc. -- though would assume only taking CA classes, maybe not useful)
- [ ] Misc
  - [ ] more dimensional alignment of nodes closer to related areas
  - [ ] react?
  - [ ] landing page
    - [ ] different entry points depending on user type
  - [ ] fun stuff
    - [ ] weird sculpy node shape instead of circle
    - [X] alpha paint mode
    - [ ] hidden easter egg keyboard combos
      - [ ] rainbow mode
      - [ ] august's classes
      - [ ] nodes are now animals (goat?)
      - [ ] ithai dancing gif
    - [ ] replace cursor
      - [ ] goat
      - [ ] ithai face
    - [ ] 3D/AR version?
  - [ ] CA Account
    - [ ] CA github
    - [ ] CA glitch or CA VM
    - [ ] CA notion

## Changelog

### v0.0.4
*2/21/24: 45 mins*

- drafting the web positions of each cluster of areas
- centered buttons and adjusted scale slightly (0.09)

### v0.0.3

*2/19/24: 30 mins*

- updated table with areas, adjusted titles that were too long
- placeholder area color palette

### v0.0.2

*2/16/24: 3 hrs*

- git repo init
- file structure/lfs setup
- glitch project init

### v0.0.1

*2/13/24: 1 hr*

- basic p5 template
- testing airtable csv load
- auto-populate nodes with titles and motion
  