var Data2GridJS = (function(my){

  var defaultOptions = {
    dx:               20,
    dy:               20,
    method:           "objective",
    iterations:       2,
    n:                5,
    gamma:            0.5,
    xr:               null,
    yr:               null,
    workpackageSize:  50,
    progressCallback: null,
    verbose:          false
  };

  my.availableMethods = [];

  my.convertToGrid = function(data, options, successCallback){
  
    /* process options */
    options = options ? options : {};
  
    var optionKeys = Object.keys(defaultOptions);
    for(var i = 0; i < optionKeys.length; i++){
      var key = optionKeys[i];
      var val = options[key];
      val = ((typeof val !== 'undefined') && (val !== null)) ? val : defaultOptions[key];

      if(!my.options){
        my.options = {};
      }

      my.options[key] = val;
    }

    data2grid(data, my.options, successCallback);
  };

  function data2grid(data, options, successCallback){
  
    var grid = null,
        method,
        dx,
        dy,
        xr,
        yr,
        iterations,
        n,
        gamma,
        workpackageSize,
        progressCallback;
  
    /* apply options */
  
    dx              = (options.dx < 1) ? defaultOptions.dx : Math.round(options.dx);
    dy              = (options.dy < 1) ? defaultOptions.dy : Math.round(options.dy);
    method          = options.method;
    workpackageSize = ((typeof options.workpackageSize !== 'number') || (options.workpackageSize <= 0)) ? defaultOptions.workpackageSize : Math.round(options.workpackageSize);
    gamma           = ((typeof options.gamma !== 'number') || (options.gamma <= 0.)) ? defaultOptions.gamma : options.gamma;
    iterations      = ((typeof options.iterations !== 'number') || (options.iterations <= 0)) ? defaultOptions.iterations : options.iterations;
    n               = ((typeof options.n !== 'number') || (options.n < 0)) ? defaultOptions.n : options.n;
    verbose         = options.verbose;
    progressCallback = options.progressCallback;
      
    if(typeof successCallback !== 'function'){
      console.log("callback function missing! Don't know where to send the result to, so we are bailing out!");
      return;
    }
  
    console.log(options);
  
    /*
        Determine xr and yr
  
        Method taken from:
  
        S. E. Koch and M. DesJardins and P. J. Kocin, 1983.
        "An interactive Barnes objective map anlaysis scheme for use with satellite and conventional data."
        J. Climate Appl. Met., vol 22, p. 1487-1503.
  
    */
    xr  = ((typeof options.xr === 'number') && options.xr > 0.) ? options.xr : (dx / Math.sqrt(data.length)) * Math.sqrt(2);
    yr  = ((typeof options.yr === 'number') && options.yr > 0.) ? options.yr : (dy / Math.sqrt(data.length)) * Math.sqrt(2);
  
    console.log("converting data to grid [" + dx + " x " + dy + "] using \"" + method + "\" method");
    console.log("xr=" + xr + " yr=" + yr + " gamma=" + gamma + " iterations=" + iterations);
  
    var min_x, max_x, min_y, max_y, tmp;
    var i = -1,
        l = data.length;

    /* get the min and max values of x-coordinates [borrowed from d3.extent()] */
    while (++i < l) if ((tmp = data[i][0]) != null && tmp >= tmp) { min_x = max_x = tmp; break; }
    while (++i < l) if ((tmp = data[i][0]) != null) {
      if (min_x > tmp) min_x = tmp;
      if (max_x < tmp) max_x = tmp;
    }

    /* get the min and max values of y-coordinates [borrowed from d3.extent()] */
    i = -1;
    while (++i < l) if ((tmp = data[i][1]) != null && tmp >= tmp) { min_y = max_y = tmp; break; }
    while (++i < l) if ((tmp = data[i][1]) != null) {
      if (min_y > tmp) min_y = tmp;
      if (max_y < tmp) max_y = tmp;
    }

    options.min_x = min_x;
    options.max_x = max_x;
    options.min_y = min_y;
    options.max_y = max_y;
    options.xr    = xr;
    options.yr    = yr;
    options.dx    = dx;
    options.dy    = dy;
    options.workpackageSize = workpackageSize;
    options.gamma = gamma;
    options.iterations = iterations;
    options.n     = n;
    options.verbose = verbose;
    options.progressCallback = progressCallback;


    console.log("X: [" + min_x + " : " + max_x + "], Y: [" + min_y + " : " + max_y + "]");

    var applyNeighborMethod = function(){
      /* apply 'Neighbor' method */
  
      var x_scale = d3.scale.linear()
                      .domain([min_x, max_x])
                      .range([0, dx - 1]);
      var y_scale = d3.scale.linear()
                      .domain([min_y, max_y])
                      .range([0, dy - 1]);
  
      grid = [];
      /* create zero-valued grid */
      for(var i = 0; i < dx; ++i){
        grid[i] = [];
        for(var j = 0; j < dy; ++j){
          grid[i][j] = []; /* create an empty list of candidate values */
        }
      }
  
      data.forEach(function(d, i){
        /* find nearest gridpoint */
        var d_i = x_scale(d[0]);
        var d_j = y_scale(d[1]);
        var g_i = Math.round(d_i);
        var g_j = Math.round(d_j);
        var distance = Math.sqrt((d_i - g_i) * (d_i - g_i) + (d_j - g_j) * (d_j - g_j));
        grid[g_i][g_j].push({d: distance, z: d[2]});
      });
  
      /* now loop over the grid to assign closest z-values */
      grid.forEach(function(d, i){
        d.forEach(function(dd, j){
          var z = 0.;
          if(dd.length > 0){
            var closestIndex = 0;
            var closestDistance = dd[0].d;
            for(var k = 1; k < dd.length; ++k){
              if(dd[k].d < closestDistance){
                closestDistance = dd[k].d;
                closestIndex = k;
              }
            }
            z = dd[closestIndex].z;
          }
          grid[i][j] = z;
        });
      });
  
      /* send data to the callback function */
      successCallback(grid);
    };

    if(! my.availableMethods){
      my.availableMethods = [];
    }

    my.availableMethods.push({name: "objective", f: applyObjectiveMethod});

    var applyObjectiveMethod = function(){
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
  
      /* start filling the grid with values */
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
  
      /* map back data of the ObjectiveGrid */
      for(var j = 0; j < dy; ++j){
        for(var i = 0; i < dx; ++i){
          ObjectiveGrid[j][i] = ObjectiveGrid[j][i].v / ObjectiveGrid[j][i].w;
        }
      }
  
      if(typeof progressCallback === 'function'){
        progressCallback(100);
      }
  
      /* send data to the callback function */
      successCallback(ObjectiveGrid);
    };

    var methodFound = false;
    my.availableMethods.forEach(function(m){
      if(method === m.name){
        console.log(m);
        setTimeout(function(){ m.f(data, grid, options, successCallback); }, 1);
        methodFound = true;
      }
    });

    if(!methodFound){
      console.log("ERROR: Unrecognized conversion method!");
      if(typeof progressCallback === 'function'){
        progressCallback(100);
      }
    }

/*
    if(method === "neighbor"){
      setTimeout(applyNeighborMethod, 1);
    } else if(method === "barnes"){
      setTimeout(function(){ my.BarnesMethod(data, grid, options, successCallback); }, 1);
    } else if(method === "objective"){
      setTimeout(applyObjectiveMethod, 1);
    } else {
      console.log("ERROR: Unrecognized conversion method!");
      if(typeof progressCallback === 'function'){
        progressCallback(100);
      }
    }
*/

    return null;
  }
  
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
  

  return my;
}(Data2GridJS || {}));
