(new function ($R) {

  /*[include src="../lib/swipe.js"]*/
  $R.Swipe = this.Swipe;
  $R.menu = $R.value(/*[include src="/menu.json"]*/);

  $R.vibrate = function (v) {
    if (typeof navigator.vibrate == 'function') {
      navigator.vibrate(v || 40);
    }
  }

} ($R));