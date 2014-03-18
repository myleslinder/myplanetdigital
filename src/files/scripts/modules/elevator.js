(function elevator () {
	'use strict';

	if (!window.isSinglePageApp) {
		return;
	}
	var $window = $(window),
		$body = $('body'),
		$viewport = $('#viewport'),
		isElevating = false,
		curOffset;

	$window.on('scroll-top', function() {
		window.requestAnimationFrame(function() {
			var delta = window.pageYOffset;
			if(!delta) {
				return;
			}
			curOffset = 0;
			$viewport.css({
				transform: 'translateZ(0)'
			});

			window.requestAnimationFrame(function () {
				$body.addClass('animating');
				$viewport.css({
					transform: 'translate3d(0, ' + delta + 'px, 0)',
					transition: 'transform 0.8s'
				});
				isElevating = true;
			});
		});
	});

	function getNormalizedScrollBy(delta) {
		var maxDelta = document.body.scrollHeight - window.pageHeight - window.pageYOffset,
			minDelta = -window.pageYOffset;
		return Math.max(minDelta, Math.min(delta, maxDelta));
	}

	$window.on('scroll-to', function(e, newTop) {
		window.requestAnimationFrame(function () {

			var delta = getNormalizedScrollBy(newTop);
			if (!delta) {
				return;
			}
			curOffset =  window.pageYOffset + delta;
			$viewport.css({
				transform: 'translateZ(0)'
			});
			window.requestAnimationFrame(function () {
				$body.addClass('animating');
				$viewport.css({
					transform: 'translate3d(0, ' + -delta + 'px, 0)',
					transition: 'transform 0.8s'
				});
				isElevating = true;
			});
		});
	});


	function finishTransitionEnd () {
		$viewport.css({
			transform: '',
			transition: ''
		});
		$body.removeClass('animating');
	}

	$viewport.on('transitionend webkitTransitionEnd', function(e) {
		if (!isElevating || e.target !== $viewport[0]) {
			return;
		}

		isElevating = false;

		window.requestAnimationFrame(function() {
			$viewport.css({
				transform: 'translateZ(0)',
				transition: 'none'
			});
			if (!window.isIOS) {
				window.scroll(0, curOffset);
			}
			window.setTimeout(function() {
				if (!window.isIOS) {
					return finishTransitionEnd();
				}
				window.scroll(0, curOffset);
				window.setTimeout(finishTransitionEnd, 0);
			}, 0);
		});
	});

}());