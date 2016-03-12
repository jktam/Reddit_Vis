var keys, onSelect, start;

keys = void 0;

onSelect = function(d) {
  return console.log(d.subreddit_name);
};

start = function() {
  var mc;
  mc = autocomplete(document.getElementById('autocomplete')).keys(keys).dataField('subreddit_name').placeHolder('Search Subreddits - Start typing here').width(960).height(500).onSelected(onSelect).render();
};

d3.csv('!subnames.csv', function(csv) {
  keys = csv;
  start();
});
