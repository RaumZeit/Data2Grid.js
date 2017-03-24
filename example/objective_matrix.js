

// ---------
// functions
// ---------
/* create grid from random points*/
function objectiveMethod(data, options) {

    var defaultOptions = {
        dx: 20,
        dy: 20,
        method: "objective",
        iterations: 1,
        n: 5,
        xr: null,
        yr: null,
        workpackageSize: 250,
        progressCallback: null,
        successCallback: null,
        verbose: false
    };

    /* apply options */
    var dx = (options.dx < 1) ? defaultOptions.dx : Math.round(options.dx);
    var dy = (options.dy < 1) ? defaultOptions.dy : Math.round(options.dy);
    var method = options.method;
    var workpackageSize = ((typeof options.workpackageSize !== 'number') || (options.workpackageSize <= 0)) ? defaultOptions.workpackageSize : Math.round(options.workpackageSize);
    var iterations = ((typeof options.iterations !== 'number') || (options.iterations <= 0)) ? defaultOptions.iterations : options.iterations;
    var n = ((typeof options.n !== 'number') || (options.n < 0)) ? defaultOptions.n : options.n;
    var verbose = options.verbose;
    var progressCallback = options.progressCallback;
    var successCallback = options.successCallback;

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
            // setTimeout(function () {
                mainloop(iter, p);
            // }, 1);
        } else {
            // setTimeout(
              return; // finish();
              // , 1);
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
        if (options.successCallback) {
          successCallback(grid);
        }
        else {
          return grid;
        }
    };

    /* start the objective grid method */
    if (typeof progressCallback === 'function') {
        progressCallback(progress);
    }

    mainloop(iterations - 1, 0);

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
    if (options.successCallback) {
      successCallback(grid);
    }
    else {
      return grid;
    }

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


