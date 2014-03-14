(function elevator () {
	'use strict';

	if (! window.isSinglePageApp) {
		return;
	}
	var $body = $('body'),
		$viewport = $('#viewport'),
		isElevating = false;

	$(window).on('scroll-top', function() {
		window.requestAnimationFrame(function() {
			$viewport.css({
				transform: 'translateZ(0)'
			});
			window.requestAnimationFrame(function () {
				var delta = window.pageYOffset;
				if (delta) {
					$body.addClass('animating');
					$viewport.css({
						transform: 'translate3d(0, ' + delta + 'px, 0)',
						transition: 'transform 0.8s'
					});
					isElevating = true;
				}
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

		window.setTimeout(function() {
			window.requestAnimationFrame(function() {
				$viewport.css({
					transform: 'translateZ(0)',
					transition: 'none'
				});
				if(! window.isIOS) {
					window.scroll(0, window.curScrollTop = 0);
				}
				window.setTimeout(function() {
					if(! window.isIOS) {
						return finishTransitionEnd();
					}
					window.scroll(0, window.curScrollTop = 0);
					window.setTimeout(window.requestAnimationFrame.bind(null, finishTransitionEnd), 0);
				}, 0);
			});
		}, 0);
	});

}());