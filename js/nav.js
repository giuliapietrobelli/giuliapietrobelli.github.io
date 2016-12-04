(function($, window, undefined) {
  'use strict';
  var $title;
  var history = window.history;
  var location = window.location;
  var addEventListener = window.addEventListener;

  var createMatrixNav = function(row, column) {
    var matrixProto = {
      init: function(row, column) {
        this.matrix = this.buildMatrix(row, column);
      },
      moveLeft: function() {
        this.matrix[0].unshift(this.matrix[0].pop());
      },
      moveRight: function() {
        this.matrix[0].push(this.matrix[0].shift());
      },
      moveUp: function() {
        var firstH = this.matrix[0].shift();
        var lastV = this.matrix.pop();

        this.matrix[0].unshift(lastV);
        this.matrix.splice(1, 0, firstH);
      },
      moveDown: function() {
        var firstH = this.matrix[0].shift();
        var firstV = this.matrix.splice(1, 1)[0];

        this.matrix[0].unshift(firstV);
        this.matrix.push(firstH);
      },
      moveTo: function(domElement) {
        var h = this.matrix[0].indexOf(domElement);
        var v = this.matrix.indexOf(domElement);

        if(h > 0) {
          while(h > 0) {
            this.moveRight();
            h--;
          }
        } else if(v > 0) {
          while(v > 0) {
            this.moveDown();
            v--;
          }
        }
      },
      buildMatrix: function(row, column) {
        var matrix = [];
        matrix[0] = row;

        column.forEach(function(el, index) {
          matrix[index + 1] = this.vertical[index];
        }.bind(this));

        return matrix;
      },
      getCurrentLayout: function() {
        var pos = {
          center: this.matrix[0][0],
          left: this.matrix[0][this.matrix[0].length - 1],
          right: this.matrix[0][1],
          bottom: this.matrix[1],
          top: this.matrix[this.matrix.length - 1]
        };
        return pos;
      }
    };

    var matrix = Object.create(matrixProto);
    matrix.horizontal = jQuery.makeArray(row);
    matrix.vertical = jQuery.makeArray(column);

    matrix.init(jQuery.makeArray(row), jQuery.makeArray(column));

    return {
      moveLeft: matrix.moveLeft.bind(matrix),
      moveRight: matrix.moveRight.bind(matrix),
      moveUp: matrix.moveUp.bind(matrix),
      moveDown: matrix.moveDown.bind(matrix),
      moveTo: matrix.moveTo.bind(matrix),
      getCurrentLayout: matrix.getCurrentLayout.bind(matrix)
    };
  };

  var createMenu = function($menu) {
    var menu = $.makeArray($menu).reduce(function(menu, el){
      var $el = $(el);
      var position = $el.data('menu-position');
      menu[position] = $el;

      return menu;
    }, new Object(null));

    return function() {
      var render = function(layout) {
        Object.keys(menu).forEach(function(pos) {
          menu[pos].text($(layout[pos]).data('name'));
          menu[pos].attr('href', $(layout[pos]).data('path'));
        });
      }

      var setActivePage = function(activePage) {
        Object.keys(menu).forEach(function(pos) {
          if(menu[pos].attr('href') === activePage.data('path')) {
            menu[pos].addClass('active');
          } else {
            menu[pos].removeClass('active');
          }
        });
      };

      return {
        render: render,
        setActivePage: setActivePage
      };
    }
  };

  var createRouter = function($pages) {
    // routes is a list of dom elements associates with an url path
    var routes = $.makeArray($pages).reduce(function(routing, page){
      var page = page;
      var path = $(page).data('path');

      routing[path] = page;

      return routing;
    }, new Object(null));

    var currentPage;

    return function(cb) {
      cb = cb ? cb : function(){};
      var history = window.history;

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

      var getRoutes = function() {
        return routes;
      };

      var getCurrentPage = function() {
        return currentPage
      };

      var goTo = function(path) {
        var prevPage = currentPage;

        // Find the requested page
        var requestedPage = routes[path];

        // Find the homepage
        var homePage = routes['/'];

        if(requestedPage) {
          // The page requested exist
          currentPage = requestedPage;
          changeTitle(path);
        } else if(homePage) {
          // The page requested doesn't exist but the default homepage is set
          currentPage = homePage;
          replaceState({path: '/'}, null, '/');
          changeTitle();
        }

        cb(prevPage, currentPage);
      };

      var init = function(path) {
        replaceState(path);
        goTo(path);
      };

      var pushState = function(path) {
        history.pushState({path: path}, null, path);
      };

      var replaceState = function(path) {
        history.replaceState({path: path}, null, path);
      };

      return {
        getRoutes: function() {
          return getRoutes();
        },
        goTo: function(path) {
          pushState(path);
          return goTo(path);
        },
        goBack: function(path) {
          return goTo(path);
        },
        getCurrentPage: function() {
          return getCurrentPage();
        },
        init: function(path) {
          init(path);
        }
      }
    }
  };

  $('document').ready(function(){
    var $pages = $('body > section');
    var $menu = $('[data-menu-position]');
    $title = $('head title');

    var animating = false;
    var direction;

    var menu = createMenu($menu)();

    var matrix = createMatrixNav(
      $('[data-m-pos=horizontal]'),
      $('[data-m-pos=vertical]')
    );

    var router = createRouter($pages)(function(prevPage, currentPage) {
      // callback called everytime the router changes page
      var $prevPage = $(prevPage);
      var $currentPage = $(currentPage);
      animating = true;
      $('body').addClass('animating');

      matrix.moveTo(currentPage);
      $pages.not($prevPage).hide();

      if(direction === 'left') {
        $prevPage.addClass('magictime slideRight');
        $currentPage.addClass('magictime slideLeftReturn').show();


        setTimeout(function(){
          $prevPage.hide().removeClass('magictime slideRight');
          $currentPage.removeClass('magictime slideLeftReturn');
          $('body').removeClass('animating');
          animating = false;
        }, 1000);
      } else if(direction === 'right') {
        $prevPage.addClass('magictime slideLeft');
        $currentPage.addClass('magictime slideRightReturn').show();

        setTimeout(function(){
          $prevPage.hide().removeClass('magictime slideLeft');
          $currentPage.removeClass('magictime slideRightReturn');
          $('body').removeClass('animating');
          animating = false;
        }, 1000);
      } else if(direction === 'top') {
        $prevPage.addClass('magictime slideDown');
        $currentPage.addClass('magictime slideUpReturn').show();

        setTimeout(function(){
          $prevPage.hide().removeClass('magictime slideDown');
          $currentPage.removeClass('magictime slideUpReturn');
          $('body').removeClass('animating');
          animating = false;
        }, 1000);
      } else if(direction === 'bottom') {
        $prevPage.addClass('magictime slideUp');
        $currentPage.addClass('magictime slideDownReturn').show();

        setTimeout(function(){
          $prevPage.hide().removeClass('magictime slideUp');
          $currentPage.removeClass('magictime slideDownReturn');
          $('body').removeClass('animating');
          animating = false;
        }, 1000);
      } else {
        $prevPage.hide();
        $currentPage.show();
        $('body').removeClass('animating');
        animating = false;
      }

      $('body')
        .removeClass(function(i, string) {
          var list = string.split(' ');
          return list = list.filter(function(className) {
            if(className !== 'animating') {
              return className;
            }
          }).join(' ');
        })
        .addClass($currentPage.data('name'));

      // menu.render(matrix.getCurrentLayout());
      menu.setActivePage($currentPage);
      direction = null;
    });

    // load the right page accordingly to the url requested
    router.init(window.location.pathname);

    // manage browser's back button
    addEventListener('popstate', function(event) {
      if(event.state && !animating) {
        router.goBack(event.state.path);
      }
    });

    $('.nav a:not(.email)').on('click', function(e) {
      e.preventDefault();
      var $target = $(e.target);
      var reqPath = $target.attr('href');
      direction = $target.data('menu-position');

      if(!reqPath) return;

      if($(router.getCurrentPage()).data('path') === reqPath) return;

      if(!animating) {
        router.goTo(reqPath);
      }
    });

  });
}(jQuery, window, undefined));
