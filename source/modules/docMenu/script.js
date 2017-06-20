function module_docMenu ($R, $O)
 {
  var that = this,
      toc_json = $R.value(/*[include src="../../doc/toc.json"]*/),
      toc_tpl = $R.value(/*[include src="toc.html" format="STRING"]*/),
      active = [],
      sections = []
  ;

  this.html = String(/*[include src="index.html" format="STRING"]*/);
  this.css = String(/*[include src="style.css" format="STRING"]*/);
  this.node = 'toc';

  this.onShow = function (options) {
    active = [];
    var parts = options._ ? String(options._).split('.') : ['1'];
    while(parts.length) {
      active.push(parts.join('.'));
      parts.pop();
    }
    if (active.length) {
      var ids = active[0].split('.');
      var parent = toc_json;
      sections = [];
      while(ids.length) {
        var i = ids.shift()*1 - 1;
        if (!parent[i]) break;
        sections.push(parent[i]);
        parent = parent[i].children;
      }
    }
    var title = [];
    for (var i=sections.length-1; i>=0; i--) {
      title.push(sections[i].title);
    }
    title.push('RockJS Documentation');
    $R.page.get().title(title.join(' - '));
    $O.node.toc.innerHTML = compile(toc_json);
  };
 
  function compile (children) {
    return $R.template(toc_tpl, {children: children}, {
      compile: compile,
      active: function (entry) {
        return active.indexOf(''+entry.id) >= 0;
      }
    });
  }

 }