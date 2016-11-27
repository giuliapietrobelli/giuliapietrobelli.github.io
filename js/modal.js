(function($, window, undefined) {
  'use strict';

  $("div.modal").on("shown.bs.modal", function()  { // any time a modal is shown
    var modal = this;
    var hash = modal.id;
    window.location.hash = hash;
    window.onhashchange = function() {
      if (!location.hash){
        $(modal).modal('hide');
      }
    }
  });

  $('div.modal').on('hidden.bs.modal', function() {
    var hash = this.id;
    history.pushState('', document.title, window.location.pathname);
  });
}(jQuery, window, undefined));
