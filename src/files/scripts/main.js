(function main () {

	'use strict';

	if(!window.isSinglePageApp) {
		return;
	}

	var $window = $(window),
		$body = $('body'),
		$article = $('#article'),
		$viewport = $('#viewport'),
		$articlein = $('#article-inner'),
		$main = $('#main'),
		$mainWrap = $('.main-wrap'),
		$loadgif = $('.loading-overlay'),
		$loadgiftiles = $('.loading-overlay-tiles'),
		$anchors = $('a'),
		$footer = $('.footer'),
		$ajaxer = null,
		popped = false,
		hasLoadedTiles,
		isLoading =  false,
		scrollTimeout,
		preScrollTimeout,
		articleScrollTop = 0,
		tileScrollTop = 0,
		RELATIVE_URL_REGEX = /^(?:\/\/|[^\/]+)*\//,
		pageUrl = '/' + document.location.href.replace(RELATIVE_URL_REGEX, ''),
		lastArticleUrl = '',
		doAjax,
		isTransitioning = false,
		cancelTransition = false,
		linkClickedTime = new Date(),
		wasLinkClick,
		EXTERNAL_URL_REGEX = /^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/,
		ARTICLE_REGEX = /^((?!tags).)*\/(article|people|careers)\//,
		TAG_REGEX = /\/tags\/(.*)?/,
		MAPS_REGEX = /http:\/\/maps\.google\.com/,
		COVER_SRC_REGEX = /url\(['"]?(.*\.\w+)['"]?\)/,
		IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
		FULL_WIDTH = 1324,
		DESKTOP_WIDTH = 1174,
		END_SCROLL_THRESHOLD = 250,
		SPINNER_HEIGHT = 61,
		IOS_CHROME_HEIGHT = 70,
		PRE_SCROLL_THRESHOLD = 100;

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
		return finishStartScrolling();
		//window.setTimeout(function () {
			window.requestAnimationFrame(finishStartScrolling);
	//	}, 0);
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

	function finishArticleLoad(data) {
		window.setTimeout(function(){
			window.requestAnimationFrame(function () {
				$articlein.html(data);
				window.requestAnimationFrame(function() {
					isLoading = false;
					$loadgif.hide();
					$articlein.addClass('reveal');
					$article.css('height', '');
					window.setTimeout(function () {
						window.isBusy = false;
						window.curScrollTop = window.pageYOffset;
					}, 100);
				});
			});
		}, 0);
	}

	function removeTrailingSlash(url) {
		return url.replace(/(\/)+$/,'');
	}

	function loadViaAjax() {
		if (isTileView) {
			if ($mainWrap.find('.tile').length === 0) {
				isLoading = true;
				$ajaxer = $.get('/index-content-tiles/index.html', function(data){
					$ajaxer = null;
					window.setTimeout(function () {
						window.requestAnimationFrame(function () {
							$mainWrap.html(data);

							$window.trigger('tiles-init');
							window.requestAnimationFrame(function() {
								hasLoadedTiles = true;
								isLoading = false;
								$loadgiftiles.hide();
								$main.css('height', '');
								window.setTimeout(function () {
									window.isBusy = false;
									window.curScrollTop = window.pageYOffset;
								}, 100);
							});
						});
					}, 100);
				});
			}
			$loadgif.hide();
		}
		else {
			$articlein.removeClass('reveal');
			isLoading = true;

			$ajaxer = $.get(removeTrailingSlash(pageUrl) + '-content/index.html', function(data) {
				$ajaxer = null;
				window.setTimeout(function () {
					var image = new Image();
					image.onload = image.onerror = finishArticleLoad.bind(null, data);

					if($(data).eq(0).length) {
						image.src = $(data).eq(0).css('background-image').match(COVER_SRC_REGEX)[1];
					} else {
						finishArticleLoad(data);
					}
				}, 100);
			});
		}
		$body.removeClass('animating').css('height', '');
	}

	function handlePageChange(e, data) {
		if($ajaxer) {
			$ajaxer.abort();
			$body.removeClass('animating');
			isLoading = false;
			window.isBusy = false;
		}

		if(window.isIOS) {
			window.curScrollTop = window.pageYOffset;
		}
		cancelTransition = isTransitioning;

		var isArticleUrl = data.url.match(ARTICLE_REGEX),
			isTagUrl = !isArticleUrl && data.url.match(TAG_REGEX),
			top = window.curScrollTop,
			overridePopstateScrollmove,
			timeoutLen = 50;
		if(isTagUrl) {
			isTagUrl = isTagUrl[1];
		}

		wasLinkClick = new Date() - linkClickedTime < 300;
		overridePopstateScrollmove = !wasLinkClick && !window.isIOS; //ios doesn't mess with the scrollbar during popstate
		if(!wasLinkClick) {
			pageUrl = document.location.href.replace(RELATIVE_URL_REGEX, '');
			pageUrl = pageUrl || '/';
		}

		if(isArticleUrl && window.isTileView) {
			window.isTileView = false;
			window.isBusy = true;
			isTransitioning = true;
			tileScrollTop = top;
			doAjax = lastArticleUrl !== data.url;
			lastArticleUrl = data.url;
			if(wasLinkClick) {
				articleScrollTop = 0;
			}

			$window.trigger('article');
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
					if(doAjax) {
						$article.css('height', window.pageHeight + (window.isIOS ? IOS_CHROME_HEIGHT : 0));
						$loadgif.find('.loading-spinner').css('top', window.pageHeight / 2 - SPINNER_HEIGHT);
						$loadgif.show();
					}
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
			window.isBusy = true;
			isTransitioning = true;
			articleScrollTop = top;

			if(wasLinkClick) {
				tileScrollTop = 0;
			}

			$window.trigger('tiles');
			//todo: show the loading gif

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
					if (doAjax = !hasLoadedTiles) {
						$main.css('height', window.pageHeight + (window.isIOS ? IOS_CHROME_HEIGHT : 0));
						$loadgiftiles.find('.loading-spinner').css('top', window.pageHeight / 2 - SPINNER_HEIGHT);
						$loadgiftiles.show();
					}
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

		} else if(isTagUrl && window.isTileView) {
			if(window.currentTag !== isTagUrl) {
				window.tiles.arrange({filter: '.' + isTagUrl});
				$window.trigger('filter', [isTagUrl]);
				window.currentTag = isTagUrl;
			}
		}/*else if (isTagsUrl) {
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

	function cleanupTransition() {
		$body.removeClass('animating');
	}

	function finishTransition() {
		if(doAjax) {
			window.setTimeout(function () {
				isTransitioning = false;
				if(cancelTransition) {
					//return cleanupTransition();
				}
				window.requestAnimationFrame(loadViaAjax);
			}, 200);
		} else {
			window.setTimeout(function () {
				window.requestAnimationFrame(cleanupTransition);
				window.isBusy = false;
				window.curScrollTop = window.pageYOffset;
				isTransitioning = false;
			}, 200);
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

	function handleTransitionEnd(e) {
		if(!isTransitioning || e.target !== $article[0]) {
			return;
		}

		var endTransition;

		if(!window.isTileView) {
			endTransition =  function () {
				if(cancelTransition) {
					//return cleanupTransition();
				}
				window.scroll(0, window.curScrollTop = articleScrollTop + (window.isIOS ? 0 : (window.pageYOffset - window.curScrollTop)));
				window.setTimeout(function () {
					//window.requestAnimationFrame(function () {
						if(cancelTransition) {
							//return cleanupTransition();
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
				}, 0);
			};
		} else {
			endTransition = function () {
				if(cancelTransition) {
					//return cleanupTransition();
				}
				window.scroll(0, window.curScrollTop = tileScrollTop + (window.isIOS ? 0 : (window.pageYOffset - window.curScrollTop)));
				window.setTimeout(function () {
					//window.requestAnimationFrame(function () {
						if(cancelTransition) {
						//	return cleanupTransition();
						}
						$main.css({
							transition: '',
							position: ''
						});
						$article.css({
							position: 'absolute',
							left: '100%',
							marginLeft: ''
						});
						finishTransition();
					//});
				}, 0);
			};
		}
		//window.setTimeout(function () {
			//window.requestAnimationFrame(function () {
				if(cancelTransition) {
					//return cleanupTransition();
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
					return window.setTimeout(endTransition, 0);
				}
				endTransition();
		//	});
		//}, window.isIOS ? 50 : 25);
	}

	//init capabiliites
	setResponsiveState();
	$window.smartresize(setResponsiveState);

	window.curScrollTop = window.pageYOffset;
	window.isTileView = hasLoadedTiles = !$body.hasClass('article');
	window.isScrolling = false;

	$window.trigger('deviceCapabilities', [{
		desktopCapable: window.desktopCapable = Math.max(screen.width, screen.height) >= DESKTOP_WIDTH,
		hasTouchEvents: window.hasTouchEvents = 'ontouchstart' in window,
		isIOS: window.isIOS = !!navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
		top: window.pageYOffset,
		bottom: window.pageYOffset + window.pageHeight
	}]);

	SPINNER_HEIGHT = window.isIOS ? 25 : SPINNER_HEIGHT;
	pageUrl = pageUrl || '/';

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
		var url = $(this).attr('href');
		if(url === '/' && pageUrl === '/') {
			$window.trigger('scroll-top');
			return false;
		} else if(!isExternalUrl(url)) {
			debugger;
			if(url === pageUrl) {
				$window.trigger('same-tag');
			}
			pageUrl = url;
			linkClickedTime = new Date();
			History.pushState(null, null, pageUrl);
			return false;
		}
	});

	$article.append($footer.clone());
	$window.on('page-change', handlePageChange);
	$article.on('transitionend webkitTransitionEnd', handleTransitionEnd);

	//global scroll handler
	$window.on('scroll', function() {
		if(window.isIOS) {
			return;
		}
		if(isTransitioning || isLoading) {
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

	window.setTimeout(function() {
		if(!window.isTileView) {
			articleScrollTop = window.curScrollTop;
			lastArticleUrl = document.location.href;
			$articlein.addClass('reveal');
		} else {
			tileScrollTop = window.curScrollTop;
		}
	}, 750);
	window.requestAnimationFrame(function () {
		$body.addClass('loaded');
	});
}());