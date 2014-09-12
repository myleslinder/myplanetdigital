$(function(){
  $(window).load(function() {
    tileImageCheck();
  });

  function tileImageCheck() {
    $.each($('a.tile-image'), function() {
      var $tileImage = $(this).find('img');
      var tileImageHeight = $(this).height();
      var tileImageImgHeight = $tileImage.height();

      if (tileImageImgHeight < tileImageHeight) {
        $tileImage.addClass('inverse');
      }
    });
  }
});

(function flexsliderStart() {

  'use strict';

  $('.flexslider').flexslider({
      animation: "slide",
      directionNav: false,
      animationLoop: true,
      slideshowSpeed: 8500,
      pauseOnHover: true
  });

})();