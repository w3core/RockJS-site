function layout_default ($R, $O) {
  this.html = String(/*[include src="index.html" format="STRING"]*/);
  this.css = String(/*[include src="style.css" format="STRING"]*/);
  this.node = 'sidebar:sidebar';

  var tools = $R.tools;

  var $document = document,
      swipeMaxDocumentWidth = 800,
      swipeStartMaxDistance = 50,
      swipeStartDocumentWidth = 0,
      swipeStartSidebarWidth = 0,
      swipeStartSidebarTranslate = 0,
      swipeRecentTranslate = 0,
      swipeMove = false
  ;

  this.onCreate = function () {
    var sidebar = $O.node.sidebar;
    if (sidebar) {
      $R.Swipe($document);
      tools.on('swipestart swipemove swipeend', $document, onSwipeSidebar);
      $R.on('menu.toggle', function(){
        var matrix = getMatrix(sidebar);
        var hide = !(matrix.tx*1);
        $R.tools[hide ? 'addClass' : 'removeClass'](sidebar, 'hide');
        $R.tools[!hide ? 'addClass' : 'removeClass'](sidebar, 'show');
      });
    }
  };

  function onSwipeSidebar (e) {
    var node = $O.node.sidebar;
    if (e.type == 'swipestart') {
      swipeStartDocumentWidth = document.body.offsetWidth;
      swipeStartSidebarWidth = node.offsetWidth;
      swipeStartSidebarTranslate = swipeRecentTranslate = getMatrix(node).tx;
    }
    if (
      e.way != 'x'
      || swipeStartDocumentWidth > swipeMaxDocumentWidth
      || (swipeStartSidebarTranslate < 0 && e.startX > swipeStartMaxDistance)
    ) return;
    var minOpen = e.startX <= swipeStartMaxDistance;

    if (e.type == 'swipemove') {
      swipeRecentTranslate = e.diffWay + swipeStartSidebarTranslate;
      swipeRecentTranslate = swipeRecentTranslate < -swipeStartSidebarWidth ? -swipeStartSidebarWidth : swipeRecentTranslate > 0 ? 0 : swipeRecentTranslate;
      setMatrix(node, {tx:swipeRecentTranslate});
      node.style.opacity = Math.round(100 - Math.abs(swipeRecentTranslate*100/swipeStartSidebarWidth)) / 100;
      if (!swipeMove) {
        swipeMove = true;
        tools.removeClass(node, 'show hide');
      }
    }

    if (e.type == 'swipeend') {
      if ((e.direction == 'left' && e.diffWay < -swipeStartMaxDistance) || (e.direction == 'right' && e.diffWay < swipeStartMaxDistance)) tools.addClass(node, 'hide');
      else if ((e.direction == "left" && e.diffWay >= -swipeStartMaxDistance) || (e.direction == "right" && e.diffWay >= swipeStartMaxDistance)) tools.addClass(node, 'show');
      $R.vibrate();
      swipeMove = false;
    }
  }

  function getMatrix (node) {
    try {
      var s = window.getComputedStyle(node)[vendor('transform')];
      var v = /^matrix\(([^\)]+)\)$/.exec(s)[1].split(/[ ,]+/);
      return {a:v[0]*1, b:v[1]*1, c:v[2]*1, d:v[3]*1, tx:v[4]*1, ty:v[5]*1};
    }
    catch (e) {
      return {a:1, b:0, c:0, d:1, tx:0, ty:0};
    };
  }

  function setMatrix(node, matrix) {
    var v = [
       matrix.a||1
     , matrix.b||0
     , matrix.c||0
     , matrix.d||1
     ,matrix.tx||0
     ,matrix.ty||0
    ];
    node.style[vendor('transform')] = 'matrix('+v.join(', ')+')';
  }

  function getVendor () {
    var self = getVendor;
    if (!('result' in self)) {
      var regex = /^(Moz|ms|Webkit|Khtml|O|Icab)(?=[A-Z])/;
      var node = document.createElement('i');
      for(var prop in node.style) {
        if (regex.test(prop)) {
          self.result = prop.match(regex)[0];
          break;
        }
      }
      if (!('result' in self) && 'WebkitOpacity' in node.style) self.result = 'Webkit';
      if (!('result' in self) && 'KhtmlOpacity' in node.style) self.result = 'Khtml';
      if (!('result' in self)) self.result = '';
    }
    return self.result;
  }

  function vendor (property) {
    var vendor = getVendor();
    if (vendor === '') return property;
    property = property.charAt(0).toUpperCase() + property.substr(1);
    return vendor + property;
  }

 }