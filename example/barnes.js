var xs, ys;

var intervals = [0, 1, 2, 4, 4, 5, 6, 7, 8, 9, 10];

/*
 INPUT
    some random [x, y, z] values
    
     0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
    ---------------------------------------------- 
     0  5  0  0  0  0  0  0  0  0  0  0  0  0  0  | 0
     0  0  0  0  0  0  0  0  0  0  0  0  0 10  0  | 1
     0  0  0  0  0  0  7  0  0  0  0  0  0  0  0  | 2
     0  0  0  0  0  0  0  0  0  5  0  0  0  0  0  | 3
     0  0  0  0  3  0  0  0  0  0  0  0  0  0  0  | 4
     0  0  0  0  0  0  0  0  0  0  1  0  0  0  0  | 5
     0  0  0  0  0  0  9  0  0  0  0  0  0  0  0  | 6
     0  0  0  0  0  0  0  0  5  0  0  0  3  0  0  | 7
     0  0  0  0  0  0  0  8  0  0  0  0  0  0  0  | 8
     0  0  0  0 10  0  0  0  0  0  0  2  0  0  0  | 9
     0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  | 10
     0  0  0  0  3  3  0  0  0  0  0  0  0  0  0  | 11
     0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  | 12
     0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  | 13
     0  0  0  0  0  0  0  0  0  0  0  0  4  0  0  | 14


 OUTPUT xr = yr = 1
 [
  [  5,  5,  5,  6,  7,  7,  7,  7,  7,  5,  5,  7, 10, 10, 10 ],
  [  5,  5,  5,  6,  7,  7,  7,  7,  6,  5,  5,  5, 10, 10, 10 ],
  [  5,  4,  3,  3,  6,  7,  7,  7,  5,  5,  5,  5,  6, 10, 10 ],
  [  3,  3,  3,  3,  3,  6,  7,  7,  5,  5,  5,  4,  3,  5, 10 ],
  [  3,  3,  3,  3,  3,  4,  8,  8,  5,  4,  2,  1,  1,  1,  2 ],
  [  3,  3,  3,  3,  5,  8,  9,  9,  6,  2,  1,  1,  1,  2,  3 ],
  [  3,  3,  3,  5,  9,  9,  9,  8,  5,  4,  2,  1,  2,  3,  3 ],
  [ 10, 10, 10, 10,  9,  9,  8,  7,  6,  5,  5,  3,  3,  3,  3 ],
  [ 10, 10, 10, 10, 10,  9,  8,  8,  7,  6,  4,  2,  2,  3,  3 ],
  [ 10, 10, 10, 10, 10,  9,  8,  8,  8,  7,  2,  2,  2,  2,  2 ],
  [  8,  8,  8,  7,  7,  5,  5,  7,  8,  6,  2,  2,  2,  2,  2 ],
  [  3,  3,  3,  3,  3,  3,  3,  3,  5,  3,  2,  2,  2,  2,  2 ],
  [  3,  3,  3,  3,  3,  3,  3,  3,  3,  3,  2,  3,  3,  4,  4 ],
  [  3,  3,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  4 ],
  [  3,  3,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  4 ]
]


 OUTPUT xr = yr = .5
 [
  [  5,  5,  5,  7,  7,  7,  7,  7,  7,  5,  5,  6, 10, 10, 10 ],
  [  5,  5,  5,  7,  7,  7,  7,  7,  7,  5,  5,  5, 10, 10, 10 ],
  [  5,  3,  3,  3,  7,  7,  7,  7,  5,  5,  5,  5,  5, 10, 10 ],
  [  3,  3,  3,  3,  3,  7,  7,  7,  5,  5,  5,  5,  3,  3, 10 ],
  [  3,  3,  3,  3,  3,  3,  9,  9,  5,  5,  1,  1,  1,  1,  1 ],
  [  3,  3,  3,  3,  3,  9,  9,  9,  6,  1,  1,  1,  1,  2,  3 ],
  [  3,  3,  3,  4,  9,  9,  9,  9,  5,  5,  1,  1,  2,  3,  3 ],
  [ 10, 10, 10, 10,  9,  9,  9,  7,  5,  5,  5,  3,  3,  3,  3 ],
  [ 10, 10, 10, 10, 10,  8,  8,  8,  7,  5,  5,  2,  2,  3,  3 ],
  [ 10, 10, 10, 10, 10, 10,  8,  8,  8,  8,  2,  2,  2,  2,  2 ],
  [ 10, 10, 10, 10,  9,  3,  3,  8,  8,  8,  2,  2,  2,  2,  2 ],
  [  3,  3,  3,  3,  3,  3,  3,  3,  5,  2,  2,  2,  2,  2,  2 ],
  [  3,  3,  3,  3,  3,  3,  3,  3,  3,  2,  2,  2,  4,  4,  4 ],
  [  3,  3,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  4 ],
  [  3,  3,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  4 ]
 ]
     
     
*/
var data = [
    [1, 0, 15],
    [13, 1, 10],
    [6, 2, 7],
    [9, 3, 5],
    [4, 4, 3],
    [10, 5, 1],
    [6, 6, 9],
    [8, 7, 5],
    [12, 7, 3],
    [7, 8, 8],
    [4, 9, 10],
    [11, 9, 2],
    [4, 11, 13],
    [5, 11, 3],
    [12, 14, 4]
];

