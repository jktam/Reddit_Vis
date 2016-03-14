var Bubbles, drawBar, drawheat, reset, root;

window.titleList = void 0;

window.titleArray = [];

root = typeof exports !== "undefined" && exports !== null ? exports : this;

reset = false;

Bubbles = function() {
  var chart, clear, click, collide, collisionPadding, connectEvents, data, force, gravity, hashchange, height, idValue, jitter, label, margin, maxRadius, minCollisionRadius, mouseout, mouseover, node, rScale, rValue, textValue, tick, transformData, update, updateActive, updateLabels, updateNodes, width;
  width = screen.width;
  height = screen.height / 3;
  data = [];
  node = null;
  label = null;
  margin = {
    top: 5,
    right: 0,
    bottom: 0,
    left: 100
  };
  maxRadius = 50;
  rScale = d3.scale.sqrt().range([15, maxRadius]);
  rValue = function(d) {
    return parseFloat(d.tfidf);
  };
  idValue = function(d) {
    return d.word;
  };
  textValue = function(d) {
    return d.word;
  };
  collisionPadding = 4;
  minCollisionRadius = 12;
  jitter = 0.5;
  transformData = function(rawData) {
    rawData.forEach(function(d) {
      d.tfidf = parseFloat(d.tfidf);
      return rawData.sort(function() {
        return 0.5 - Math.random();
      });
    });
    return rawData;
  };
  tick = function(e) {
    var dampenedAlpha;
    dampenedAlpha = e.alpha * 0.1;
    node.each(gravity(dampenedAlpha)).each(collide(jitter)).attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
    return label.style("left", function(d) {
      return ((margin.left + d.x) - d.dx / 2) + "px";
    }).style("top", function(d) {
      return ((margin.top + d.y) - d.dy / 2) + "px";
    });
  };
  force = d3.layout.force().gravity(0).charge(0).size([width, height]).on("tick", tick);
  chart = function(selection) {
    return selection.each(function(rawData) {
      var maxDomainValue, svg, svgEnter;
      data = transformData(rawData);
      maxDomainValue = d3.max(data, function(d) {
        return rValue(d);
      });
      rScale.domain([0, maxDomainValue]);
      d3.select("svg").remove;
      svg = d3.select(this).selectAll("svg").data([data]);
      svgEnter = svg.enter().append("svg");
      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);
      node = svgEnter.append("g").attr("id", "bubble-nodes").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      node.append("rect").attr("id", "bubble-background").attr("width", width).attr("height", height).on("click", clear);
      d3.select(this).selectAll('#bubble-labels').remove();
      label = d3.select(this).selectAll("#bubble-labels").data([data]).enter().append("div").attr("id", "bubble-labels");
      update();
      hashchange();
      return d3.select(window).on("hashchange", hashchange);
    });
  };
  update = function() {
    data.forEach(function(d, i) {
      return d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)));
    });
    force.nodes(data).start();
    updateNodes();
    return updateLabels();
  };
  updateNodes = function() {
    node = node.selectAll(".bubble-node").data(data, function(d) {
      return idValue(d);
    });
    node.exit().remove();
    return node.enter().append("a").attr("class", "bubble-node").attr("xlink:href", function(d) {
      return "#" + (encodeURIComponent(idValue(d)));
    }).call(force.drag).call(connectEvents).append("circle").attr("r", function(d) {
      return rScale(rValue(d));
    });
  };
  updateLabels = function() {
    var labelEnter;
    label = label.selectAll(".bubble-label").data(data, function(d) {
      return idValue(d);
    });
    label.exit().remove();
    labelEnter = label.enter().append("a").attr("class", "bubble-label").attr("href", function(d) {
      return "#" + (encodeURIComponent(idValue(d)));
    }).call(force.drag).call(connectEvents);
    labelEnter.append("div").attr("class", "bubble-label-name").text(function(d) {
      return textValue(d);
    });
    labelEnter.append("div").attr("class", "bubble-label-value").text(function(d) {
      return rValue(d);
    });
    label.style("font-size", function(d) {
      return Math.max(8, rScale(rValue(d) / 2)) + "px";
    }).style("width", function(d) {
      return 2.5 * rScale(rValue(d)) + "px";
    });
    label.append("span").text(function(d) {
      return textValue(d);
    }).each(function(d) {
      return d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width);
    }).remove();
    label.style("width", function(d) {
      return d.dx + "px";
    });
    return label.each(function(d) {
      return d.dy = this.getBoundingClientRect().height;
    });
  };
  gravity = function(alpha) {
    var ax, ay, cx, cy;
    cx = width / 2;
    cy = height / 2;
    ax = alpha / 8;
    ay = alpha;
    return function(d) {
      d.x += (cx - d.x) * ax;
      return d.y += (cy - d.y) * ay;
    };
  };
  collide = function(jitter) {
    return function(d) {
      return data.forEach(function(d2) {
        var distance, minDistance, moveX, moveY, x, y;
        if (d !== d2) {
          x = d.x - d2.x;
          y = d.y - d2.y;
          distance = Math.sqrt(x * x + y * y);
          minDistance = d.forceR + d2.forceR + collisionPadding;
          if (distance < minDistance) {
            distance = (distance - minDistance) / distance * jitter;
            moveX = x * distance;
            moveY = y * distance;
            d.x -= moveX;
            d.y -= moveY;
            d2.x += moveX;
            return d2.y += moveY;
          }
        }
      });
    };
  };
  connectEvents = function(d) {
    d.on("click", click);
    d.on("mouseover", mouseover);
    return d.on("mouseout", mouseout);
  };
  clear = function() {
    return location.replace("#");
  };
  click = function(d) {
    location.replace("#" + encodeURIComponent(idValue(d)));
    return updateList(d);
  };
  hashchange = function() {
    var id;
    id = decodeURIComponent(location.hash.substring(1)).trim();
    return updateActive(id);
  };
  updateActive = function(id) {
    return node.classed("bubble-selected", function(d) {
      return id === idValue(d);
    });
  };
  mouseover = function(d) {
    return node.classed("bubble-hover", function(p) {
      return p === d;
    });
  };
  mouseout = function(d) {
    return node.classed("bubble-hover", false);
  };
  chart.jitter = function(_) {
    if (!arguments.length) {
      return jitter;
    }
    jitter = _;
    force.start();
    return chart;
  };
  chart.height = function(_) {
    if (!arguments.length) {
      return height;
    }
    height = _;
    return chart;
  };
  chart.width = function(_) {
    if (!arguments.length) {
      return width;
    }
    width = _;
    return chart;
  };
  chart.r = function(_) {
    if (!arguments.length) {
      return rValue;
    }
    rValue = _;
    return chart;
  };
  return chart;
};

