###################################################################################################################

root = exports ? this
reset = false
Bubbles = () ->
  # standard variables accessible to
  # the rest of the functions inside Bubbles
  width = 980
  height = 510
  data = []
  node = null
  label = null
  margin = {top: 5, right: 0, bottom: 0, left: 0}
  # largest size for our bubbles
  maxRadius = 50

  # this scale will be used to size our bubbles
  rScale = d3.scale.sqrt().range([15,maxRadius])
  
  # I've abstracted the data value used to size each
  # into its own function. This should make it easy
  # to switch out the underlying dataset
  rValue = (d) -> parseFloat(d.tfidf)

  # function to define the 'id' of a data element
  #  - used to bind the data uniquely to the force nodes
  #   and for url creation
  #  - should make it easier to switch out dataset
  #   for your own
  idValue = (d) -> d.word

  # function to define what to display in each bubble
  #  again, abstracted to ease migration to 
  #  a different dataset if desired
  textValue = (d) -> d.word

  # constants to control how
  # collision look and act
  collisionPadding = 4
  minCollisionRadius = 12

  # variables that can be changed
  # to tweak how the force layout
  # acts
  # - jitter controls the 'jumpiness'
  #  of the collisions
  jitter = 0.5

  # ---
  # tweaks our dataset to get it into the
  # format we want
  # - for this dataset, we just need to
  #  ensure the count is a number
  # - for your own dataset, you might want
  #  to tweak a bit more
  # ---
  transformData = (rawData) ->
    rawData.forEach (d) ->
      d.tfidf = parseFloat(d.tfidf)
      rawData.sort(() -> 0.5 - Math.random())
    rawData

  # ---
  # tick callback function will be executed for every
  # iteration of the force simulation
  # - moves force nodes towards their destinations
  # - deals with collisions of force nodes
  # - updates visual bubbles to reflect new force node locations
  # ---
  tick = (e) ->
    dampenedAlpha = e.alpha * 0.1
    
    # Most of the work is done by the gravity and collide
    # functions.
    node
      .each(gravity(dampenedAlpha))
      .each(collide(jitter))
      .attr("transform", (d) -> "translate(#{d.x},#{d.y})")

    # As the labels are created in raw html and not svg, we need
    # to ensure we specify the 'px' for moving based on pixels
    label
      .style("left", (d) -> ((margin.left + d.x) - d.dx / 2) + "px")
      .style("top", (d) -> ((margin.top + d.y) - d.dy / 2) + "px")

  # The force variable is the force layout controlling the bubbles
  # here we disable gravity and charge as we implement custom versions
  # of gravity and collisions for this visualization
  force = d3.layout.force()
    .gravity(0)
    .charge(0)
    .size([width, height])
    .on("tick", tick)

  # ---
  # Creates new chart function. This is the 'constructor' of our
  #  visualization
  # Check out http://bost.ocks.org/mike/chart/ 
  #  for a explanation and rational behind this function design
  # ---
  chart = (selection) ->
    selection.each (rawData) ->

      # first, get the data in the right format
      data = transformData(rawData)
      # setup the radius scale's domain now that
      # we have some data
      maxDomainValue = d3.max(data, (d) -> rValue(d))
      rScale.domain([0, maxDomainValue])

      # a fancy way to setup svg element
      d3.select("svg").remove
      svg = d3.select(this).selectAll("svg").data([data])
      svgEnter = svg.enter().append("svg")
      svg.attr("width", width + margin.left + margin.right )
      svg.attr("height", height + margin.top + margin.bottom )
      
      # node will be used to group the bubbles
      node = svgEnter.append("g").attr("id", "bubble-nodes")
        .attr("transform", "translate(#{margin.left},#{margin.top})")

      # clickable background rect to clear the current selection
      node.append("rect")
        .attr("id", "bubble-background")
        .attr("width", width)
        .attr("height", height)
        .on("click", clear)

      # label is the container div for all the labels that sit on top of 
      # the bubbles
      # - remember that we are keeping the labels in plain html and 
      #  the bubbles in svg
      d3.select(this).selectAll('#bubble-labels').remove()
      label = d3.select(this).selectAll("#bubble-labels").data([data])
        .enter()
        .append("div")
        .attr("id", "bubble-labels")

      update()

      # see if url includes an id already 
      hashchange()

      # automatically call hashchange when the url has changed
      d3.select(window)
        .on("hashchange", hashchange)

  # ---
  # update starts up the force directed layout and then
  # updates the nodes and labels
  # ---
  update = () ->
    # add a radius to our data nodes that will serve to determine
    # when a collision has occurred. This uses the same scale as
    # the one used to size our bubbles, but it kicks up the minimum
    # size to make it so smaller bubbles have a slightly larger 
    # collision 'sphere'
    data.forEach (d,i) ->
      d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)))

    # start up the force layout
    force.nodes(data).start()

    # call our update methods to do the creation and layout work
    updateNodes()
    updateLabels()

  # ---
  # updateNodes creates a new bubble for each node in our dataset
  # ---
  updateNodes = () ->
    # here we are using the idValue function to uniquely bind our
    # data to the (currently) empty 'bubble-node selection'.
    # if you want to use your own data, you just need to modify what
    # idValue returns
    node = node.selectAll(".bubble-node").data(data, (d) -> idValue(d))

    # we don't actually remove any nodes from our data in this example 
    # but if we did, this line of code would remove them from the
    # visualization as well
    node.exit().remove()

    # nodes are just links with circles inside.
    # the styling comes from the css
    node.enter()
      .append("a")
      .attr("class", "bubble-node")
      .attr("xlink:href", (d) -> "##{encodeURIComponent(idValue(d))}")
      .call(force.drag)
      .call(connectEvents)
      .append("circle")
      .attr("r", (d) -> rScale(rValue(d)))

  # ---
  # updateLabels is more involved as we need to deal with getting the sizing
  # to work well with the font size
  # ---
  updateLabels = () ->
    # as in updateNodes, we use idValue to define what the unique id for each data 
    # point is
    label = label.selectAll(".bubble-label").data(data, (d) -> idValue(d))

    label.exit().remove()

    # labels are anchors with div's inside them
    # labelEnter holds our enter selection so it 
    # is easier to append multiple elements to this selection
    labelEnter = label.enter().append("a")
      .attr("class", "bubble-label")
      .attr("href", (d) -> "##{encodeURIComponent(idValue(d))}")
      .call(force.drag)
      .call(connectEvents)

    labelEnter.append("div")
      .attr("class", "bubble-label-name")
      .text((d) -> textValue(d))

    labelEnter.append("div")
      .attr("class", "bubble-label-value")
      .text((d) -> rValue(d))

    # label font size is determined based on the size of the bubble
    # this sizing allows for a bit of overhang outside of the bubble
    # - remember to add the 'px' at the end as we are dealing with 
    #  styling divs
    label
      .style("font-size", (d) -> Math.max(8, rScale(rValue(d) / 2)) + "px")
      .style("width", (d) -> 2.5 * rScale(rValue(d)) + "px")

    # interesting hack to get the 'true' text width
    # - create a span inside the label
    # - add the text to this span
    # - use the span to compute the nodes 'dx' value
    #  which is how much to adjust the label by when
    #  positioning it
    # - remove the extra span
    label.append("span")
      .text((d) -> textValue(d))
      .each((d) -> d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width))
      .remove()

    # reset the width of the label to the actual width
    label
      .style("width", (d) -> d.dx + "px")
  
    # compute and store each nodes 'dy' value - the 
    # amount to shift the label down
    # 'this' inside of D3's each refers to the actual DOM element
    # connected to the data node
    label.each((d) -> d.dy = this.getBoundingClientRect().height)

  # ---
  # custom gravity to skew the bubble placement
  # ---
  gravity = (alpha) ->
    # start with the center of the display
    cx = width / 2
    cy = height / 2
    # use alpha to affect how much to push
    # towards the horizontal or vertical
    ax = alpha / 8
    ay = alpha

    # return a function that will modify the
    # node's x and y values
    (d) ->
      d.x += (cx - d.x) * ax
      d.y += (cy - d.y) * ay

  # ---
  # custom collision function to prevent
  # nodes from touching
  # This version is brute force
  # we could use quadtree to speed up implementation
  # (which is what Mike's original version does)
  # ---
  collide = (jitter) ->
    # return a function that modifies
    # the x and y of a node
    (d) ->
      data.forEach (d2) ->
        # check that we aren't comparing a node
        # with itself
        if d != d2
          # use distance formula to find distance
          # between two nodes
          x = d.x - d2.x
          y = d.y - d2.y
          distance = Math.sqrt(x * x + y * y)
          # find current minimum space between two nodes
          # using the forceR that was set to match the 
          # visible radius of the nodes
          minDistance = d.forceR + d2.forceR + collisionPadding

          # if the current distance is less then the minimum
          # allowed then we need to push both nodes away from one another
          if distance < minDistance
            # scale the distance based on the jitter variable
            distance = (distance - minDistance) / distance * jitter
            # move our two nodes
            moveX = x * distance
            moveY = y * distance
            d.x -= moveX
            d.y -= moveY
            d2.x += moveX
            d2.y += moveY

  # ---
  # adds mouse events to element
  # ---
  connectEvents = (d) ->
    d.on("click", click)
    d.on("mouseover", mouseover)
    d.on("mouseout", mouseout)

  # ---
  # clears currently selected bubble
  # ---
  clear = () ->
    location.replace("#")

  # ---
  # changes clicked bubble by modifying url
  # ---
  click = (d) ->
    location.replace("#" + encodeURIComponent(idValue(d)))
    d3.event.preventDefault()
    console.log d

  # ---
  # called when url after the # changes
  # ---
  hashchange = () ->
    id = decodeURIComponent(location.hash.substring(1)).trim()
    updateActive(id)

  # ---
  # activates new node
  # ---
  updateActive = (id) ->
    node.classed("bubble-selected", (d) -> id == idValue(d))
    # if no node is selected, id will be empty
    if id.length > 0
      d3.select("#status").html("<h3>The word <span class=\"active\">#{id}</span> is now active</h3>")
    else
      d3.select("#status").html("<h3>No word is active</h3>")

  # ---
  # hover event
  # ---
  mouseover = (d) ->
    node.classed("bubble-hover", (p) -> p == d)

  # ---
  # remove hover class
  # ---
  mouseout = (d) ->
    node.classed("bubble-hover", false)

  # ---
  # public getter/setter for jitter variable
  # ---
  chart.jitter = (_) ->
    if !arguments.length
      return jitter
    jitter = _
    force.start()
    chart

  # ---
  # public getter/setter for height variable
  # ---
  chart.height = (_) ->
    if !arguments.length
      return height
    height = _
    chart

  # ---
  # public getter/setter for width variable
  # ---
  chart.width = (_) ->
    if !arguments.length
      return width
    width = _
    chart

  # ---
  # public getter/setter for radius function
  # ---
  chart.r = (_) ->
    if !arguments.length
      return rValue
    rValue = _
    chart
  
  # final act of our main function is to
  # return the chart function we have created
  return chart

