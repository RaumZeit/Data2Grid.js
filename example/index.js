  var xs, ys;

  /* we only have negative z-values below */
  var intervals = [-17.5, -15, -12.5, -10, -7.5, -5, -2.5, 0];

  /*
    final SVG image orientation:

    [0, 0], ... , [n, 0]
      ...           ...
    [0, m], ... , [n, m]

    with x in [0, n], y in [0, m]

  */

  /* some random [x, y, z] values */
  var data = [
[ 31.76,  40.08, -12.80],
[ 28.78,  10.29, -11.00],
[  7.70,   0.33, -19.30],
[  2.16,  16.96, -10.50],
[  9.90,   3.58, -17.80],
[ 28.64,  58.63,  -8.90],
[ 13.70,  41.82,  -7.00],
[ 14.53,  56.44,   7.70],
[ 19.46,  42.41, -12.60],
[ 14.40,  32.80, -11.40],
[ 42.52,   5.20, -13.00],
[ 50.31,  35.57, -16.70],
[ 26.08,  42.93, -15.70],
[ 28.18,   1.56, -12.10],
[ 40.22,   8.21, -12.60],
[  7.46,   2.33, -10.90],
[ 25.47,  33.87, -18.20],
[ 34.77,  22.31, -10.20],
[ 27.52,  17.20, -11.50],
[ 40.47,  55.42, -10.90],
[ 41.09,  23.67,  -8.40],
[  1.70,   0.28,  -5.50],
[ 31.56,  11.61, -17.30],
[ 27.05,  34.07, -14.20],
[ 48.81,  47.26, -10.00],
[ 29.32,   8.51, -10.80],
[  5.29,   3.71,  -7.90],
[ 47.13,   8.32, -17.20],
[ 52.57,  11.14,  -6.60],
[ 21.63,  42.05,  -3.40]
  ];

  /* put these values into a 50x50 grid using 'Objective' method */
  Data2GridJS.convertToGrid(data, {method: "objective", dx: 50, dy: 50, verbose: true}, cb_objective);

  /* put these values into a 50x50 grid using 'Barnes' method */
  Data2GridJS.convertToGrid(data, {method: "barnes", dx: 50, dy: 50, verbose: true}, cb_barnes);

  /* callback for 'objective method' */
  function cb_objective(grid){
    console.log(grid);

    isoBands = makeIsoBands(grid);
    drawLines('#isobands_objective', isoBands, intervals);
  }

  /* callback for 'barnes method' */
  function cb_barnes(grid){
    console.log(grid);

    isoBands = makeIsoBands(grid);
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
