var Data2GridJS = (function(my){
  /* implementation of the Barnes Method */

  

  var BarnesMethod = function(data, grid, options, successCallback){
      var xr                = options.xr,
          yr                = options.yr,
          dx                = options.dx,
          dy                = options.dy,
          min_x             = options.min_x,
          max_x             = options.max_x,
          min_y             = options.min_y,
          max_y             = options.max_y,
          iterations        = options.iterations,  
          gamma             = options.gamma,       
          workpackageSize   = options.workpackageSize,
          progressCallback  = options.progressCallback;

      console.log("converting data to grid [" + dx + " x " + dy + "] using \" Barnes\" method");
      console.log("xr=" + xr + " yr=" + yr + " gamma=" + gamma + " iterations=" + iterations);

      var gridSpanX = (max_x - min_x) / dx;
      var gridSpanY = (max_y - min_y) / dy;
  
      var BarnesGrid = [];
      /* create zero-valued grid */
      for(var i = 0; i < dx; ++i){
        for(var j = 0; j < dy; ++j){
          var x = min_x + gridSpanX/2 + i * gridSpanX;
          var y = min_y + gridSpanY/2 + j * gridSpanY;
          var z = 0;
          BarnesGrid.push([x, y, z]);
        }
      }

      /* compute closest gridpoint for each datum */
      var closest = [];
      data.forEach(function(d, k){
        var i     = 0;
        var dist  = Math.sqrt((d[0] - BarnesGrid[i][1])*(d[0] - BarnesGrid[i][1]) + ((d[1] - BarnesGrid[i][1]) * (d[1] - BarnesGrid[i][1])));
        for(var j = i + 1; j < BarnesGrid.length; ++j){
          var dd = Math.sqrt((d[0] - BarnesGrid[j][1])*(d[0] - BarnesGrid[j][1]) + ((d[1] - BarnesGrid[j][1]) * (d[1] - BarnesGrid[j][1])));
          if(dd < dist){
            dist = dd;
            i = j;
          }
        }
        closest[k] = i;
      });
  
      var BarnesGrid2Data = function(g, d, idx){ return g[closest[idx]][2]; };
      var progressFactor  = 1 / iterations;
      var totalWork       = BarnesGrid.length;
      var stepSize        = 100. / totalWork;
      var progress        = 0;
      var oldGrid         = [];
      
  
      var constructPrevGrid = function(){
        /* copy over previous grid */
        BarnesGrid.forEach(function(d,i){
          oldGrid.push([ d[0], d[1], d[2] ]);
        });
      }
  
      var mainloop = function(iter, i){
        var j;
        for(j = i; j < Math.min(i + workpackageSize, BarnesGrid.length); ++j){
          BarnesGrid[j][2] = getGridPointBarnes(data, oldGrid, j, BarnesGrid2Data , gamma, xr, yr, iter);
          if(typeof progressCallback === 'function'){
            progress += progressFactor * stepSize;
            progressCallback(progress);
          }
        }
  
        i = j
  
        /* prepare next iteration */
        if(i === BarnesGrid.length){
          i = 0;
          iter--;
          constructPrevGrid();
        }
  
        if(iter >= 0){
          setTimeout(function(){ mainloop(iter, i);}, 1);
        } else {
          setTimeout(finish, 1);
        }
      };
  
      var finish = function(){
        /* finally, convert grid to actual 2D array */
        grid = [];
        /* create zero-valued grid */
        for(var j = 0; j < dy; ++j){
          grid[j] = [];
          for(var i = 0; i < dx; ++i){
            grid[j][i] = 0;
          }
        }
  
        /* copy over data from BarnesGrid */
        BarnesGrid.forEach(function(d){
          var i = Math.round((d[0] - min_x - gridSpanX/2) / gridSpanX);
          var j = Math.round((d[1] - min_y - gridSpanY/2) / gridSpanY);
          grid[j][i] = d[2];
        });
  
        if(typeof progressCallback === 'function'){
          progressCallback(100);
        }
  
        /* send data to the callback function */
        successCallback(grid);
      };
  
      /* prepare for Barnes method */
      constructPrevGrid();
  
      /* now, apply barnes method for each gridpoint */
      mainloop(iterations - 1, 0);
  
    };

  /*
    data and grid must be a list of 3-tuples (x, y, z), where
    x and y denote planar coordinates, and z the value for this
    data point
  
    grid_i is the index of the current grid point that is about
    to be evaluated.
  */
  function getGridPointBarnes(data, grid, grid_i, dataFromGrid, gamma, Lx, Ly, iteration){
  
    /* set default values */
    gamma     = (typeof gamma !== 'undefined') ? gamma : 0.5;
    Lx        = (typeof Lx !== 'undefined') ? Lx : 2.;
    Ly        = (typeof Ly !== 'undefined') ? Ly : 2.;
    iteration = (typeof iteration !== 'undefined' ) ? iteration : 0;
  
    var f_zero  = function(){ return 0; };
  
    dataFromGrid = (typeof dataFromGrid !== 'undefined') ? dataFromGrid : getGridPointBarnes;
    dataFromGrid = ((dataFromGrid === null)) ? f_zero : dataFromGrid;
  
    var weightSum = 0;
    var addValue = 0;
    var newValue = grid[grid_i][2];
  
    data.forEach(function(d,i){
      var w       = getBarnesWeight(d[0], d[1], grid[grid_i][0], grid[grid_i][1], gamma, Lx, Ly, iteration);
      addValue   += w * (d[2] - dataFromGrid(grid, data, i, null, gamma, Lx, Ly, 0));
      weightSum  += w;
    });
  
    newValue += addValue / weightSum;
  
    return newValue;
  }
  
  function getBarnesWeight(x, y, grid_x, grid_y, gamma, Lx, Ly, iteration){
    var w_x = Math.pow(Math.sqrt(gamma), iteration) * Lx;
    var w_y = Math.pow(Math.sqrt(gamma), iteration) * Ly;
    var d_x = x - grid_x;
    var d_y = y - grid_y;
  
    d_x *= d_x;
    d_y *= d_y;
    w_x *= w_x;
    w_y *= w_y;
   
    return Math.exp( - d_x / w_x - d_y / w_y);
  } 

  if(! my.availableMethods){
    my.availableMethods = [];
  }

  my.availableMethods.push({name: "barnes", f: BarnesMethod});

  return my;
}(Data2GridJS || {}));
