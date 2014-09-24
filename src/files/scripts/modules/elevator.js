(function elevator () {
	'use strict';

	if (!window.isSinglePageApp) {
		return;
	}
	var $window = $(window),
		$body = $('body'),
		$viewport,
		MOBILE_MENU_WIDTH = '-249px',
		curOffset;

	function getNormalizedScrollBy(delta) {
		if(window.isIOS) {
			return delta - window.pageYOffset;
		}
		var offset = window.pageYOffset,
			maxDelta = document.body.scrollHeight - window.pageHeight - offset,
			minDelta = -offset;
		return Math.max(minDelta, Math.min(delta, maxDelta));
	}

	$window.on('scroll-top', function() {
		$viewport = window.isTileView ? $('#main') : $('#article');
		if(window.isBusy) {
			return;
		}
		var delta = window.pageYOffset,
			isMobileMenuOpen = window.responsiveState === 'mobile' && window.mobileMenuIsOpen;
		if(!delta) {
			return $window.trigger('elevator-done');
		}
		curOffset = 0;

		window.setTimeout(window.requestAnimationFrame.bind(null, function () {
			$body.addClass('animating');
			$viewport.css({
				transform: 'translate3d(calc(' + (window.isTileView ? '0%' : '-100%') + ' + ' + (isMobileMenuOpen ? MOBILE_MENU_WIDTH : '0%') + '), ' + delta + 'px,0)',
				transition: 'transform 0.625s'
			});
			window.isElevating = true;
		}), 0);
	});

	$window.on('scroll-to', function(e, newTop) {
		$viewport = window.isTileView ? $('#main') : $('#article');
		if(window.isBusy) {
			return;
		}
		var delta = getNormalizedScrollBy(newTop),
			isMobileMenuOpen = window.responsiveState === 'mobile' && window.mobileMenuIsOpen;
		if (!delta) {
			return $window.trigger('elevator-done');
		}
		curOffset =  window.pageYOffset + delta;
		window.setTimeout(window.requestAnimationFrame.bind(null, function () {
			$body.addClass('animating');
			$viewport.css({
				transform: 'translate3d(calc(' + (window.isTileView ? '0%' : '-100%') + ' + ' + (isMobileMenuOpen ? MOBILE_MENU_WIDTH : '0%') + '), -' + delta + 'px, 0)',
				transition: 'transform 0.625s'
			});
			window.isElevating = true;
		}), 0);
	});

	function finishTransitionEnd () {
		$viewport.css({
			transform: '',
			transition: ''
		});
		//window.setTimeout(window.requestAnimationFrame.bind(null, function() {
			$body.removeClass('animating');
			$window.trigger('elevator-done');
			window.isElevating = false;
		//}), 0);
	}

	$body.on('transitionend webkitTransitionEnd', function(e) {
		if (!window.isElevating || e.target !== $viewport[0]) {
			return;
		}
		var isMobileMenuOpen = window.responsiveState === 'mobile' && window.mobileMenuIsOpen;

		window.setTimeout(window.requestAnimationFrame.bind(null, function() {
			$viewport.css({
				transform: 'translate3d(calc(' + (window.isTileView ? '0%' : '-100%') + ' + ' + (isMobileMenuOpen ? MOBILE_MENU_WIDTH : '0%') + '), 0, 0)',
				transition: 'none'
			});
			if (!window.isIOS || window.isIOS8) {
				window.scroll(0, window.curScrollTop = curOffset);
				return finishTransitionEnd();
			}
			window.setTimeout(function() {
				window.scroll(0, window.curScrollTop = curOffset);
				window.setTimeout(window.requestAnimationFrame.bind(null, finishTransitionEnd), 0);
			}, 0);
		}), 0);
	});

}());