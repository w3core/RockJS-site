function module_landingContent ($R, $O)
 {
  this.html = String(/*[include src="index.html" format="STRING"]*/);
  this.css = String(/*[include src="style.css" format="STRING"]*/);
  //this.node = 'wait; error; empty; data; list; item';

  var menuActiveClass = 'active';

  this.onShow = function () {
    $R.on('menu.toggle', toggleMenuState);
    $R.tools.on('click', document, hideMenu);
  };

  this.onHide = function () {
    $R.off('menu.toggle', toggleMenuState);
    $R.tools.off('click', document, hideMenu);
  };

  function getMenuNode () {
    return document.querySelector('.module-docHeader .menu');
  }

  function toggleMenuState () {
    var node = getMenuNode();
    switchMenuState(!$R.tools.hasClass(node, menuActiveClass));
  }

  function switchMenuState (sign) {
    var node = getMenuNode();
    if (node) {
      $R.tools[sign ? 'addClass' : 'removeClass'](node, menuActiveClass);
    }
  }

  function hideMenu () {
    switchMenuState();
  }
 }