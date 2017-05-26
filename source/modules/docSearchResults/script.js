function module_docSearchResults ($R, $O)
 {
  this.html = String(/*[include src="index.html" format="STRING"]*/);
  this.css = String(/*[include src="style.css" format="STRING"]*/);
  this.node = 'list';

  var providerSettings = {
    src: 'https://cdn.jsdelivr.net/algoliasearch/3/algoliasearchLite.min.js',
    applicationID: '8KLHVV2QT2',
    apiKey: '8afeaaa6f20b3bdf045a3a6947539201',
    index: 'RockJS.doc'
  };

  var provider = {
    client: null,
    index: null
  };

  var tpl, data, list;

  this.onCreate = function () {
    list = $O.node.list;
    tpl = list.innerHTML;
    list.innerHTML = '';
    $R.tools.on('click', list, function (e) {
      list.innerHTML = '';
    });
    initProvider();
    $R.on('search.doc', onSearch);
  }

  function initProvider () {
    var o = providerSettings;
    $R.include_once('js', o.src, function () {
      provider.client = algoliasearch(o.applicationID, o.apiKey);
      provider.index = provider.client.initIndex(o.index);
    }, true);
  }

  function processHighlighted (str) {
    var re = /((\w+[\s.,$-]+){0,4}<em>[^\3]+?(<\/em>)([\s\S.,$-]+\w+){0,8})/ig;
    if (typeof str == 'string' && str.indexOf('<em') > 80) {
      var m = str.match(re);
      if (m) {
        for (var i in m) {
          if (m[i][0] != '<') m[i] = '...' + m[i];
          if (m[i][m[i].length-1] != '>') m[i] += '...';
        }
        str = str.substr(0, 40) + m.join(' ');
      }
    }
    return str;
  }

  function onSearch (e) {
    var index = provider.index,
        query = e.data && e.data.query ? e.data.query : '';
    if (!query) return list.innerHTML = '';
    if (index) {
      index.search(query, function (error, response) {
        console.log(response);
        data = response;
        if (data.hits) {
          for (var i in data.hits) {
            if (data.hits[i] && data.hits[i]._highlightResult) {
              data.hits[i]._highlightResult.title.value = data.hits[i]._highlightResult.title.value;
              data.hits[i]._highlightResult.content.value = processHighlighted(data.hits[i]._highlightResult.content.value);
            }
          }
        }
        list.innerHTML = $R.template(tpl, data);
      });
    }
  }

}