# ---
# Helper function that simplifies the calling
# of our chart with it's data and div selector
# specified
# ---
root.plotData = (selector, data, plot) ->
  d3.select(selector)
    .datum(data)
    .call(plot)

###################################################################################################################
# var current_sub = "AskReddit";

$ ->
  aclist = [
    {value: '4chan'},
    {value: 'AbandonedPorn'},
    {value: 'adventuretime'},
    {value: 'AdviceAnimals'},
    {value: 'AnimalsBeingJerks'},
    {value: 'anime'},
    {value: 'arresteddevelopment'},
    {value: 'AskReddit'},
    {value: 'aww'},
    {value: 'awwnime'},
    {value: 'batman'},
    {value: 'battlefield3'},
    {value: 'bestof'},
    {value: 'breakingbad'},
    {value: 'britishproblems'},
    {value: 'carporn'},
    {value: 'circlejerk'},
    {value: 'comicbooks'},
    {value: 'comics'},
    {value: 'community'},
    {value: 'cosplay'},
    {value: 'CrazyIdeas'},
    {value: 'creepy'},
    {value: 'creepyPMs'},
    {value: 'cringe'},
    {value: 'cringepics'},
    {value: 'DaftPunk'},
    {value: 'darksouls'},
    {value: 'doctorwho'},
    {value: 'DoesAnybodyElse'},
    {value: 'DotA2'},
    {value: 'DunderMifflin'},
    {value: 'EarthPorn'},
    {value: 'facepalm'},
    {value: 'Fallout'},
    {value: 'FanTheories'},
    {value: 'fatpeoplestories'},
    {value: 'fffffffuuuuuuuuuuuu'},
    {value: 'FiftyFifty'},
    {value: 'firstworldanarchists'},
    {value: 'FoodPorn'},
    {value: 'funny'},
    {value: 'futurama'},
    {value: 'gamegrumps'},
    {value: 'gameofthrones'},
    {value: 'Games'},
    {value: 'gaming'},
    {value: 'geek'},
    {value: 'gifs'},
    {value: 'harrypotter'},
    {value: 'HIMYM'},
    {value: 'hiphopheads'},
    {value: 'HistoryPorn'},
    {value: 'IAmA'},
    {value: 'Jokes'},
    {value: 'JusticePorn'},
    {value: 'KerbalSpaceProgram'},
    {value: 'leagueoflegends'},
    {value: 'magicTCG'},
    {value: 'MapPorn'},
    {value: 'masseffect'},
    {value: 'mildlyinfuriating'},
    {value: 'mildlyinteresting'},
    {value: 'mindcrack'},
    {value: 'Minecraft'},
    {value: 'movies'},
    {value: 'MURICA'},
    {value: 'Music'},
    {value: 'mylittlepony'},
    {value: 'Naruto'},
    {value: 'nosleep'},
    {value: 'nostalgia'},
    {value: 'nottheonion'},
    {value: 'OldSchoolCool'},
    {value: 'onetruegod'},
    {value: 'Pareidolia'},
    {value: 'PerfectTiming'},
    {value: 'pettyrevenge'},
    {value: 'photoshopbattles'},
    {value: 'pics'},
    {value: 'Planetside'},
    {value: 'pokemon'},
    {value: 'polandball'},
    {value: 'QuotesPorn'},
    {value: 'rage'},
    {value: 'reactiongifs'},
    {value: 'RoomPorn'},
    {value: 'roosterteeth'},
    {value: 'skyrim'},
    {value: 'starcraft'},
    {value: 'startrek'},
    {value: 'StarWars'},
    {value: 'TalesFromRetail'},
    {value: 'tf2'},
    {value: 'TheLastAirbender'},
    {value: 'TheSimpsons'},
    {value: 'thewalkingdead'},
    {value: 'TrollXChromosomes'},
    {value: 'TumblrInAction'},
    {value: 'Unexpected'},
    {value: 'videos'},
    {value: 'wallpapers'},
    {value: 'wheredidthesodago'},
    {value: 'woahdude'},
    {value: 'wow'},
    {value: 'WTF'},
    {value: 'youtubehaiku'},
    {value: 'zelda'}
  ]
  $('#autocomp').autocomplete(
    source: aclist
    focus: (event, ui) ->
      $('#autocomp').val ui.item.value
      false
    select: (event, ui) ->
      d3.select("svg").remove()
      plot = Bubbles()
      d3.csv("tfidf_csv/"+ui.item.value+".csv", display)

      false

  plot = Bubbles()

  # ---
  # function that is called when
  # data is loaded
  # ---
  display = (data) ->
    plotData("#bubblecloudvis", data, plot)

  # we are storing the current text in the search component
  # just to make things easy

  # default to the first text if something gets messed up
  # if !text
  #   text = aclist[2].value

  # select the current text in the drop-down
  # $("#text-select").val(key)



  # bind change in drop down to change the
  # search url and reset the hash url
  # d3.select("#text-select")
  #   .on "change", (e) ->
  #     key = $(this).val()
  #     location.replace("#")
  #     location.search = encodeURIComponent(key)

  # set the book title from the text name
  # d3.select("#book-title").html(text.name)

  # load our data
  # d3.csv("tfidf_csv_temp/"+text+".csv", display)

  )

