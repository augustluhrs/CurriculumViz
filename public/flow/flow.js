/**
 * 
 *  Sankey Chart Demo
 *  using Highcharts API and demo code
 *  https://www.highcharts.com/docs/chart-and-series-types/sankey-diagram
 * 
 */

//create node links
let airtable;
let courseLinks = [];
let courseNodes = [
    {
        id: 'Core',
        color: '#DB7093',
        // offset: -110
    },
    {
        id: 'Performance',
        color: '#89608E'
    },
    {
        id: 'Image',
        color: '#14BDEB'
    },
    {
        id: 'Visual Art',
        color: '#FB3640'
    },
    {
        id: 'Emerging Media & Tech',
        color: '#428722'
    },
    {
        id: 'Music/Sound',
        color: '#F08700'
    },
    {
        id: 'Studies (Research)',
        color: '#fac9b8'
    },
    {
        id: 'Text',
        color: '#5792C3'
    },
];
function preload() {
    airtable = loadTable("../data/table.csv", "csv", "header");
}
function setup(){
    //cycle through the table to generate the CNodes
    for (let r = 0; r < airtable.getRowCount(); r++){
        let arr = airtable.rows[r].arr
        let credits = 3;
        if (arr[7] !== ""){
            credits = arr[7];
        } else {
            console.log(arr[0] + " is missing credits");
        }
        let courseLink = [arr[4].toString(), arr[0].toString(), credits.toString()]
        courseLinks.push(courseLink);

        let courseNode = {
            id: arr[0],
            color: "#888888",
            column: 2
        }
        courseNodes.push(courseNode);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const chart = Highcharts.chart('container', {
          title: {
              text: 'CollabArts Curriculum Visualization'
          },
          subtitle: {
              text:
            'v. 0.1.0'
          },
          accessibility: {
              point: {
                  valueDescriptionFormat: '{index}. {point.from} to {point.to}, {point.weight}.'
              }
          },
          tooltip: {
              headerFormat: null,
              pointFormat:
            '{point.fromNode.name} \u2192 {point.toNode.name}: {point.weight:.2f} quads',
              nodeFormat: '{point.name}: {point.sum:.2f} quads'
          },
          series: [{
              keys: ['from', 'to', 'weight'],
      
              nodes: courseNodes,
              data: courseLinks,

              type: 'sankey',
            name: 'Sankey demo series'
            }]

        });
    });
}

// function draw(){

// }

// document.addEventListener('DOMContentLoaded', function() {
//   const chart = Highcharts.chart('container', {
//     title: {
//         text: 'CollabArts Curriculum Visualization'
//     },
//     subtitle: {
//         text:
//       'v. 0.1.0'
//     },
//     accessibility: {
//         point: {
//             valueDescriptionFormat: '{index}. {point.from} to {point.to}, {point.weight}.'
//         }
//     },
//     tooltip: {
//         headerFormat: null,
//         pointFormat:
//       '{point.fromNode.name} \u2192 {point.toNode.name}: {point.weight:.2f} quads',
//         nodeFormat: '{point.name}: {point.sum:.2f} quads'
//     },
//     series: [{
//         keys: ['from', 'to', 'weight'],

//         nodes: courseNodes,
        //[
            //areas
            /*
            {
                id: 'Core',
                color: '#DB7093',
                // offset: -110
            },
            {
                id: 'Performance',
                color: '#89608E'
            },
            {
                id: 'Image',
                color: '#14BDEB'
            },
            {
                id: 'Visual Art',
                color: '#FB3640'
            },
            {
                id: 'Emerging Media & Tech',
                color: '#428722'
            },
            {
                id: 'Music/Sound',
                color: '#F08700'
            },
            {
                id: 'Studies (Research)',
                color: '#fac9b8'
            },
            {
                id: 'Text',
                color: '#5792C3'
            },
            */
            // {
            //     id: '',
            //     color: '#74ffe7',
            //     column: 2,
            //     offset: 50
            // },
            // {
            //     id: 'Image',
            //     color: '#8cff74',
            //     column: 2,
            //     offset: 50
            // },
            // {
            //     id: 'Industrial',
            //     color: '#ff8da1',
            //     column: 2,
            //     offset: 50
            // },
            // {
            //     id: 'Transportation',
            //     color: '#f4c0ff',
            //     column: 2,
            //     offset: 50
            // },
            // {
            //     id: 'Rejected Energy',
            //     color: '#e6e6e6',
            //     column: 3,
            //     offset: -30
            // },
            // {
            //     id: 'Energy Services',
            //     color: '#F9E79F',
            //     column: 3
            // },
            // {
            //     id: 'Petroleum',
            //     color: '#989898',
            //     offset: -1
            // }
        // ],
        // data: courseLinks,
        /*
        data: [
            ['Solar', 'Electricity & Heat', 0.48],
            ['Nuclear', 'Electricity & Heat', 8.42],
            ['Hydro', 'Electricity & Heat', 2.75],
            ['Wind', 'Electricity & Heat', 2.35],
            ['Geothermal', 'Electricity & Heat', 0.15],
            ['Natural Gas', 'Electricity & Heat', 9.54],
            ['Coal', 'Electricity & Heat', 12.7],
            ['Biomass', 'Electricity & Heat', 0.52],
            ['Petroleum', 'Electricity & Heat', 0.21],

            ['Electricity & Heat', 'Residential', 4.7],
            ['Solar', 'Residential', 0.19],
            ['Geothermal', 'Residential', 0.04],
            ['Natural Gas', 'Residential', 4.58],
            ['Biomass', 'Residential', 0.33],
            ['Petroleum', 'Residential', 0.88],

            ['Electricity & Heat', 'Commercial', 4.6],
            ['Solar', 'Commercial', 0.08],
            ['Geothermal', 'Commercial', 0.02],
            ['Natural Gas', 'Commercial', 3.29],
            ['Coal', 'Commercial', 0.02],
            ['Biomass', 'Commercial', 0.16],
            ['Petroleum', 'Commercial', 0.83],

            ['Electricity & Heat', 'Industrial', 3.23],
            ['Solar', 'Industrial', 0.02],
            ['Hydro', 'Industrial', 0.01],
            ['Natural Gas', 'Industrial', 9.84],
            ['Coal', 'Industrial', 1.24],
            ['Biomass', 'Industrial', 2.48],
            ['Petroleum', 'Industrial', 8.38],

            ['Electricity & Heat', 'Transportation', 0.03],
            ['Natural Gas', 'Transportation', 0.76],
            ['Biomass', 'Transportation', 1.43],
            ['Petroleum', 'Transportation', 25.9],

            ['Electricity & Heat', 'Rejected Energy', 24.7],
            ['Residential', 'Rejected Energy', 3.75],
            ['Commercial', 'Rejected Energy', 3.15],
            ['Industrial', 'Rejected Energy', 12.9],
            ['Transportation', 'Rejected Energy', 22.2],

            ['Residential', 'Energy Services', 6.97],
            ['Commercial', 'Energy Services', 5.84],
            ['Industrial', 'Energy Services', 12.4],
            ['Transportation', 'Energy Services', 5.91]
        ],
        */
//         type: 'sankey',
//         name: 'Sankey demo series'
//     }]

//   });
// });
