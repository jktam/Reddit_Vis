var filterHeat;

filterHeat = function(color) {
  return d3.selectAll('rect').each(function(d, i) {
    if (d3.select(this).attr("fill") === color && d3.select(this).attr("class") === 'partofheatmap') {
      d3.select(this).attr('id', d3.select(this).attr("fill"));
      return d3.select(this).transition().duration(1000).attr('fill', '#ffffff');
    } else if (d3.select(this).attr("id") === color && d3.select(this).attr("fill") === "#ffffff") {
      return d3.select(this).transition().duration(1000).attr('fill', d3.select(this).attr('id'));
    }
  });
};

(function() {
  var axisHeight, axisWidth, cellSize, colorCalibration, dailyValueExtent, data, dateExtent, dayFormat, dayOffset, heatmap, height, hourFormat, initCalibration, itemSize, margin, monthDayFormat, rect, renderColor, svg, timeFormat, width, xAxis, xAxisScale, yAxis, yAxisScale;
  itemSize = 24;
  cellSize = itemSize - 1;
  width = 750;
  height = 630;
  margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 25
  };
  hourFormat = d3.time.format('%H');
  dayFormat = d3.time.format('%j');
  timeFormat = d3.time.format('%Y-%m-%dT%X');
  monthDayFormat = d3.time.format('day %d');
  dateExtent = null;
  data = null;
  dayOffset = 0;
  colorCalibration = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];
  dailyValueExtent = {};
  axisWidth = 0;
  axisHeight = itemSize * 24;
  xAxisScale = d3.time.scale();
  xAxis = d3.svg.axis().orient('top').ticks(d3.time.days, 3).tickFormat(monthDayFormat);
  yAxisScale = d3.scale.linear().range([0, axisHeight]).domain([0, 24]);
  yAxis = d3.svg.axis().orient('left').ticks(5).tickFormat(d3.format("02d")).scale(yAxisScale);
  initCalibration = function() {
    d3.select('[role="calibration"] [role="example"]').select('svg').selectAll('rect').data(colorCalibration).enter().append('rect').attr('width', cellSize).attr('class', 'partoflegend').attr('height', cellSize).on('click', function(d) {
      return filterHeat(d);
    }).attr('x', function(d, i) {
      return i * itemSize;
    }).attr('fill', function(d) {
      return d;
    });
    d3.selectAll('[role="calibration"] [name="displayType"]').on('click', function() {
      renderColor();
    });
  };
  renderColor = function() {
    var renderByCount;
    renderByCount = document.getElementsByName('displayType')[0].checked;
    rect.filter(function(d) {
      return d.value['count'] >= 0;
    }).transition().delay(function(d) {
      return (dayFormat(d.date) - dayOffset) * 15;
    }).duration(500).attrTween('fill', function(d, i, a) {
      var colorIndex;
      colorIndex = d3.scale.quantize().range([0, 1, 2, 3, 4, 5]).domain(renderByCount ? [0, 1000] : dailyValueExtent[d.day]);
      return d3.interpolate(a, colorCalibration[colorIndex(d.value['count'])]);
    });
  };
  initCalibration();
  svg = d3.select('[role="heatmap"]');
  heatmap = svg.attr('width', width).attr('height', height).append('g').attr('width', width - margin.left - margin.right).attr('height', height - margin.top - margin.bottom).attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  rect = null;
  d3.json('data/final.json', function(err, data) {
    data = data.data;
    data.forEach(function(valueObj) {
      var day, dayData, killcountValue;
      valueObj['date'] = timeFormat.parse(valueObj['timestamp']);
      day = valueObj['day'] = monthDayFormat(valueObj['date']);
      dayData = dailyValueExtent[day] = dailyValueExtent[day] || [1000, -1];
      killcountValue = valueObj['value']['count'];
      dayData[0] = d3.min([dayData[0], killcountValue]);
      dayData[1] = d3.max([dayData[1], killcountValue]);
    });
    dateExtent = d3.extent(data, function(d) {
      return d.date;
    });
    axisWidth = itemSize * (dayFormat(dateExtent[1]) - dayFormat(dateExtent[0]) + 1);
    xAxis.scale(xAxisScale.range([0, axisWidth]).domain([dateExtent[0], dateExtent[1]]));
    svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').attr('class', 'x axis').call(xAxis).append('text').text('date').attr('transform', 'translate(' + axisWidth + ',-10)');
    svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').attr('class', 'y axis').call(yAxis).append('text').text('time').attr('transform', 'translate(-10,' + axisHeight + ') rotate(-90)');
    dayOffset = dayFormat(dateExtent[0]);
    rect = heatmap.selectAll('rect').data(data).enter().append('rect').attr('width', cellSize).attr('height', cellSize).attr('x', function(d) {
      return itemSize * (dayFormat(d.date) - dayOffset);
    }).attr('y', function(d) {
      return hourFormat(d.date) * itemSize;
    }).attr('class', 'partofheatmap').attr('fill', '#ffffff');
    rect.filter(function(d) {
      return d.value['count'] > 0;
    }).append('title').text(function(d) {
      return monthDayFormat(d.date) + ', kills: ' + d.value['count'];
    });
    renderColor();
  });
})();