root.plotData = function(selector, data, plot) {
  return d3.select(selector).datum(data).call(plot);
};

root.updateList = function(d) {
  var selectedtext;
  window.titleArray = [];
  window.titleList.forEach(function(entry) {
    if (entry.title.toLowerCase().indexOf(d.word) !== -1) {
      return window.titleArray.push(entry);
    }
  });
  selectedtext = "<table id = \"titletable\"> <tr><th>Score</th><th>Title</th> </tr> ";
  window.titleArray.forEach(function(entry) {
    return selectedtext = selectedtext + "<tr><td>" + entry.score + "</td><td>" + entry.title + "</td></tr>";
  });
  selectedtext = selectedtext + "</table>";
  return d3.select('#titlelist').html(selectedtext);
};

$(function() {
  var aclist, display, plot;
  aclist = [
    {
      value: '4chan'
    }, {
      value: 'AbandonedPorn'
    }, {
      value: 'adventuretime'
    }, {
      value: 'AdviceAnimals'
    }, {
      value: 'AnimalsBeingJerks'
    }, {
      value: 'anime'
    }, {
      value: 'arresteddevelopment'
    }, {
      value: 'AskReddit'
    }, {
      value: 'aww'
    }, {
      value: 'awwnime'
    }, {
      value: 'batman'
    }, {
      value: 'battlefield3'
    }, {
      value: 'bestof'
    }, {
      value: 'breakingbad'
    }, {
      value: 'britishproblems'
    }, {
      value: 'carporn'
    }, {
      value: 'circlejerk'
    }, {
      value: 'comicbooks'
    }, {
      value: 'comics'
    }, {
      value: 'community'
    }, {
      value: 'cosplay'
    }, {
      value: 'CrazyIdeas'
    }, {
      value: 'creepy'
    }, {
      value: 'creepyPMs'
    }, {
      value: 'cringe'
    }, {
      value: 'cringepics'
    }, {
      value: 'DaftPunk'
    }, {
      value: 'darksouls'
    }, {
      value: 'doctorwho'
    }, {
      value: 'DoesAnybodyElse'
    }, {
      value: 'DotA2'
    }, {
      value: 'DunderMifflin'
    }, {
      value: 'EarthPorn'
    }, {
      value: 'facepalm'
    }, {
      value: 'Fallout'
    }, {
      value: 'FanTheories'
    }, {
      value: 'fatpeoplestories'
    }, {
      value: 'fffffffuuuuuuuuuuuu'
    }, {
      value: 'FiftyFifty'
    }, {
      value: 'firstworldanarchists'
    }, {
      value: 'FoodPorn'
    }, {
      value: 'funny'
    }, {
      value: 'futurama'
    }, {
      value: 'gamegrumps'
    }, {
      value: 'gameofthrones'
    }, {
      value: 'Games'
    }, {
      value: 'gaming'
    }, {
      value: 'geek'
    }, {
      value: 'gifs'
    }, {
      value: 'harrypotter'
    }, {
      value: 'HIMYM'
    }, {
      value: 'hiphopheads'
    }, {
      value: 'HistoryPorn'
    }, {
      value: 'IAmA'
    }, {
      value: 'Jokes'
    }, {
      value: 'JusticePorn'
    }, {
      value: 'KerbalSpaceProgram'
    }, {
      value: 'leagueoflegends'
    }, {
      value: 'magicTCG'
    }, {
      value: 'MapPorn'
    }, {
      value: 'masseffect'
    }, {
      value: 'mildlyinfuriating'
    }, {
      value: 'mildlyinteresting'
    }, {
      value: 'mindcrack'
    }, {
      value: 'Minecraft'
    }, {
      value: 'movies'
    }, {
      value: 'MURICA'
    }, {
      value: 'Music'
    }, {
      value: 'mylittlepony'
    }, {
      value: 'Naruto'
    }, {
      value: 'nosleep'
    }, {
      value: 'nostalgia'
    }, {
      value: 'nottheonion'
    }, {
      value: 'OldSchoolCool'
    }, {
      value: 'onetruegod'
    }, {
      value: 'Pareidolia'
    }, {
      value: 'PerfectTiming'
    }, {
      value: 'pettyrevenge'
    }, {
      value: 'photoshopbattles'
    }, {
      value: 'pics'
    }, {
      value: 'Planetside'
    }, {
      value: 'pokemon'
    }, {
      value: 'polandball'
    }, {
      value: 'QuotesPorn'
    }, {
      value: 'rage'
    }, {
      value: 'reactiongifs'
    }, {
      value: 'RoomPorn'
    }, {
      value: 'roosterteeth'
    }, {
      value: 'skyrim'
    }, {
      value: 'starcraft'
    }, {
      value: 'startrek'
    }, {
      value: 'StarWars'
    }, {
      value: 'TalesFromRetail'
    }, {
      value: 'tf2'
    }, {
      value: 'TheLastAirbender'
    }, {
      value: 'TheSimpsons'
    }, {
      value: 'thewalkingdead'
    }, {
      value: 'TrollXChromosomes'
    }, {
      value: 'TumblrInAction'
    }, {
      value: 'Unexpected'
    }, {
      value: 'videos'
    }, {
      value: 'wallpapers'
    }, {
      value: 'wheredidthesodago'
    }, {
      value: 'woahdude'
    }, {
      value: 'wow'
    }, {
      value: 'WTF'
    }, {
      value: 'youtubehaiku'
    }, {
      value: 'zelda'
    }
  ];
  return $('#autocomp').autocomplete({
    source: aclist,
    focus: function(event, ui) {
      $('#autocomp').val(ui.item.value);
      return false;
    },
    select: function(event, ui) {
      var plot;
      d3.csv("titlescoredate_csv/" + ui.item.value + ".csv", function(data) {
        return window.titleList = data;
      });
      d3.select("svg").remove();
      d3.select("#barchartsvg").remove();
      d3.select("#heatmapsvg").remove();
      plot = Bubbles();
      d3.csv("tfidf_csv/" + ui.item.value + ".csv", display);
      drawBar(ui.item.value);
      drawheat(ui.item.value);
      return false;
    }
  }, plot = Bubbles(), display = function(data) {
    return plotData("#bubblecloudvis", data, plot);
  });
});

