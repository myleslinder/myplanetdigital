$(function(){
  $('#menu').on('mouseover', 'li', function(){
    $(this).addClass('hover');
  });

  $('#menu').on('mouseout', 'li', function(){
    $(this).removeClass('hover');
  });
});