###################################################################################################################
# HEATMAP

# filterHeat = (color) ->
#   d3.selectAll('rect').each (d, i) ->
#     if d3.select(this).attr("fill") is color and d3.select(this).attr("class") is 'partofheatmap'
#       d3.select(this).attr('id', d3.select(this).attr("fill")) #sets id to its original color and then filters it out
#       # d3.select(this).attr('fill', '#ffffff')
#       d3.select(this).transition().duration(1000).attr('fill', '#ffffff')
#     else if d3.select(this).attr("id") == color and d3.select(this).attr("fill") == "#ffffff"
#       d3.select(this).transition().duration(1000).attr('fill', d3.select(this).attr('id'))

# do ->
#   #UI configuration
#   itemSize = 24
#   cellSize = itemSize - 1
#   width = 750
#   height = 630
#   margin = 
#     top: 20
#     right: 20
#     bottom: 20
#     left: 25
#   #formats
#   hourFormat = d3.time.format('%H')
#   dayFormat = d3.time.format('%j')
#   timeFormat = d3.time.format('%Y-%m-%dT%X')
#   monthDayFormat = d3.time.format('day %d')
#   #data vars for rendering
#   dateExtent = null
#   data = null
#   dayOffset = 0
#   colorCalibration = [
#  '#ffffb2'
#  '#fed976'
#  '#feb24c'
#  '#fd8d3c'
#  '#f03b20'
#  '#bd0026'
#   ]
#   dailyValueExtent = {}
#   #axises and scales
#   axisWidth = 0
#   axisHeight = itemSize * 24 #24 hours
#   xAxisScale = d3.time.scale()
#   xAxis = d3.svg.axis().orient('top').ticks(d3.time.days, 3).tickFormat(monthDayFormat)
#   yAxisScale = d3.scale.linear().range([
#     0
#     axisHeight
#   ]).domain([
#     0
#     24
#   ])
#   yAxis = d3.svg
#     .axis().orient('left')
#     .ticks(5)
#     .tickFormat(d3.format("02d"))
#     .scale(yAxisScale)

