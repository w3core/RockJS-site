function module_landingContent ($R, $O) {
  this.html = String(/*[include src="index.html" format="STRING"]*/);
  this.css = String(/*[include src="style.css" format="STRING"]*/);
  //this.node = 'wait; error; empty; data; list; item';

  var menuActiveClass = 'active';
  var everywhere = document;

  this.onShow = function () {
    $R.on('menu.toggle', toggleMenuState);
    $R.tools.on('click', everywhere, hideMenu);
  };

  this.onHide = function () {
    $R.off('menu.toggle', toggleMenuState);
    $R.tools.off('click', everywhere, hideMenu);
  };

  function getMenuNode () {
    return document.querySelector('.module-docHeader .menu');
  }

  function toggleMenuState () {
    var node = getMenuNode();
    switchMenuState(!$R.tools.hasClass(node, menuActiveClass));
  }

  function switchMenuState (sign) {
    setTimeout(function(){
      var node = getMenuNode();
      if (node) {
        $R.tools[sign ? 'addClass' : 'removeClass'](node, menuActiveClass);
      }
    }, 0);
  }

  function hideMenu () {
    switchMenuState();
  }
}