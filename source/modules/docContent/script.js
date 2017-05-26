function module_docContent ($R, $O)
 {
  this.html = String(/*[include src="index.html" format="STRING"]*/);
  this.css = String(/*[include src="style.css" format="STRING"]*/);
  //this.node = 'wait; error; empty; data; list; item';
  var pages = {};

  this.onCreate = function () {
    $R.tools.addClass($O.DOM, 'markdown-preview');
    $R.tools.on('scroll', $O.DOM, function(e){
      $R.emit('content.scroll', null, e.target);
    });
  }

  this.onShow = function (options) {
    var sections = options._ ? String(options._).split('.') : ['1'];
    var section = sections[0];
    if (pages[section]) $O.DOM.innerHTML = pages[section];
    else {
      $R.xhr('doc/'+section+'.html', function(response, xhr) {
        if (xhr.status == 200) {
          pages[section] = response;
          $O.DOM.innerHTML = pages[section];
          setTimeout(function(){
            var node = document.getElementById('/doc/'+sections.join('.'));
            if (node) node.scrollIntoView();
          }, 0);
        }
      });
    }
  }
 }