(function($, window, undefined) {
  'use strict';
  var $pages = [];
  var $title;
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
      changeTitle(path);
      return;
    }

    // The page requested doesn't exist but the default homepage is set
    if($homePage.length === 1) {
      history.replaceState({path: '/'}, null, '/');
      $homePage.show();
      changeTitle();
      return;
    }
  };

  var findTitleFromPath = function(path) {
    if(path !== '/') {
      var title = path.trim().slice(1, path.length);
      title = title.charAt(0).toUpperCase() + title.slice(1);
      return title;
    } else {
      return '';
    }
  };

  var changeTitle = function(path) {
    var section = findTitleFromPath(path);
    var base = $title.text().split('-')[0].trim();

    if(section.length > 0) {
      $title.text(base + ' - ' + section);
    } else {
      $title.text(base)
    }
  };

  $('document').ready(function(){
    $pages = $('body > section');
    $title = $('head title');

    addEventListener('popstate', function(event) {
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

    if(!pagePath) return;

    history.pushState({path: pagePath}, null, pagePath);
    changePageTo(pagePath);
  });
}(jQuery, window, undefined));
