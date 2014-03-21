(function banner() {
  if (!window.isSinglePageApp) {
    return;
  }
  var $menu = $('#menu'),
      $banner = $('#banner'),
      $bannerText = $('#banner > .banner-text'),
      bannerInfo = {};

  $('#menu').find('a').each(function(){
    var me = $(this),
        tag = me.data('tag');
    bannerInfo[tag] = {
      'bannerText' : me.data('banner'),
      'bannerDoodle' : 'images/' + me.data('menu-doodle'),
    };
    // preload all the doodles
    (new Image()).src = bannerInfo[tag].bannerDoodle;
  });

  function bannerUpdate(tag) {
    var bannerText = bannerInfo[tag]['bannerText'],
        newDoodle = bannerInfo[tag]['bannerDoodle'];

    $bannerText.html(bannerText);
    $banner.attr('class', tag);
  }

  $(window).on('filter', function(e, tag){
    bannerUpdate(tag);
  });


}());