#   initCalibration = ->
#     d3.select('[role="calibration"] [role="example"]').select('svg')
#       .selectAll('rect')
#       .data(colorCalibration)
#       .enter()
#       .append('rect')
#       .attr('width', cellSize)
#       .attr('class', 'partoflegend')
#       .attr('height', cellSize)
#       .on('click', (d) ->
#         filterHeat(d)
#       ).attr('x', (d, i) ->
#         i * itemSize
#     ).attr 'fill', (d) ->
#       d
#     #bind click event
#     d3.selectAll('[role="calibration"] [name="displayType"]').on 'click', ->
#       renderColor()
#       return
#     return

#   renderColor = ->
#     renderByCount = document.getElementsByName('displayType')[0].checked
#     rect.filter((d) ->
#       d.value['count'] >= 0
#     ).transition().delay((d) ->
#       (dayFormat(d.date) - dayOffset) * 15
#     ).duration(500).attrTween 'fill', (d, i, a) ->
#       #choose color dynamicly      
#       colorIndex = d3.scale.quantize().range([
#         0
#         1
#         2
#         3
#         4
#         5
#       ]).domain(if renderByCount then [
#         0
#         1000
#       ] else dailyValueExtent[d.day])
#       d3.interpolate a, colorCalibration[colorIndex(d.value['count'])]   
#     return

