var Data2GridJS = (function(my){
  /*
      implementation of the Objective Method

      see Method 2 of

        S. E. Koch and M. DesJardins and P. J. Kocin, 1983.
        "An interactive Barnes objective map anlaysis scheme for use with satellite and conventional data."
        J. Climate Appl. Met., vol 22, p. 1487-1503.
  */

  var ObjectiveMethod = function(data, grid, options, successCallback){
    var xr                = options.xr,
        yr                = options.yr,
        dx                = options.dx,
        dy                = options.dy,
        min_x             = options.min_x,
        max_x             = options.max_x,
        min_y             = options.min_y,
        max_y             = options.max_y,
        n                 = options.n,
        iterations        = options.iterations,  
        workpackageSize   = options.workpackageSize,
        progressCallback  = options.progressCallback,
        verbose           = options.verbose;

    if(verbose){
      console.log("converting data to grid [" + dx + " x " + dy + "] using \"Objective\" method");
      console.log("xr=" + xr + " yr=" + yr + " n=" + n + " iterations=" + iterations);
    }

    var gridSpanX = (max_x - min_x) / dx;
    var gridSpanY = (max_y - min_y) / dy;
  
    var gridCoord2ValueX = function(x){ return min_x + gridSpanX/2 + x * gridSpanX;};
    var gridCoord2ValueY = function(y){ return min_y + gridSpanY/2 + y * gridSpanY;};
  
    var ObjectiveGrid = [];
    
    /* create zero-valued grid */
    for(var j = 0; j < dy; ++j){
      for(var i = 0; i < dx; ++i){
        ObjectiveGrid.push({v: 0, d: 0, w: 0, x: gridCoord2ValueX(i), y: gridCoord2ValueY(j)});
      }
    }
  
    /* start to fill the grid with values */
    xr_local = xr;
    yr_local = yr;

    var progressFactor  = 1 / iterations;
    var totalWork       = ObjectiveGrid.length;
    var stepSize        = 100. / totalWork;
    var progress        = 0;

    var mainloop = function(iter, k){
      var p;
      
      for(p = k; p < Math.min(k + workpackageSize, ObjectiveGrid.length); ++p){
        if(ObjectiveGrid[p].d < n){

          ObjectiveGrid[p].d = 0;
          ObjectiveGrid[p].v = 0;
          ObjectiveGrid[p].w = 0;
          var x = ObjectiveGrid[p].x,
              y = ObjectiveGrid[p].y;

          data.forEach(function(d, l){
            x_dist = Math.abs(d[0] - x);
            y_dist = Math.abs(d[1] - y);
            if((x_dist <= xr_local) && (y_dist <= yr_local)){
              w = getObjectiveWeight(xr_local, yr_local, x_dist, y_dist);
              ObjectiveGrid[p].v += w * d[2];
              ObjectiveGrid[p].w += w;
              ObjectiveGrid[p].d++;
            }
          });

          if(typeof progressCallback === 'function'){
            progress += progressFactor * stepSize;
            progressCallback(progress);
          }
        }
      }

      /* prepare next iteration */
      if(p === ObjectiveGrid.length){
        p = 0;
        /* increase the search radius */
        xr_local *= Math.sqrt(2);
        yr_local *= Math.sqrt(2);
        iter--;
      }

      if(iter >= 0){
        setTimeout(function(){ mainloop(iter, p);}, 1);
      } else {
        setTimeout(finish, 1);
      }
    };

    var finish = function(){
      /* map back data of the ObjectiveGrid */
      ObjectiveGrid.forEach(function(d){
        var i = d.i,
            j = d.j,
            z = d.v / d.w;
        grid[j][i] = z;
      });

      if(typeof progressCallback === 'function'){
        progressCallback(100);
      }
  
      /* send data to the callback function */
      successCallback(grid);
    };

    /* start the objective grid method */
    if(typeof progressCallback === 'function'){
      progressCallback(progress);
    }
    mainloop(iterations - 1, 0);

    return null;
  };
  
  function getObjectiveWeight(Rx, Ry, dx, dy){
    if(dx <= Rx && dy <= Ry){
      R = Math.sqrt(Rx * Rx + Ry * Ry);
      r = Math.sqrt(dx * dx + dy * dy);
      u = R * R - r * r;
      l = R * R + r * r;
      return ((u / l) * (u / l));
    } else {
      return 0.;
    }
  }

  if(! my.availableMethods){
    my.availableMethods = [];
  }

  my.availableMethods.push({name: "objective", f: ObjectiveMethod});

  return my;
}(Data2GridJS || {}));
