function module_docHeader ($R, $O)
 {
  this.html = String(/*[include src="index.html" format="STRING"]*/);
  this.css = String(/*[include src="style.css" format="STRING"]*/);
  this.node = 'expander; search:.search>input';

  this.onCreate = function () {
    $R.tools.on('click', $O.node.expander, function(){
      $R.emit('menu.toggle');
      $R.vibrate();
    });
    $R.tools.on('input', $O.node.search, function(e){
      $R.emit('search.doc', {query:e.target.value});
    });
  };
 }