/* put these values into a 15x15 grid */
BarnesMethod(data, {dx: 15, dy: 15, xr: .05, yr: .05, verbose: true}, cb_objective);



// ---------
// functions
// ---------
/* create grid from random points*/
function BarnesMethod(data, options, successCallback) {

  var defaultOptions = {
    dx: 20,
    dy: 20,
    method: "objective",
    iterations: 1,
    gamma: 0.5,
    xr: null,
    yr: null,
    workpackageSize: 250,
    progressCallback: null,
    verbose: false
  };

  var xr = ((typeof options.xr === 'number') && options.xr > 0.) ? options.xr : (dx / Math.sqrt(data.length)) * Math.sqrt(2);
  var yr = ((typeof options.yr === 'number') && options.yr > 0.) ? options.yr : (dy / Math.sqrt(data.length)) * Math.sqrt(2);

  var dx = (options.dx < 1) ? defaultOptions.dx : Math.round(options.dx);
  var dy = (options.dy < 1) ? defaultOptions.dy : Math.round(options.dy);
  var method = options.method;
  var workpackageSize = ((typeof options.workpackageSize !== 'number') || (options.workpackageSize <= 0)) ? defaultOptions.workpackageSize : Math.round(options.workpackageSize);
  var gamma = ((typeof options.gamma !== 'number') || (options.gamma <= 0.)) ? defaultOptions.gamma : options.gamma;
  var iterations = ((typeof options.iterations !== 'number') || (options.iterations <= 0)) ? defaultOptions.iterations : options.iterations;
  var verbose = options.verbose;
  var progressCallback = options.progressCallback;


  if (verbose) {
    console.log("converting data to grid [" + dx + " x " + dy + "] using \" Barnes\" method");
    console.log("xr=" + xr + " yr=" + yr + " gamma=" + gamma + " iterations=" + iterations);
  }


  var min_x, max_x, min_y, max_y, tmp;
  var i = -1,
    l = data.length;

  /* get the min and max values of x-coordinates [borrowed from d3.extent()] */
  while (++i < l) if ((tmp = data[i][0]) != null && tmp >= tmp) {
    min_x = max_x = tmp;
    break;
  }
  while (++i < l) if ((tmp = data[i][0]) != null) {
    if (min_x > tmp) min_x = tmp;
    if (max_x < tmp) max_x = tmp;
  }

  /* get the min and max values of y-coordinates [borrowed from d3.extent()] */
  i = -1;
  while (++i < l) if ((tmp = data[i][1]) != null && tmp >= tmp) {
    min_y = max_y = tmp;
    break;
  }
  while (++i < l) if ((tmp = data[i][1]) != null) {
    if (min_y > tmp) min_y = tmp;
    if (max_y < tmp) max_y = tmp;
  }


  var gridSpanX = (max_x - min_x) / dx;
  var gridSpanY = (max_y - min_y) / dy;

  var BarnesGrid = [];
    /* create zero-valued grid */
  for (var i = 0; i < dx; ++i) {
    for (var j = 0; j < dy; ++j) {
      var x = min_x + gridSpanX / 2 + i * gridSpanX;
      var y = min_y + gridSpanY / 2 + j * gridSpanY;
      var z = 0;
      BarnesGrid.push([x, y, z]);
    }
  }

    /* compute closest gridpoint for each datum */
  var closest = [];
  data.forEach(function (d, k) {
    var i = 0;
    var dist = Math.sqrt((d[0] - BarnesGrid[i][1]) * (d[0] - BarnesGrid[i][1]) + ((d[1] - BarnesGrid[i][1]) * (d[1] - BarnesGrid[i][1])));
    for (var j = i + 1; j < BarnesGrid.length; ++j) {
      var dd = Math.sqrt((d[0] - BarnesGrid[j][1]) * (d[0] - BarnesGrid[j][1]) + ((d[1] - BarnesGrid[j][1]) * (d[1] - BarnesGrid[j][1])));
      if (dd < dist) {
        dist = dd;
        i = j;
      }
    }
    closest[k] = i;
  });

  var BarnesGrid2Data = function (g, d, idx) {
    return g[closest[idx]][2];
  };
  var progressFactor = 1 / iterations;
  var totalWork = BarnesGrid.length;
  var stepSize = 100. / totalWork;
  var progress = 0;
  var oldGrid = [];


  var constructPrevGrid = function () {
      /* copy over previous grid */
    BarnesGrid.forEach(function (d, i) {
      oldGrid.push([d[0], d[1], d[2]]);
    });
  };

  var mainloop = function (iter, i) {
    var j;
    for (j = i; j < Math.min(i + workpackageSize, BarnesGrid.length); ++j) {
      BarnesGrid[j][2] = getGridPointBarnes(data, oldGrid, j, BarnesGrid2Data, gamma, xr, yr, iter);
      if (typeof progressCallback === 'function') {
        progress += progressFactor * stepSize;
        progressCallback(progress);
      }
    }

    i = j;

      /* prepare next iteration */
    if (i === BarnesGrid.length) {
      i = 0;
      iter--;
      constructPrevGrid();
    }

    if (iter >= 0) {
      setTimeout(function () {
        mainloop(iter, i);
      }, 1);
    } else {
      setTimeout(finish, 1);
    }
  };

  var finish = function () {
      /* finally, convert grid to actual 2D array */
    var grid = [];
      /* create zero-valued grid */
    for (var j = 0; j < dy; ++j) {
      grid[j] = [];
      for (var i = 0; i < dx; ++i) {
        grid[j][i] = 0;
      }
    }

    /* copy over data from BarnesGrid */
    BarnesGrid.forEach(function (d) {
      var i = Math.round((d[0] - min_x - gridSpanX / 2) / gridSpanX);
      var j = Math.round((d[1] - min_y - gridSpanY / 2) / gridSpanY);
      grid[j][i] = d[2];
    });

    if (typeof progressCallback === 'function') {
      progressCallback(100);
    }

      /* send data to the callback function */
    successCallback(grid);
  };

    /* prepare for Barnes method */
  constructPrevGrid();

    /* now, apply barnes method for each gridpoint */
  mainloop(iterations - 1, 0);
}

