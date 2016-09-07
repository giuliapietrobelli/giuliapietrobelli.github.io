(function($, window, undefined) {
  'use strict';
  var $pages = [];
  var history = window.history;
  var location = window.location;
  var addEventListener = window.addEventListener;

  var changePageTo = function(path) {
    // Find the requested page
    var $visiblePage = $pages.filter(function() {
      return $(this).data('path') === path;
    });

    // Find the homepage
    var $homePage = $pages.filter(function() {
      return $(this).data('path') === '/';
    });

    $pages.hide();

    // The page requested exist
    if($visiblePage.length === 1) {
      $visiblePage.show();
      // history.pushState({path: path}, title, path);
      return;
    }

    // The page requested doesn't exist but the default homepage is set
    if($homePage.length === 1) {
      history.replaceState({path: '/'}, 'Homepage', '/');
      $homePage.show();
      return;
    }
  };


  $('document').ready(function(){
    $pages = $('body > section');

    addEventListener('popstate', function(event) {
      console.log(event.state);
      if(event.state) {
        changePageTo(event.state.path);
      }
    });


    var currentPath = location.pathname ? location.pathname : '/';
    history.replaceState({path: currentPath}, null, currentPath);
    changePageTo(currentPath);
  });

  $('.nav').on('click', function(e) {
    e.preventDefault();
    var pagePath = $(e.target).attr('href');
    var title = 'Homepage';

    if(!pagePath) return;

    if(pagePath !== '/') {
      title = pagePath.trim().slice(1, pagePath.length);
      title = title.charAt(0).toUpperCase() + title.slice(1);
    };

    changePageTo(pagePath);
    history.pushState({path: pagePath}, title, pagePath);
  });
}(jQuery, window, undefined));
