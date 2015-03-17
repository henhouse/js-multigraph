// This file gives metadata about the MUGL files in the graph
// test suite.
// 
// Not all MUGL files in the test suite are listed in this file ---
// a file is only listed here if there is a need to specify one
// of the following things about it:
// 
//      `width`: the pixel width of the graph
//     `height`: the pixel height of the graph
//        `web`: set this to `true` to indicate that this graph should be included
//               as an example on the the http://www.multigraph.org web site
//      `error`: set this to `true` to indicate that this MUGL file contains
//               an error and is therefore a test of Multigraph's error handling
//         `js`: an array of additonal JavaScript files that should be loaded in
//               the browser before rendering a graph
// 
// Any MUGL file in this directory which is not included in the list below
// will be rendered at a default size in the test suite (and will not be
// included on the multigraph.org site).
// 
// See the README.md file in this directory for more info.

module.exports = {
    'tests': [

        { "mugl": "cog_population.xml",                "web": true },
        { "mugl": "french-broad-flood.xml",            "web": true },
        { "mugl": "french-broad-water.xml",            "web": false },
        { "mugl": "income-disparity_sex.xml",          "web": true },
        { "mugl": "los_bar-population.xml",            "web": true },
        { "mugl": "population-divorced.xml",           "web": true },
        { "mugl": "population-waterwithdrawl.xml",     "web": true },
        { "mugl": "poverty-to-foodstamps-los.xml",     "web": true },
        { "mugl": "precip_forecast.xml",               "web": true },
        { "mugl": "swnc-test.xml",                     "web": true },
        { "mugl": "temp_forecast_frontpage.xml",       "web": true },
        { "mugl": "temp_forecast.xml",                 "web": true },
        { "mugl": "test-graph2.xml",                   "web": true },
        { "mugl": "test-graph3.xml",                   "web": true },
        { "mugl": "test-graph4.xml",                   "web": true },
        { "mugl": "test-graph5.xml",                   "web": true },
        { "mugl": "test-graph6.xml",                   "web": true },
        { "mugl": "test-graph.xml",                    "web": true },
        { "mugl": "unemployed-to-poverty-los.xml",     "web": true },
        { "mugl": "water-flow_graph.xml",              "web": true },
        { "mugl": "wind_forecast.xml",                 "web": true },
        { "mugl": "wkerrscott_gage-height.xml",        "web": true },
        { "mugl": "yearly-yadkin.xml",                 "web": true },

        { "mugl" : "acis-static.xml",                  "web": true },
        { "mugl" : "axisbinding-tempgraph.xml",        "web": true },
        { "mugl" : "background_image.xml",             "web": true },
        { "mugl" : "band_graph.xml",                   "web": true },
        { "mugl" : "band_legend.xml",                  "web": true },
        { "mugl" : "constant-plot.xml",                "web": true },
        { "mugl" : "dewpoint.xml",                     "web": false },
        { "mugl" : "fill-downfill.xml",                "web": false },
        { "mugl" : "fill_graph.xml",                   "web": true },
        { "mugl" : "fotos-sst.xml",                    "web": false },
        { "mugl" : "geomweather.xml",                  "web": false },
        { "mugl" : "line-graph.xml",                   "web": true },
        { "mugl" : "minimal_graph.xml",                "web": true },
        { "mugl" : "ndvi.xml",                         "web": true },
        { "mugl" : "periodic-temp.xml",                "web": true },
        { "mugl" : "plotarea-background-color.xml",    "web": true },
        { "mugl" : "point-graph.xml",                  "web": true },
        { "mugl" : "temp-precip.xml",                  "web": true },
        
        { "mugl": "tempgraph.xml",               "width": 800,  "height": 500 },
        { "mugl": "tempgraph.xml",               "width": 800,  "height": 300 },
        { "mugl": "dashboard-aoi.xml",           "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-asi.xml",           "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-co2.xml",           "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-ghouse.xml",        "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-glacier.xml",       "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-naoi.xml",          "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-ocean.xml",         "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-oni.xml",           "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-pnap.xml",          "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-projections.xml",   "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-sea.xml",           "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-snow.xml",          "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-soi.xml",           "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-sun.xml",           "width": 800,  "height": 400, "web": true },
        { "mugl": "dashboard-temp.xml",          "width": 800,  "height": 400, "web": true },
        { "mugl": "crn-webservice.xml",          "width": 1000, "height": 400, "web": true },
        { "mugl": "acis-webservice.xml",         "width": 1000, "height": 400, "web": true },
        { "mugl": "multigraph-logo.xml",         "width": 500,  "height": 500, "web": true },

        // The 'js' property is an array of additional JS files that should be loaded in the browser for a specific MUGL
        { "mugl": "drought.xml",                 "js": ["../../aux/data_adapters/drought.js"] },
        { "mugl": "drought-csv.xml",             "js": ["../../aux/data_adapters/drought.js"] },

        // The "error" property indicates that a MUGL file contains an error; these are for
        // testing how Multigraph handles/displays MUGL errors:
        { "mugl" : "error-axis_ref_invalid.xml",               "error" : true },
        { "mugl" : "error-column_data_error.xml",              "error" : true },
        { "mugl" : "error-extra_data_columns.xml",             "error" : true },
        { "mugl" : "error-incorrect_renderer.xml",             "error" : true },
        { "mugl" : "error-invalid-constant-plot.xml",          "error" : true },
        { "mugl" : "error-invalid_csv_location.xml",           "error" : true },
        { "mugl" : "error-missing_data_columns.xml",           "error" : true },
        { "mugl" : "error-missing_data_value.xml",             "error" : true },
        { "mugl" : "error-missing_data.xml",                   "error" : true },
        { "mugl" : "error-multiple_errors.xml",                "error" : true },
        { "mugl" : "error-weather2.xml",                       "error" : true },
        { "mugl" : "error-wrong_variable_refs.xml",            "error" : true }

    ]};      
