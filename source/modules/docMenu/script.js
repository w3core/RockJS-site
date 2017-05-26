function module_docMenu ($R, $O)
 {
  var that = this,
      toc_json = $R.value(/*[include src="../../doc/toc.json"]*/),
      toc_tpl = $R.value(/*[include src="toc.html" format="STRING"]*/),
      active = []
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