drawheat = function(csvName) {
  var buckets, colors, days, filename, gridSize, height, legendElementWidth, margin, times, width;
  margin = {
    top: 50,
    right: 0,
    bottom: 100,
    left: 30
  };
  width = screen.width / 2.5 - margin.left - margin.right;
  height = screen.height / 3 - margin.top - margin.bottom;
  gridSize = Math.floor(width / 24);
  legendElementWidth = gridSize * 2;
  buckets = 9;
  colors = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  times = ['1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12a', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p', '12p'];
  filename = 'timescore_csv/' + csvName + '.csv';
  return d3.csv(filename, (function(d) {
    return {
      day: +d.day,
      hour: +d.hour,
      value: +d.value
    };
  }), function(error, data) {
    var colorScale, dayLabels, heatMap, legend, svg3, timeLabels;
    colorScale = d3.scale.quantile().domain([
      0, buckets - 1, d3.max(data, function(d) {
        return d.value;
      })
    ]).range(colors);
    svg3 = d3.select('#heatmap').append('svg').attr('id', 'heatmapsvg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    dayLabels = svg3.selectAll('.dayLabel').data(days).enter().append('text').text(function(d) {
      return d;
    }).attr('x', 0).attr('y', function(d, i) {
      return i * gridSize;
    }).style('text-anchor', 'end').attr('transform', 'translate(-6,' + gridSize / 1.5 + ')').attr('class', function(d, i) {
      if (i >= 0 && i <= 4) {
        return 'dayLabel mono axis axis-workweek';
      } else {
        return 'dayLabel mono axis';
      }
    });
    timeLabels = svg3.selectAll('.timeLabel').data(times).enter().append('text').text(function(d) {
      return d;
    }).attr('x', function(d, i) {
      return i * gridSize;
    }).attr('y', 0).style('text-anchor', 'middle').attr('transform', 'translate(' + gridSize / 2 + ', -6)').attr('class', function(d, i) {
      if (i >= 7 && i <= 16) {
        return 'timeLabel mono axis axis-worktime';
      } else {
        return 'timeLabel mono axis';
      }
    });
    heatMap = svg3.selectAll('.hour').data(data).enter().append('rect').attr('x', function(d) {
      return (d.hour - 1) * gridSize;
    }).attr('y', function(d) {
      return (d.day - 1) * gridSize;
    }).attr('rx', 4).attr('ry', 4).attr('class', 'hour bordered').attr('width', gridSize).attr('height', gridSize).style('fill', colors[0]);
    heatMap.transition().duration(1000).style('fill', function(d) {
      return colorScale(d.value);
    });
    heatMap.append('title').text(function(d) {
      return d.value;
    });
    legend = svg3.selectAll('.legend').data([0].concat(colorScale.quantiles()), function(d) {
      return d;
    }).enter().append('g').attr('class', 'legend');
    legend.append('rect').attr('x', function(d, i) {
      return legendElementWidth * i;
    }).attr('y', height).attr('width', legendElementWidth).attr('height', gridSize / 2).style('fill', function(d, i) {
      return colors[i];
    });
    legend.append('text').attr('class', 'mono').text(function(d) {
      return '≥ ' + Math.round(d);
    }).attr('x', function(d, i) {
      return legendElementWidth * i;
    }).attr('y', height + gridSize);
  });
};

