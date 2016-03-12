###################################################################################################################
# Autocomplete

#Variable to hold autocomplete options
keys = undefined
#Load US States as options from CSV - but this can also be created dynamically
#Call back for when user selects an option

onSelect = (d) ->
  console.log d.subreddit_name

#Setup and render the autocomplete

start = ->
  mc = autocomplete(document.getElementById('autocomplete')).keys(keys).dataField('subreddit_name').placeHolder('Search Subreddits - Start typing here').width(960).height(500).onSelected(onSelect).render()
  return

d3.csv '!subnames.csv', (csv) ->
  keys = csv
  start()
  return

###################################################################################################################

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
#     '#ffffb2'
#     '#fed976'
#     '#feb24c'
#     '#fd8d3c'
#     '#f03b20'
#     '#bd0026'
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


  