/*
 data and grid must be a list of 3-tuples (x, y, z), where
 x and y denote planar coordinates, and z the value for this
 data point

 grid_i is the index of the current grid point that is about
 to be evaluated.
 */
function getGridPointBarnes(data, grid, grid_i, dataFromGrid, gamma, Lx, Ly, iteration) {

    /* set default values */
  gamma = (typeof gamma !== 'undefined') ? gamma : 0.5;
  Lx = (typeof Lx !== 'undefined') ? Lx : 2.;
  Ly = (typeof Ly !== 'undefined') ? Ly : 2.;
  iteration = (typeof iteration !== 'undefined' ) ? iteration : 0;

  var f_zero = function () {
    return 0;
  };

  dataFromGrid = (typeof dataFromGrid !== 'undefined') ? dataFromGrid : getGridPointBarnes;
  dataFromGrid = ((dataFromGrid === null)) ? f_zero : dataFromGrid;

  var weightSum = 0;
  var addValue = 0;
  var newValue = grid[grid_i][2];

  data.forEach(function (d, i) {
    var w = getBarnesWeight(d[0], d[1], grid[grid_i][0], grid[grid_i][1], gamma, Lx, Ly, iteration);
    addValue += w * (d[2] - dataFromGrid(grid, data, i, null, gamma, Lx, Ly, 0));
    weightSum += w;
  });

  newValue += addValue / weightSum;

  return newValue;
}

