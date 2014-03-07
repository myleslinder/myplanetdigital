(function main () {

	'use strict';

	if(!window.isSinglePageApp) {
		return;
	}

	var $window = $(window),
		$body = $('body'),
		$article = $('#article'),
		$articlein = $('#article-inner'),
		$main = $('#main'),
		$loadgif = $('.loading-overlay'),
		$loadgiftiles = $('.loading-overlay-tiles'),
		$anchors = $('a'),
		$footer = $('.footer'),
		popped = false,
		hasLoadedTiles,
		isLoading =  false,
		scrollTimeout,
		preScrollTimeout,
		articleScrollTop = 0,
		tileScrollTop,
		pageUrl,
		lastArticleUrl = '',
		doAjax,
		isTransitioning = false,
		cancelTransition = false,
		linkClickedTime = new Date(),
		wasLinkClick,
		EXTERNAL_URL_REGEX = /^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/,
		ARTICLE_REGEX = /\/(article|people|careers)\//,
		MAPS_REGEX = /http:\/\/maps\.google\.com/,
		COVER_SRC_REGEX = /url\(['"]?(.*\.\w+)['"]?\)/,
		FULL_WIDTH = 1324,
		DESKTOP_WIDTH = 1174,
		END_SCROLL_THRESHOLD = 400,
		PRE_SCROLL_THRESHOLD = 50;
		//MAX_PANEL_HEIGHT = 10000; //todo: not this, vulnerable to articles that may be taller than the tile page

	function setResponsiveState() {
		var width = $window.width(),
			old,
			state = width >= FULL_WIDTH ? 'full' : (width >= DESKTOP_WIDTH ? 'desktop' : 'mobile');

		window.pageHeight = $window.height();

		if(window.responsiveState === state) {
			return;
		}

		old = window.responsiveState;
		window.responsiveState = state;

		$window.trigger('responsiveStateChange', [{
			newState: state,
			oldState: old
		}]);
	}

	function finishStartScrolling() {
		window.isScrolling = true;
		$body.addClass('scrolling');
	}

	function startScrolling() {
		window.requestAnimationFrame(finishStartScrolling);
	}
	function finishEndScrolling() {
		window.isScrolling = false;
		$body.removeClass('scrolling');
	}

	function endScrolling() {
		window.requestAnimationFrame(finishEndScrolling);
		scrollTimeout = null;
		$window.trigger('after-scrolling');
	}

	function loadViaAjax() {
		if (isTileView) {
			if ($('.main-wrap').find('.tile').length === 0) {
				isLoading = true;
				$('.main-wrap').load('/index-content-tiles.html', function(){
					window.requestAnimationFrame(function () {
						window.initializeTiles();
						window.initializePage();
						hasLoadedTiles = true;
						isLoading = false;
						$loadgiftiles.hide();
					});
				});
			}
			$loadgif.hide();
		}
		else {
			isLoading = true;
			$.get(History.getState().hash + '-content', function(data) {
				var coverSrc = $(data).eq(0).css('background-image').match(COVER_SRC_REGEX)[1],
					image = new Image();

				// once cover image is loaded then attach article to DOM
				image.onload = function() {
					window.requestAnimationFrame(function () {
						$articlein.html(data);
						$loadgif.hide();
						$articlein.removeClass('reveal');
						window.setTimeout(function(){
							window.requestAnimationFrame(function () {
								isLoading = false;
								$articlein.addClass('reveal');
							});
						}, 100);
					});
				};
				image.src = coverSrc;
			});
		}
		$body.removeClass('animating').css('height', '');
	}

	function handlePageChange(e, data) {
		if(window.isIOS) {
			window.curScrollTop = window.pageYOffset; //ios scroll handler doesn't fire properly
		}
		cancelTransition = isTransitioning;

		var isArticleUrl = data.url.match(ARTICLE_REGEX),
			top = window.curScrollTop,
			overridePopstateScrollmove,
			timeoutLen = 50;

		wasLinkClick = new Date() - linkClickedTime < 300;
		overridePopstateScrollmove = !wasLinkClick && !window.isIOS; //ios doesn't mess with the scrollbar during popstate

		if(isArticleUrl && window.isTileView) {
			window.isTileView = false;
			isTransitioning = true;
			tileScrollTop = top;
			doAjax = lastArticleUrl !== data.url;
			lastArticleUrl = data.url;
			if(wasLinkClick) {
				articleScrollTop = 0;
			}

			$window.trigger('article');
			//todo: show the loading gif

			if(doAjax) {
				$loadgif.find('.loading-spinner').css('top', window.pageHeight/2 - 61);
				$loadgif.show();
			}

			$article.css({
				transform:  !overridePopstateScrollmove || wasLinkClick ? 'translate3d(-1px, ' + (top - articleScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$main.css({
				transform: overridePopstateScrollmove ? 'translate3d(-1px, ' + -(top - articleScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$body.addClass('animating').css('height', articleScrollTop + window.pageHeight);

			if(overridePopstateScrollmove) {
				window.scroll(0, window.curScrollTop = articleScrollTop);
			}

			window.setTimeout(function () {
				window.requestAnimationFrame(function () {
					$article.css({
						transform:  !overridePopstateScrollmove || wasLinkClick ?'translate3d(-100%, ' + (top - articleScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$main.css({
						transform: overridePopstateScrollmove ? 'translate3d(-100%, ' + -(top - articleScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$window.trigger('article-transition', [{
						top: articleScrollTop
					}]);
					$body.addClass('article');
				});
			}, timeoutLen);

		} else if(!isArticleUrl && !window.isTileView) {
			window.isTileView = true;
			isTransitioning = true;
			articleScrollTop = top;

			if(wasLinkClick) {
				tileScrollTop = 0;
			}

			$window.trigger('tiles');
			//todo: show the loading gif

			if (doAjax = !hasLoadedTiles) {
				$loadgiftiles.find('.loading-spinner').css('top', window.height()/2 - 61);
				$loadgiftiles.show();
			}

			$main.css({
				transform: !overridePopstateScrollmove || wasLinkClick ? 'translate3d(-100%, ' + (top - tileScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$article.css({
				transform: overridePopstateScrollmove ? 'translate3d(-100%, ' + -(top - tileScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$body.addClass('animating').css('height', tileScrollTop + window.pageHeight);

			if(overridePopstateScrollmove) {
				window.scroll(0, window.curScrollTop = tileScrollTop);
			}

			window.setTimeout(function () {
				window.requestAnimationFrame(function () {
					$main.css({
						transform:  !overridePopstateScrollmove || wasLinkClick ? 'translate3d(-1px, ' + (top - tileScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$article.css({
						transform: overridePopstateScrollmove ? 'translate3d(-1px, ' + -(top - tileScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$window.trigger('tiles-transition', [{
						top: tileScrollTop
					}]);
					$body.removeClass('article');
				});
			}, timeoutLen);

		} /*else if (isTagsUrl) {
			var tag = data.hash.split(/\//).pop();
			
			// window.tiles is defined in tiles-immediate.js
			[].forEach.call(window.tiles.items, function(item) {
				item.element.classList.remove('visible');
			});

			// window.tileTaggedGroups is defined in tiles-immediate.js
			if (typeof window.tileTaggedGroups[tag] !== 'undefined') {
				window.tileTaggedGroups[tag].forEach(function(tile) {
					tile.classList.add('visible');
				});
			}
			window.tiles.arrange({filter: '.visible'});
			$window.trigger('filter');
		} */
	}

	function finishTransition() {
		isTransitioning = false;
		if(doAjax) {
			window.requestAnimationFrame(loadViaAjax);
		} else {
			$body.removeClass('animating').css('height', '');
		}
	}

	function isExternalUrl(url) {
		var match = url.match(EXTERNAL_URL_REGEX);
		if (typeof match[1] === 'string' && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) {
			return true;
		}
		if (typeof match[2] === 'string' && match[2].length > 0 && match[2].replace(new RegExp(':('+{'http:':80,'https:':443}[location.protocol]+')?$'), '') !== location.host) {
			return true;
		}
		return false;
	}

	$article.on('transitionend webkitTransitionEnd', function (e) {
		if(!isTransitioning || e.target !== $article[0]) {
			return;
		}

		var handleTransition,
			timeoutLen = 0;//window.isIOS ? 0 : 0;

		if(!window.isTileView) {
			handleTransition =  function () {
				if(cancelTransition) {
					return;
				}
				window.scroll(0, window.curScrollTop = articleScrollTop + (window.pageYOffset - window.curScrollTop));
				window.setTimeout(function () {
					//window.requestAnimationFrame(function () {
						if(cancelTransition) {
							return;
						}

						$article.css({
							transition: '',
							position: 'static',
							marginLeft: '100%'
						});
						$main.css({
							position: 'absolute'
						});
						finishTransition();
				//	});
				}, timeoutLen);
			};
		} else {
			handleTransition = function () {
				if(cancelTransition) {
					return;
				}
				window.scroll(0, window.curScrollTop = tileScrollTop + (window.pageYOffset - window.curScrollTop));
				window.setTimeout(function () {
					//window.requestAnimationFrame(function () {
						if(cancelTransition) {
							return;
						}
						$main.css({
							transition: '',
							position: ''
						});
						$article.css({
							position: '',
							marginLeft: ''
						});
						finishTransition();
				//	});
				}, timeoutLen);
			};
		}

		//window.setTimeout(function () {
			window.requestAnimationFrame(function () {
				if(cancelTransition) {
					return;
				}
				$article.css({
					transform: '',
					transition: 'none'
				});
				$main.css({
					transform: '',
					transition: 'none'
				});
				if(window.isIOS) {
					return window.setTimeout(handleTransition, 0);
				}
				handleTransition();
			});
		//}, timeoutLen);
	});

	//init capabiliites
	setResponsiveState();
	$window.smartresize(setResponsiveState);

	$window.trigger('deviceCapabilities', [{
		desktopCapable: window.desktopCapable = Math.max(screen.width, screen.height) >= DESKTOP_WIDTH,
		hasTouchEvents: window.hasTouchEvents = 'ontouchstart' in window,
		isIOS: window.isIOS = !!navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
		top: window.pageYOffset,
		bottom: window.pageYOffset + window.pageHeight
	}]);

	if(window.desktopCapable) {
		$body.addClass('desktop-capable');
	}

	//handle geo urls
	if(window.hasTouchEvents) {
		$anchors.each(function () {
			var $link = $(this),
				href = $link.attr('href'),
				longLat = $link.attr('data-long-lat') || '43.65163,-79.37104';
			$link.attr('href', window.isIOS ? href.replace(MAPS_REGEX, 'http://maps.apple.com') : href.match(MAPS_REGEX) ? 'geo:' + longLat : href);
		});
	}
	//handle push/pop state
	$body.on('click', 'a', function() {
		if(!isExternalUrl(pageUrl = $(this).attr('href'))) {
			linkClickedTime = new Date();
			History.pushState(null, null, pageUrl);
			return false;
		}
	});

	$article.append($footer.clone());

	$window.on('page-change', handlePageChange);

	//global scroll handler
	$window.on('scroll', function() {
		if(isTransitioning || isLoading || window.isIOS) {
			return;
		}
		window.curScrollTop = window.pageYOffset;

		if(!window.isScrolling) {
			startScrolling();
		}

		$window.trigger('pageScroll', [{
			top: window.curScrollTop,
			bottom: window.curScrollTop + window.pageHeight,
			isFinalEvent: false
		}]);

		if(scrollTimeout) {
			window.clearTimeout(scrollTimeout);
			window.clearTimeout(preScrollTimeout);
		}
		scrollTimeout = window.setTimeout(endScrolling, END_SCROLL_THRESHOLD);
		preScrollTimeout = window.setTimeout(function() {
			$window.trigger('pageScroll', [{
				top: window.curScrollTop,
				bottom: window.curScrollTop + window.pageHeight,
				isFinalEvent: true
			}]);
		}, PRE_SCROLL_THRESHOLD);
	});

	window.curScrollTop = tileScrollTop = window.pageYOffset;
	window.isTileView = hasLoadedTiles = !$body.hasClass('article');
	window.isScrolling = false;
	if(!window.isTileView) {
		lastArticleUrl = document.location.href;
	}
}());