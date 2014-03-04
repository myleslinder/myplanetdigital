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
		$anchors = $('a'),
		popped = false,
		isTileView = true,
		scrollTimeout,
		preScrollTimeout,
		articleScrollTop,
		tileScrollTop,
		lastArticleUrl = '',
		pageUrl,
		isTransitioning = false,
		linkClickedTime = new Date(),
		externalUrlRegex = /^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/,
		coverSrcRegex = /url\(['"]?(.*\.\w+)['"]?\)/,
		articleRegex = /\/article\//,
		peopleRegex = /\/people\//,
		tagsRegex = /\/tags\//,
		mapsRegex = /http:\/\/maps\.google\.com/,
		isFirefox = navigator.userAgent.match(/firefox/i),
		FULL_WIDTH = 1324,
		DESKTOP_WIDTH = 1174,
		END_SCROLL_THRESHOLD = 700,
		PRE_SCROLL_THRESHOLD = 50;

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
			$loadgif.hide();
		}
		else {
			$.get(pageUrl + '-content', function(data) {
				var coverSrc = $(data).eq(0).css('background-image').match(coverSrcRegex)[1];
				var isPeopleUrl = pageUrl.match(peopleRegex);
				var image = new Image();
				// once cover image is loaded then attach article to DOM
				//TODO: ajax employee pages
				image.onload = function() {
					$articlein.html(data);
					$loadgif.hide();
					if (isPeopleUrl) {
						if (window.desktopCapable) {
							window.setTimeout(function(){
								$articlein.find('.profile-banner').css({
									opacity: '1',
									transition: 'opacity 0.5s'
								});	
							}, 100);
							window.setTimeout(function(){
								$articlein.find('.profile-body').css({
									opacity: '1',
									transform: 'translate3d(0, 0, 0)',
									transition: 'all 0.8s'
								});
							}, 250);
						}
						else {
							window.setTimeout(function(){
								$articlein.find('.profile-banner').css({
									opacity: '1',
									transition: 'opacity 0.4s'
								});
								$articlein.find('.profile-body').css({
									opacity: '1',
									transition: 'opacity 0.4s'
								});
							}, 100);
						}
					}
					else {
						if (window.desktopCapable) {
							window.setTimeout(function(){
								$articlein.find('.article-banner').css({
									opacity: '1',
									transition: 'opacity 0.5s'
								});	
							}, 100);
							window.setTimeout(function(){
								$articlein.find('.article-title').css({
									opacity: '1',
									transform: 'translate3d(0, 0, 0)',
									transition: 'all 0.8s'
								});	
							}, 250);
							window.setTimeout(function(){
								$articlein.find('.article-body').css({
									opacity: '1',
									transform: 'translate3d(0, 0, 0)',
									transition: 'all 0.6s'
								});
							}, 400);
						}
						else {
							window.setTimeout(function(){
								$articlein.find('.article-title').css({
									opacity: '1',
									transition: 'opacity 0.45s'
								});
								$articlein.find('.article-body').css({
									opacity: '1',
									transition: 'opacity 0.3s'
								});
								$articlein.find('.article-banner').css({
									opacity: '1',
									transition: 'opacity 0.8s'
								});
							}, 100);
						}
					}
				};
				image.src = coverSrc;
			});
		}
		$body.removeClass('animating');
	}

	function handlePageChange(e, data) {
		if(window.isIOS) {
			window.curScrollTop = window.pageYOffset;
		}

		var isPageUrl = data.url.match(articleRegex) || data.url.match(peopleRegex),
			isTagsUrl = data.url.match(tagsRegex),
			top = window.curScrollTop,
			wasLinkClick = new Date() - linkClickedTime < 300,
			overrideHistoryAPIScrollbar = !wasLinkClick && !window.isIOS,
			timeoutLen = isFirefox ? 50 : 0;

		if(isPageUrl && isTileView) {
			isTileView = false;
			isTransitioning = true;
			tileScrollTop = top;

			if(wasLinkClick) {
				articleScrollTop = 0;
			}

			$window.trigger('article');
			//todo: show the loading gif

			$loadgif.find('.loading-spinner').css('top', $window.height()/2 - 61);
			$loadgif.show();

			$article.css({
				transform:  !overrideHistoryAPIScrollbar || wasLinkClick ? 'translate3d(-1px, ' + (top - articleScrollTop) + 'px, 0)' : '',
				transition: 'none',
				zIndex: 0
			});
			$main.css({
				transform: overrideHistoryAPIScrollbar ? 'translate3d(-1px, ' + -(top - articleScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$body.addClass('animating');

			if(overrideHistoryAPIScrollbar) {
				window.scroll(0, window.curScrollTop = articleScrollTop);
			}

			window.setTimeout(function () {
				window.requestAnimationFrame(function () {
					$article.css({
						transform:  !overrideHistoryAPIScrollbar || wasLinkClick ?'translate3d(-100%, ' + (top - articleScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$main.css({
						transform: overrideHistoryAPIScrollbar ? 'translate3d(-100%, ' + -(top - articleScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$body.addClass('article');
				});
			}, timeoutLen);
		} else if(!isPageUrl && !isTileView) {
			isTileView = true;
			isTransitioning = true;
			articleScrollTop = top;

			if(wasLinkClick) {
				tileScrollTop = 0;
			}

			$window.trigger('tiles');
			//todo: show the loading gif

			$main.css({
				transform: !overrideHistoryAPIScrollbar || wasLinkClick ? 'translate3d(-100%, ' + (top - tileScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$article.css({
				transform: overrideHistoryAPIScrollbar ? 'translate3d(-100%, ' + -(top - tileScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$body.addClass('animating');

			if(overrideHistoryAPIScrollbar) {
				window.scroll(0, window.curScrollTop = tileScrollTop);
			}

			window.setTimeout(function () {
				window.requestAnimationFrame(function () {
					$main.css({
						transform:  !overrideHistoryAPIScrollbar || wasLinkClick ? 'translate3d(-1px, ' + (top - tileScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$article.css({
						transform: overrideHistoryAPIScrollbar ? 'translate3d(-1px, ' + -(top - tileScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$body.removeClass('article');
				});
			}, timeoutLen);
		} else if (isTagsUrl) {
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
		} 
	}

	function finishTransition() {
		isTransitioning = false;
		loadViaAjax();
	}

	$article.on('transitionend webkitTransitionEnd', function (e) {
		if(!isTransitioning || e.target !== $article[0]) {
			return;
		}
		var handleTransition,
			timeoutLen = window.isIOS ? 125 : 50;

		if(!isTileView) {
			handleTransition =  function () {
				window.scroll(0, window.curScrollTop = articleScrollTop);
				window.setTimeout(function () {
					window.requestAnimationFrame(function () {
						$article.css({
							transition: '',
							position: 'static',
							marginLeft: '100%'
						});
						$main.css('position', 'absolute');
						finishTransition();
					});
				}, timeoutLen);
			};
		} else {
			handleTransition = function () {
				window.scroll(0, window.curScrollTop = tileScrollTop);
				window.setTimeout(function () {
					window.requestAnimationFrame(function () {
						$main.css({
							transition: '',
							position: ''
						});
						$article.css({
							position: '',
							marginLeft: ''
						});
						finishTransition();
					});
				}, timeoutLen);
			};
		}

		window.setTimeout(function () {
			window.requestAnimationFrame(function () {
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
		}, timeoutLen);
	});

	function isExternalUrl(url) {
		var match = url.match(externalUrlRegex);
		if (typeof match[1] === 'string' && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) {
			return true;
		}
		if (typeof match[2] === 'string' && match[2].length > 0 && match[2].replace(new RegExp(':('+{'http:':80,'https:':443}[location.protocol]+')?$'), '') !== location.host) {
			return true;
		}
		return false;
	}

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
	if(hasTouchEvents) {
		$anchors.each(function () {
			var $link = $(this),
				href = $link.attr('href'),
				longLat = $link.attr('data-long-lat') || '43.65163,-79.37104';
			$link.attr('href', window.isIOS ? href.replace(mapsRegex, 'http://maps.apple.com') : href.match(mapsRegex) ? 'geo:' + longLat : href);
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

	$window.on('page-change', handlePageChange);

	//global scroll handler
	$window.on('scroll', function() {
		if(isTransitioning || window.isIOS) {
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

	window.curScrollTop = articleScrollTop = tileScrollTop = window.pageYOffset;
	window.isScrolling = false;

}());