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
        progressCallback  = options.progressCallback;

    console.log("converting data to grid [" + dx + " x " + dy + "] using \"Objective\" method");
    console.log("xr=" + xr + " yr=" + yr + " n=" + n + " iterations=" + iterations);

    var gridSpanX = (max_x - min_x) / dx;
    var gridSpanY = (max_y - min_y) / dy;
  
    var gridCoord2ValueX = function(x){ return min_x + gridSpanX/2 + x * gridSpanX;};
    var gridCoord2ValueY = function(y){ return min_y + gridSpanY/2 + y * gridSpanY;};
  
    var ObjectiveGrid = [];
    
    /* create zero-valued grid */
    for(var j = 0; j < dy; ++j){
      ObjectiveGrid[j] = [];
      for(var i = 0; i < dx; ++i){
        ObjectiveGrid[j][i] = {v: 0, d: 0, w: 0};
      }
    }
  
    /* start to fill the grid with values */
    xr_local = xr;
    yr_local = yr;
    for(iter = 0; iter < iterations; iter++){
      //console.log("iter: " + iter);
      for(var j = 0; j < dy; ++j){
        for(var i = 0; i < dx; ++i){
          /* try to find at least n datapoints in the vicinity of this grid cell */
          if(ObjectiveGrid[j][i].d < n){
            //console.log(i + "," + j);
            ObjectiveGrid[j][i].d = 0;
            ObjectiveGrid[j][i].v = 0;
            ObjectiveGrid[j][i].w = 0;
  
            data.forEach(function(d, k){
              x_dist = Math.abs(d[0] - gridCoord2ValueX(i));
              y_dist = Math.abs(d[1] - gridCoord2ValueY(j));
              if((x_dist <= xr_local) && (y_dist <= yr_local)){
                w = getObjectiveWeight(xr_local, yr_local, x_dist, y_dist);
                ObjectiveGrid[j][i].v += w * d[2];
                ObjectiveGrid[j][i].w += w;
                ObjectiveGrid[j][i].d++;
              }
            });
          }
        }
      }
      /* increase the search radius */
      xr_local *= Math.sqrt(2);
      yr_local *= Math.sqrt(2);
    }
  
    var finish = function(){
      /* map back data of the ObjectiveGrid */
      for(var j = 0; j < dy; ++j){
        for(var i = 0; i < dx; ++i){
          grid[j][i] = ObjectiveGrid[j][i].v / ObjectiveGrid[j][i].w;
        }
      }

      if(typeof progressCallback === 'function'){
        progressCallback(100);
      }
  
      /* send data to the callback function */
      successCallback(grid);
    };

    finish();
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
