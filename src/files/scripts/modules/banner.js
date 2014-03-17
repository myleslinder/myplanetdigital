(function banner() {
  if (!window.isSinglePageApp) {
    return;
  }

  var $window = $(window);
  var $menu = $('#menu');
  var $banner = $('.banner');
  var $bannerText = $('.banner > .banner-text');
  var $bannerBg = $('.banner-bg');
  var noop = function(){};

  function placeBannerBackground(newHeight) {    
    $bannerBg.css({
      'transform' : 'translate3d(0, ' + newHeight + 'px, 0)'
    });    
  }

  // Adjustable transitionend handler.
  // This will always be assigned as handler for 
  // transitionend but the actual functionality can be changed by 
  // assigning function to bannerTextTransitionHandler.cb
  function bannerTextTransitionHandler() {
    arguments.callee.cb()
    arguments.callee.cb = noop;
  }
  bannerTextTransitionHandler.cb = noop;
  $bannerText.on('transitionend webkitTransitionEnd', bannerTextTransitionHandler);

  function bannerTextFadeIn() {
    $bannerText.css({'opacity': 0.99});
  }

  function bannerTextFadeOut(cb) {
    bannerTextTransitionHandler.cb = cb;
    $bannerText.css({'opacity': 0.01});
  }

  function handleBannerTextUpdate() {
    var pathTo = window.location.pathname;
    var bannerText = $('#menu').find('a[href="'+pathTo+'"]').data('banner');
    
    bannerTextFadeOut(function() {      
      $bannerText.html(bannerText);
      bannerTextFadeIn();      
      placeBannerBackground($banner.outerHeight(), function() {

      });
    });
  }


  window.requestAnimationFrame(function(){placeBannerBackground($banner.outerHeight())});

  $window.on('filter', handleBannerTextUpdate);

} ());