#   initCalibration()
#   svg = d3.select('[role="heatmap"]')
#   heatmap = svg
#     .attr('width', width)
#     .attr('height', height).append('g')
#     .attr('width', width - (margin.left) - (margin.right)).attr('height', height - (margin.top) - (margin.bottom))
#     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
#   rect = null
#   d3.json 'data/final.json', (err, data) ->
#     data = data.data
#     data.forEach (valueObj) ->
#       valueObj['date'] = timeFormat.parse(valueObj['timestamp'])
#       day = valueObj['day'] = monthDayFormat(valueObj['date'])
#       dayData = dailyValueExtent[day] = dailyValueExtent[day] or [
#         1000
#         -1
#       ]
#       killcountValue = valueObj['value']['count']
#       dayData[0] = d3.min([
#         dayData[0]
#         killcountValue
#       ])
#       dayData[1] = d3.max([
#         dayData[1]
#         killcountValue
#       ])
#       return
#     dateExtent = d3.extent(data, (d) ->
#       d.date
#     ) #gets our date range
#     axisWidth = itemSize * (dayFormat(dateExtent[1]) - dayFormat(dateExtent[0]) + 1)
#     #render axises
#     xAxis.scale xAxisScale.range([
#       0
#       axisWidth
#     ]).domain([
#       dateExtent[0]
#       dateExtent[1]
#     ])
#     svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').attr('class', 'x axis').call(xAxis).append('text').text('date').attr 'transform', 'translate(' + axisWidth + ',-10)'
#     svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').attr('class', 'y axis').call(yAxis).append('text').text('time').attr 'transform', 'translate(-10,' + axisHeight + ') rotate(-90)'
#     #render heatmap rects
#     dayOffset = dayFormat(dateExtent[0])
#     rect = heatmap
#       .selectAll('rect')
#       .data(data)
#       .enter()
#       .append('rect')
#       .attr('width', cellSize)
#       .attr('height', cellSize)
#       .attr('x', (d) ->
#         itemSize * (dayFormat(d.date) - dayOffset)
#     ).attr('y', (d) ->
#       hourFormat(d.date) * itemSize
#     ).attr('class', 'partofheatmap')
#     .attr('fill', '#ffffff')
#     rect.filter((d) ->
#       d.value['count'] > 0
#     ).append('title').text (d) ->
#       monthDayFormat(d.date) + ', kills: ' + d.value['count'] #mouseover shows date and count  
#     renderColor()
#     return
#   return


  
