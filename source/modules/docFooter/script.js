function module_docFooter ($R, $O)
 {
  this.html = String(/*[include src="index.html" format="STRING"]*/);
  this.css = String(/*[include src="style.css" format="STRING"]*/);
  this.node = 'back';

  this.onCreate = function () {
    if ($O.node.back) {
      $R.tools.on('click', $O.node.back, function(e){
        $R.tools.each(document.querySelectorAll('main, content, .markdown-preview'), function(node){
          node.scrollTop = 0;
        });
        $R.vibrate();
        e.preventDefault();
      });
      $R.on('content.scroll', function(e){
        $R.tools[(e.target.scrollTop < 50 ? 'add' : 'remove') + 'Class']($O.node.back, 'invisible');
      });
    }
  }
 }