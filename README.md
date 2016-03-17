# Reddit_Vis

##*** AUTHORS ***  
JAMES TAM  
CHRISTOPHER CHAN  
  
##*** REFERENCED LIBRARIES / DATA *** 
  * d3.js  
  * jQuery  
  * https://github.com/umbrae/reddit-top-2.5-million/tree/master/data  

##*** SYSTEM DESCRIPTION / INSTRUCTIONS ***  
1) (On Windows machines), run 'python -m http.server' in Powershell to start a local server (in order to fetch data from CSVs to load to visualizations)  
2) Navigate to the lib folder through the browser. The default port should be 8000.  
ex: http://localhost:8000/Desktop/163_FINAL/lib 

##*** WHAT THIS VISUALIZATION SHOWS ***  
  * Search for a subreddit in the autocomplete search bar. How about "AskReddit" to get started? Make sure you select a subreddit by clicking the options or pressing enter after selecting a subreddit via up/down keys  
  *The Bubble Cloud shows words and their tf-idf score. Click and hold on a bubble and start dragging it around! Click on a bubble to view the context of that word  
  * The Bar Chart shows the top 25 words and their average score in the particular subreddit. Hover over a bar to see the average score. Click a bar to the context of that word.  
  * The Heat Map shows when a subreddit has little or lots of scoring. Study this to see when's a good time to post!  
The top table shows which post titles the selected word comes from, and the posts' scores. The bottom table is a history of what you have selected.
