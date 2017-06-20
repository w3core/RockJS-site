(new function ($R) {

  /*[include src="../lib/prefixfree.js"]*/;

  onBoot(function(){
    $R.on('componentCreate:ready', function(e){
      StyleFix.styleElement(e.target.options.stylesheet);
    });

    $R.on('pageShow:ready', function(e){
      if (typeof ga === 'function') {
        var url = location.href;
        setTimeout(function(){
          if (url === location.href) ga('send', 'pageview', location.href, {title: document.title});
        }, 100);
      }
    });
  });

  /*[include src="../lib/swipe.js"]*/
  $R.Swipe = this.Swipe;
  $R.menu = $R.value(/*[include src="/menu.json"]*/);

  $R.vibrate = function (v) {
    if (typeof navigator.vibrate == 'function') {
      navigator.vibrate(v || 40);
    }
  }

} ($R));