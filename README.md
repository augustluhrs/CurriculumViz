# CurriculumViz

## ROADMAP

### v0

Class info-gathering and table complete, information accessible on AirTable

### v1

A testable prototype in p5, basic UI, mobile view but not optimized for mobile

### v2

More visual options, connections, filters, brand identity

### v3

Linked suggestions / recommended classes

### v4

Semester course selection / class schedule builder / email form

### v5

Saved student history via cookies, 4 year plan

## TODO

- [ ] Project Setup
  - [X] git init
  - [ ] glitch clone
  - [X] gitignore
  - [X] git lfs
  - [ ] final csv upload
- [ ] Style // Elements
  - [ ] courseNode css class
    - [ ] colors
    - [ ] stroke/border
    - [ ] title formatting (use ":" delimiter for two lines?)
    - [ ] size
    - [ ] shape (not circle? weirder sculpy kind of shape)
  - [ ] default web bubbles
  - [ ] mobile scaling
  - [ ] info sidepanel (desktop)
  - [ ] info sidepanel (mobile)
  - [ ] page title
  - [ ] default font
  - [ ] buttons css class
- [ ] Core UI
  - [ ] clickable cNodes
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
    - [ ] hidden easter egg keyboard combos
      - [ ] rainbow mode
      - [ ] august's classes
      - [ ] nodes are now animals (goat?)
      - [ ] ithai dancing gif

## Changelog

### v0.0.2

- git repo init
- file structure/lfs setup
- glitch project init

### v0.0.1

- basic p5 template
- testing airtable csv load
- auto-populate nodes with titles and motion
  