var xs, ys;

var intervals = [0, 5, 10];

/*
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
*/
var data = [
    [1, 0, 5],
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
    [4, 11, 3],
    [5, 11, 3],
    [12, 14, 4]
];

/* put these values into a 15x15 grid */
ObjectiveMethod(data, {dx: 15, dy: 15, verbose: true}, cb_objective);



// ---------
// functions
// ---------
/* create grid from random points*/
function ObjectiveMethod(data, options, successCallback) {

    var defaultOptions = {
        dx: 20,
        dy: 20,
        method: "objective",
        iterations: 2,
        n: 5,
        gamma: 0.5,
        xr: null,
        yr: null,
        workpackageSize: 250,
        progressCallback: null,
        verbose: false
    };

    /* apply options */
    var dx = (options.dx < 1) ? defaultOptions.dx : Math.round(options.dx);
    var dy = (options.dy < 1) ? defaultOptions.dy : Math.round(options.dy);
    var method = options.method;
    var workpackageSize = ((typeof options.workpackageSize !== 'number') || (options.workpackageSize <= 0)) ? defaultOptions.workpackageSize : Math.round(options.workpackageSize);
    var gamma = ((typeof options.gamma !== 'number') || (options.gamma <= 0.)) ? defaultOptions.gamma : options.gamma;
    var iterations = ((typeof options.iterations !== 'number') || (options.iterations <= 0)) ? defaultOptions.iterations : options.iterations;
    var n = ((typeof options.n !== 'number') || (options.n < 0)) ? defaultOptions.n : options.n;
    var verbose = options.verbose;
    var progressCallback = options.progressCallback;

    var xr = ((typeof options.xr === 'number') && options.xr > 0.) ? options.xr : (dx / Math.sqrt(data.length)) * Math.sqrt(2);
    var yr = ((typeof options.yr === 'number') && options.yr > 0.) ? options.yr : (dy / Math.sqrt(data.length)) * Math.sqrt(2);

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

    var grid = [];
    /* create zero-valued grid */
    for (var k = 0; k < dx; ++k) {
        grid[k] = [];
        for (var w = 0; w < dy; ++w) {
            grid[k][w] = 0;
        }
    }

    if (verbose) {
        console.log("converting data to grid [" + dx + " x " + dy + "] using \"Objective\" method");
        console.log("xr=" + xr + " yr=" + yr + " n=" + n + " iterations=" + iterations);
    }

    var gridSpanX = (max_x - min_x) / dx;
    var gridSpanY = (max_y - min_y) / dy;

    var gridCoord2ValueX = function (x) {
        return min_x + gridSpanX / 2 + x * gridSpanX;
    };
    var gridCoord2ValueY = function (y) {
        return min_y + gridSpanY / 2 + y * gridSpanY;
    };

    /* create zero-valued grid */
    var ObjectiveGrid = [];
    for (var j = 0; j < dy; ++j) {
        for (var i = 0; i < dx; ++i) {
            ObjectiveGrid.push({i: i, j: j, v: 0, d: 0, w: 0, x: gridCoord2ValueX(i), y: gridCoord2ValueY(j)});
        }
    }

    /* start to fill the grid with values */
    var xr_local = xr;
    var yr_local = yr;

    var progressFactor = 1 / iterations;
    var totalWork = ObjectiveGrid.length;
    var stepSize = 100. / totalWork;
    var progress = 0;

    var mainloop = function (iter, k) {
        var p;

        for (p = k; p < Math.min(k + workpackageSize, ObjectiveGrid.length); ++p) {
            if (ObjectiveGrid[p].d < n) {

                ObjectiveGrid[p].d = 0;
                ObjectiveGrid[p].v = 0;
                ObjectiveGrid[p].w = 0;
                var x = ObjectiveGrid[p].x,
                    y = ObjectiveGrid[p].y;

                data.forEach(function (d, l) {
                    var x_dist = Math.abs(d[0] - x);
                    var y_dist = Math.abs(d[1] - y);
                    if ((x_dist <= xr_local) && (y_dist <= yr_local)) {
                        var w = getObjectiveWeight(xr_local, yr_local, x_dist, y_dist);
                        ObjectiveGrid[p].v += w * d[2];
                        ObjectiveGrid[p].w += w;
                        ObjectiveGrid[p].d++;
                    }
                });

                if (typeof progressCallback === 'function') {
                    progress += progressFactor * stepSize;
                    progressCallback(progress);
                }
            }
        }

        /* prepare next iteration */
        if (p === ObjectiveGrid.length) {
            p = 0;
            /* increase the search radius */
            xr_local *= Math.sqrt(2);
            yr_local *= Math.sqrt(2);
            iter--;
        }

        if (iter >= 0) {
            setTimeout(function () {
                mainloop(iter, p);
            }, 1);
        } else {
            setTimeout(finish, 1);
        }
    };

    var finish = function () {
        /* map back data of the ObjectiveGrid */
        ObjectiveGrid.forEach(function (d) {
            var i = d.i,
                j = d.j,
                z = d.v / d.w;
            grid[j][i] = z;
        });

        if (typeof progressCallback === 'function') {
            progressCallback(100);
        }

        /* send data to the callback function */
        successCallback(grid);
    };

    /* start the objective grid method */
    if (typeof progressCallback === 'function') {
        progressCallback(progress);
    }
    mainloop(iterations - 1, 0);
}

function getObjectiveWeight(Rx, Ry, dx, dy) {
    if (dx <= Rx && dy <= Ry) {
        var R = Math.sqrt(Rx * Rx + Ry * Ry);
        var r = Math.sqrt(dx * dx + dy * dy);
        var u = R * R - r * r;
        var l = R * R + r * r;
        return ((u / l) * (u / l));
    } else {
        return 0.;
    }
}

/* callback for 'objective method' */
function cb_objective(grid){
  console.log(grid);
  isoBands = makeIsoBands(grid);
  drawLines('#isobands_objective', isoBands, intervals);
}

/* create Iso Bands using MarchingSquaresJS */
function makeIsoBands(grid){

  data = d3.transpose(grid);
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
                    console.log('Band' + i + ':', band)
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