drawBar = function(csvName) {
  var click, filename, formatPercent, height, idValue, margin, svg2, tip, type, width, x, xAxis, y, yAxis;
  margin = {
    top: 40,
    right: 30,
    bottom: 150,
    left: 75
  };
  width = screen.width / 2 - margin.left - margin.right;
  height = screen.height / 3 - margin.top - margin.bottom;
  formatPercent = d3.format('4d');
  x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
  y = d3.scale.linear().range([height, 0]);
  xAxis = d3.svg.axis().scale(x).orient('bottom');
  yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(formatPercent);
  tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
    return '<strong>Score:</strong> <span style=\'color:#B0E2FF\'>' + d.score + '</span>';
  });
  svg2 = d3.select('#barchart').append('svg').attr("id", "barchartsvg").attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  type = function(d) {
    d.score = +d.score;
    return d;
  };
  svg2.call(tip);
  filename = 'topwords4_csv/' + csvName + ".csv";
  d3.csv(filename, type, function(error, data) {
    x.domain(data.map(function(d) {
      return d.word;
    }));
    y.domain([
      0, d3.max(data, function(d) {
        return d.score;
      })
    ]);
    svg2.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis).selectAll('text').style('text-anchor', 'end').attr('dx', '-.8em').attr('dy', '.15em').attr('transform', 'rotate(-90)');
    svg2.append('g').attr('class', 'y axis').call(yAxis).append('text').attr('transform', 'rotate(-90)').attr('y', -70).attr('x', -150).attr('dy', '.71em').style('text-anchor', 'end').text('Score');
    svg2.selectAll('.bar').data(data).enter().append('rect').attr('class', 'bar').attr('x', function(d) {
      return x(d.word);
    }).attr('width', x.rangeBand()).attr('y', function(d) {
      return y(d.score);
    }).attr('height', function(d) {
      return height - y(d.score);
    }).on('mouseover', tip.show).on('mouseout', tip.hide).on('click', click);
  });
  idValue = function(d) {
    return d.word;
  };
  return click = function(d) {
    return updateList(d);
  };
};