function getBarnesWeight(x, y, grid_x, grid_y, gamma, Lx, Ly, iteration) {
  var w_x = Math.pow(Math.sqrt(gamma), iteration) * Lx;
  var w_y = Math.pow(Math.sqrt(gamma), iteration) * Ly;
  var d_x = x - grid_x;
  var d_y = y - grid_y;

  d_x *= d_x;
  d_y *= d_y;
  w_x *= w_x;
  w_y *= w_y;

  return Math.exp(-d_x / w_x - d_y / w_y);
}


/* callback for 'objective method' */
function cb_objective(grid){

  // clean the numbers to have more readable output
    var cleanGrid = grid.map(function (row) {
    return row.map(function (p) {
      if (isNaN(p) || p === null) return 0;
      else return Math.round(p);
    })
  });

  console.log('grid:', JSON.stringify(cleanGrid));
  var isoBands = makeIsoBands(cleanGrid);
  drawLines('#isobands_barnes', isoBands, intervals);
}

/* create Iso Bands using MarchingSquaresJS */
function makeIsoBands(data){

  xs = d3.range(0, data[0].length);
  ys = d3.range(0, data.length);

  var isoBands = [];
  for (var i = 1; i < intervals.length; i++) {
    var lowerBand = intervals[i - 1];
    var upperBand = intervals[i];
    var band = MarchingSquaresJS.isoBands(
            data,
            lowerBand,
            upperBand - lowerBand,
            {
                successCallback: function (band) {
                    // console.log('Band' + i + ':', band)
                }
            }
    );
    isoBands.push({"coords": band, "level": i, "val": intervals[i]});
  }
return isoBands;
}

/* Create SVG and draw Iso bands */
function drawLines(divId, lines, intervals) {
  var marginBottomLabel = 0;
  var width = 300;
  var height = width * (ys.length / xs.length);

  var xScale = d3.scale.linear()
          .range([0, width])
          .domain([Math.min.apply(null, xs), Math.max.apply(null, xs)]);
  var yScale = d3.scale.linear()
          .range([0, height])
          .domain([Math.min.apply(null, ys), Math.max.apply(null, ys)]);
  var colours = d3.scale.linear().domain([intervals[0], intervals[intervals.length - 1]])
          .range([d3.rgb(0, 0, 0),
              d3.rgb(200, 200, 200)]);
  var svg = d3.select(divId)
          .append("svg")
          .attr("width", width)
          .attr("height", height + marginBottomLabel);
  svg.selectAll("path")
          .data(lines)
          .enter().append("path")
          .style("fill", function (d) {
              return colours(d.val);
          })
          .style("stroke", "black")
          .style('opacity', 1.0)
          .attr("d", function (d) {
              var p = "";
              d.coords.forEach(function (aa) {
                  p += (d3.svg.line()
                      .x(function (dat) {
                          return xScale(dat[0]);
                      })
                      .y(function (dat) {
                          return yScale(dat[1]);
                      })
                      .interpolate("linear")
                  )(aa) + "Z";
              });
              return p;
          })
          .on('mouseover', function () {
              d3.select(this).style('fill', d3.rgb(204, 185, 116));
          })
          .on('mouseout', function () {
              d3.select(this).style('fill', function (d1) {
                  return colours(d1.val);
              })
          });
}
