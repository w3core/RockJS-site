function module_docHeader ($R, $O) {
  this.html = String(/*[include src="index.html" format="STRING"]*/);
  this.css = String(/*[include src="style.css" format="STRING"]*/);
  this.node = 'expander; search:.search>input';

  var tools = $R.tools;

  this.onCreate = function () {
    tools.on('click', $O.node.expander, function(){
      $R.emit('menu.toggle');
      $R.vibrate();
    });

    var search = $O.node.search;
    tools.on('focus', search, onFocusSearch);
    tools.on('input blur', search, function(e){
      if (e.type == 'blur') {
        onBlurSearch();
        setTimeout(function(){
          search.value = '';
          emitSearch(search);
        }, 100);
      }
      else emitSearch(search);
    });
    tools.on('keydown', document, function(e){
      if (e.keyCode == 27 || e.keyCode == 13) blurSearch();
    })
  };

  function emitSearch (field) {
    $R.emit('search.doc', {query:field.value, node: field});
  }

  function blurSearch () {
    $O.node.search.blur();
  }

  function onFocusSearch () {
    setTimeout(function(){
      tools.on('resize', window, blurSearch);
    }, 1000);
  }

  function onBlurSearch () {
    tools.off('resize', window, blurSearch);
  }
}