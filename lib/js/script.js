var Bubbles, root, texts;

root = typeof exports !== "undefined" && exports !== null ? exports : this;

Bubbles = function() {
  var chart, clear, click, collide, collisionPadding, connectEvents, data, force, gravity, hashchange, height, idValue, jitter, label, margin, maxRadius, minCollisionRadius, mouseout, mouseover, node, rScale, rValue, textValue, tick, transformData, update, updateActive, updateLabels, updateNodes, width;
  width = 1500;
  height = 510;
  data = [];
  node = null;
  label = null;
  margin = {
    top: 5,
    right: 0,
    bottom: 0,
    left: 0
  };
  maxRadius = 50;
  rScale = d3.scale.sqrt().range([10, maxRadius]);
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
      console.log(d);
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
      svg = d3.select(this).selectAll("svg").data([data]).classed("svg-bubblecloud-container", true);
      svgEnter = svg.enter().append("svg");
      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);
      node = svgEnter.append("g").attr("id", "bubble-nodes").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      node.append("rect").attr("id", "bubble-background").attr("width", width).attr("height", height).on("click", clear);
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
    return d3.event.preventDefault();
  };
  hashchange = function() {
    var id;
    id = decodeURIComponent(location.hash.substring(1)).trim();
    return updateActive(id);
  };
  updateActive = function(id) {
    node.classed("bubble-selected", function(d) {
      return id === idValue(d);
    });
    if (id.length > 0) {
      return d3.select("#status").html("<h3>The word <span class=\"active\">" + id + "</span> is now active</h3>");
    } else {
      return d3.select("#status").html("<h3>No word is active</h3>");
    }
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

texts = [
  {
    name: "r/4chan",
    file: "4chan.csv",
    key: "4chan"
  }, {
    name: "r/AbandonedPorn",
    file: "AbandonedPorn.csv",
    key: "AbandonedPorn"
  }, {
    name: "r/adventuretime",
    file: "adventuretime.csv",
    key: "adventuretime"
  }, {
    name: "r/AdviceAnimals",
    file: "AdviceAnimals.csv",
    key: "AdviceAnimals"
  }, {
    name: "r/AnimalsBeingJerks",
    file: "AnimalsBeingJerks.csv",
    key: "AnimalsBeingJerks"
  }, {
    name: "r/anime",
    file: "anime.csv",
    key: "anime"
  }, {
    name: "r/arresteddevelopment",
    file: "arresteddevelopment.csv",
    key: "arresteddevelopment"
  }, {
    name: "r/AskReddit",
    file: "AskReddit.csv",
    key: "AskReddit"
  }, {
    name: "r/aww",
    file: "aww.csv",
    key: "aww"
  }, {
    name: "r/awwnime",
    file: "awwnime.csv",
    key: "awwnime"
  }, {
    name: "r/batman",
    file: "batman.csv",
    key: "batman"
  }, {
    name: "r/battlefield3",
    file: "battlefield3.csv",
    key: "battlefield3"
  }, {
    name: "r/bestof",
    file: "bestof.csv",
    key: "bestof"
  }, {
    name: "r/breakingbad",
    file: "breakingbad.csv",
    key: "breakingbad"
  }, {
    name: "r/britishproblems",
    file: "britishproblems.csv",
    key: "britishproblems"
  }, {
    name: "r/carporn",
    file: "carporn.csv",
    key: "carporn"
  }, {
    name: "r/circlejerk",
    file: "circlejerk.csv",
    key: "circlejerk"
  }, {
    name: "r/comicbooks",
    file: "comicbooks.csv",
    key: "comicbooks"
  }, {
    name: "r/comics",
    file: "comics.csv",
    key: "comics"
  }, {
    name: "r/community",
    file: "community.csv",
    key: "community"
  }, {
    name: "r/cosplay",
    file: "cosplay.csv",
    key: "cosplay"
  }, {
    name: "r/CrazyIdeas",
    file: "CrazyIdeas.csv",
    key: "CrazyIdeas"
  }, {
    name: "r/creepy",
    file: "creepy.csv",
    key: "creepy"
  }, {
    name: "r/creepyPMs",
    file: "creepyPMs.csv",
    key: "creepyPMs"
  }, {
    name: "r/cringe",
    file: "cringe.csv",
    key: "cringe"
  }, {
    name: "r/cringepics",
    file: "cringepics.csv",
    key: "cringepics"
  }, {
    name: "r/DaftPunk",
    file: "DaftPunk.csv",
    key: "DaftPunk"
  }, {
    name: "r/darksouls",
    file: "darksouls.csv",
    key: "darksouls"
  }, {
    name: "r/doctorwho",
    file: "doctorwho.csv",
    key: "doctorwho"
  }, {
    name: "r/DoesAnybodyElse",
    file: "DoesAnybodyElse.csv",
    key: "DoesAnybodyElse"
  }, {
    name: "r/DotA2",
    file: "DotA2.csv",
    key: "DotA2"
  }, {
    name: "r/DunderMifflin",
    file: "DunderMifflin.csv",
    key: "DunderMifflin"
  }, {
    name: "r/EarthPorn",
    file: "EarthPorn.csv",
    key: "EarthPorn"
  }, {
    name: "r/facepalm",
    file: "facepalm.csv",
    key: "facepalm"
  }, {
    name: "r/Fallout",
    file: "Fallout.csv",
    key: "Fallout"
  }, {
    name: "r/FanTheories",
    file: "FanTheories.csv",
    key: "FanTheories"
  }, {
    name: "r/fatpeoplestories",
    file: "fatpeoplestories.csv",
    key: "fatpeoplestories"
  }, {
    name: "r/fffffffuuuuuuuuuuuu",
    file: "fffffffuuuuuuuuuuuu.csv",
    key: "fffffffuuuuuuuuuuuu"
  }, {
    name: "r/FiftyFifty",
    file: "FiftyFifty.csv",
    key: "FiftyFifty"
  }, {
    name: "r/firstworldanarchists",
    file: "firstworldanarchists.csv",
    key: "firstworldanarchists"
  }, {
    name: "r/FoodPorn",
    file: "FoodPorn.csv",
    key: "FoodPorn"
  }, {
    name: "r/funny",
    file: "funny.csv",
    key: "funny"
  }, {
    name: "r/futurama",
    file: "futurama.csv",
    key: "futurama"
  }, {
    name: "r/gamegrumps",
    file: "gamegrumps.csv",
    key: "gamegrumps"
  }, {
    name: "r/gameofthrones",
    file: "gameofthrones.csv",
    key: "gameofthrones"
  }, {
    name: "r/Games",
    file: "Games.csv",
    key: "Games"
  }, {
    name: "r/gaming",
    file: "gaming.csv",
    key: "gaming"
  }, {
    name: "r/geek",
    file: "geek.csv",
    key: "geek"
  }, {
    name: "r/gifs",
    file: "gifs.csv",
    key: "gifs"
  }, {
    name: "r/harrypotter",
    file: "harrypotter.csv",
    key: "harrypotter"
  }, {
    name: "r/HIMYM",
    file: "HIMYM.csv",
    key: "HIMYM"
  }, {
    name: "r/hiphopheads",
    file: "hiphopheads.csv",
    key: "hiphopheads"
  }, {
    name: "r/HistoryPorn",
    file: "HistoryPorn.csv",
    key: "HistoryPorn"
  }, {
    name: "r/IAmA",
    file: "IAmA.csv",
    key: "IAmA"
  }, {
    name: "r/Jokes",
    file: "Jokes.csv",
    key: "Jokes"
  }, {
    name: "r/JusticePorn",
    file: "JusticePorn.csv",
    key: "JusticePorn"
  }, {
    name: "r/KerbalSpaceProgram",
    file: "KerbalSpaceProgram.csv",
    key: "KerbalSpaceProgram"
  }, {
    name: "r/leagueoflegends",
    file: "leagueoflegends.csv",
    key: "leagueoflegends"
  }, {
    name: "r/magicTCG",
    file: "magicTCG.csv",
    key: "magicTCG"
  }, {
    name: "r/MapPorn",
    file: "MapPorn.csv",
    key: "MapPorn"
  }, {
    name: "r/masseffect",
    file: "masseffect.csv",
    key: "masseffect"
  }, {
    name: "r/mildlyinfuriating",
    file: "mildlyinfuriating.csv",
    key: "mildlyinfuriating"
  }, {
    name: "r/mildlyinteresting",
    file: "mildlyinteresting.csv",
    key: "mildlyinteresting"
  }, {
    name: "r/mindcrack",
    file: "mindcrack.csv",
    key: "mindcrack"
  }, {
    name: "r/Minecraft",
    file: "Minecraft.csv",
    key: "Minecraft"
  }, {
    name: "r/movies",
    file: "movies.csv",
    key: "movies"
  }, {
    name: "r/MURICA",
    file: "MURICA.csv",
    key: "MURICA"
  }, {
    name: "r/Music",
    file: "Music.csv",
    key: "Music"
  }, {
    name: "r/mylittlepony",
    file: "mylittlepony.csv",
    key: "mylittlepony"
  }, {
    name: "r/Naruto",
    file: "Naruto.csv",
    key: "Naruto"
  }, {
    name: "r/nosleep",
    file: "nosleep.csv",
    key: "nosleep"
  }, {
    name: "r/nostalgia",
    file: "nostalgia.csv",
    key: "nostalgia"
  }, {
    name: "r/nottheonion",
    file: "nottheonion.csv",
    key: "nottheonion"
  }, {
    name: "r/OldSchoolCool",
    file: "OldSchoolCool.csv",
    key: "OldSchoolCool"
  }, {
    name: "r/onetruegod",
    file: "onetruegod.csv",
    key: "onetruegod"
  }, {
    name: "r/Pareidolia",
    file: "Pareidolia.csv",
    key: "Pareidolia"
  }, {
    name: "r/PerfectTiming",
    file: "PerfectTiming.csv",
    key: "PerfectTiming"
  }, {
    name: "r/pettyrevenge",
    file: "pettyrevenge.csv",
    key: "pettyrevenge"
  }, {
    name: "r/photoshopbattles",
    file: "photoshopbattles.csv",
    key: "photoshopbattles"
  }, {
    name: "r/pics",
    file: "pics.csv",
    key: "pics"
  }, {
    name: "r/Planetside",
    file: "Planetside.csv",
    key: "Planetside"
  }, {
    name: "r/pokemon",
    file: "pokemon.csv",
    key: "pokemon"
  }, {
    name: "r/polandball",
    file: "polandball.csv",
    key: "polandball"
  }, {
    name: "r/QuotesPorn",
    file: "QuotesPorn.csv",
    key: "QuotesPorn"
  }, {
    name: "r/rage",
    file: "rage.csv",
    key: "rage"
  }, {
    name: "r/reactiongifs",
    file: "reactiongifs.csv",
    key: "reactiongifs"
  }, {
    name: "r/RoomPorn",
    file: "RoomPorn.csv",
    key: "RoomPorn"
  }, {
    name: "r/roosterteeth",
    file: "roosterteeth.csv",
    key: "roosterteeth"
  }, {
    name: "r/skyrim",
    file: "skyrim.csv",
    key: "skyrim"
  }, {
    name: "r/starcraft",
    file: "starcraft.csv",
    key: "starcraft"
  }, {
    name: "r/startrek",
    file: "startrek.csv",
    key: "startrek"
  }, {
    name: "r/StarWars",
    file: "StarWars.csv",
    key: "StarWars"
  }, {
    name: "r/TalesFromRetail",
    file: "TalesFromRetail.csv",
    key: "TalesFromRetail"
  }, {
    name: "r/tf2",
    file: "tf2.csv",
    key: "tf2"
  }, {
    name: "r/TheLastAirbender",
    file: "TheLastAirbender.csv",
    key: "TheLastAirbender"
  }, {
    name: "r/TheSimpsons",
    file: "TheSimpsons.csv",
    key: "TheSimpsons"
  }, {
    name: "r/thewalkingdead",
    file: "thewalkingdead.csv",
    key: "thewalkingdead"
  }, {
    name: "r/TrollXChromosomes",
    file: "TrollXChromosomes.csv",
    key: "TrollXChromosomes"
  }, {
    name: "r/TumblrInAction",
    file: "TumblrInAction.csv",
    key: "TumblrInAction"
  }, {
    name: "r/Unexpected",
    file: "Unexpected.csv",
    key: "Unexpected"
  }, {
    name: "r/videos",
    file: "videos.csv",
    key: "videos"
  }, {
    name: "r/wallpapers",
    file: "wallpapers.csv",
    key: "wallpapers"
  }, {
    name: "r/wheredidthesodago",
    file: "wheredidthesodago.csv",
    key: "wheredidthesodago"
  }, {
    name: "r/woahdude",
    file: "woahdude.csv",
    key: "woahdude"
  }, {
    name: "r/wow",
    file: "wow.csv",
    key: "wow"
  }, {
    name: "r/WTF",
    file: "WTF.csv",
    key: "WTF"
  }, {
    name: "r/youtubehaiku",
    file: "youtubehaiku.csv",
    key: "youtubehaiku"
  }, {
    name: "r/zelda",
    file: "zelda.csv",
    key: "zelda"
  }
];

$(function() {
  var aclist, display, key, plot, text;
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
  $('#autocomp').autocomplete({
    source: aclist,
    focus: function(event, ui) {
      $('#autocomp').val(ui.item.value);
      return false;
    },
    select: function(event, ui) {
      console.log(ui.item.value);
      return false;
    }
  });
  plot = Bubbles();
  display = function(data) {
    return plotData("#bubblecloudvis", data, plot);
  };
  key = decodeURIComponent(location.search).replace("?", "");
  text = texts.filter(function(t) {
    return t.key === key;
  })[0];
  console.log(text);
  if (!text) {
    text = texts[0];
  }
  d3.select("#book-title").html(text.name);
  return d3.csv("data/tfidf_csv_temp2/" + text.file, display);
});
