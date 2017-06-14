/**
 * Application pages mapping
 *
 * Usage example:
 * --------------
 *  $R.page
 *    .define(name)
 *    .name (name)
 *    .route (route[, properties])
 *    .title(title)
 *    .options(options)
 *    .layout(id, name, options, callback)
 *    .module(location, position, id, name, options, callback)
 *  ;
 */

$R.page
  .define($R.config.generic.page.default.name)
  .title('RockJS - The trusty framework for old school guys!')
  .module('header-area', null, null, 'docHeader')
  .module('content-area', null, null, 'docSearchResults')
  .module('content-area', null, null, 'landingContent')
;

$R.page
  .define('doc')
  .route ('/doc(/*)')
  .title('RockJS documentation')
  .module('header-area', null, null, 'docHeader')
  .module('sidebar-area', null, null, 'docMenu')
  .module('content-area', null, null, 'docSearchResults')
  .module('content-area', null, null, 'docContent')
  .module('footer-area', null, null, 'docFooter')
;