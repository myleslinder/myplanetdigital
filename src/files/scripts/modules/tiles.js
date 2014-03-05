(function tiles () {

	'use strict';

	if (! window.isSinglePageApp) {
		return;
	}
	var $window = $(window),
		$wrap = $('#main .main-wrap'),
		topOffset = parseInt($wrap.css('margin-top').replace(/px/, ''), 10),
		scrollData,
		firstEventTimeout = null,
		throttleTimeout = null,
		flushingTimeout = null,
		hasHiddenTiles = true,
		queue = [],
		layerQueue = [],
		finishFlush,
		$hiddenTiles;

	function initializeTiles() {
		window.tiles = new Isotope( '.main-wrap', {
		  itemSelector: '.tile',
		  filter: '.visible',
		  masonry: {
		    columnWidth: '.grid-size'
		  },
		  transitionDuration: 0
		});
		if('ontouchstart' in window) {
		    var els = document.querySelectorAll('.tile'),
		        len = els.length;
		    while(len--) {
		        els[len].style.opacity = 1;
		    }
		}

		// Create predefined groups of tiles, based on their tags
		// window.tileTaggedGroups = {'careers': [TileDomEl1, TileDomEl2 ... ],  ... }
		window.tileTaggedGroups = {};
		[].forEach.call(document.querySelectorAll('.tile'), function(tile) {
		    tile.getAttribute('data-tags').split(/\s+/).forEach(function(usedTag) {
		        window.tileTaggedGroups[usedTag] = window.tileTaggedGroups[usedTag] || [];
		        window.tileTaggedGroups[usedTag].push(tile);
		    });
		});
	}

	window.initializeTiles = initializeTiles;
	
	function initializePage() {
		$hiddenTiles = window.tiles.items.filter(function (tile) {
			if(tile.position.y + topOffset < scrollData.bottom ) {
				tile.element.style.opacity = '0.99';
				return false;
			} else {
				$(tile.element).addClass('hidden');
			}
			return true;
		}).sort(function (a, b) {
			if(b.position.y === a.position.y) {
				return b.position.x - a.position.x;
			}
			return a.position.y - b.position.y;
		});

		hasHiddenTiles = $hiddenTiles.length;
		firstEventTimeout = null;
	}

	window.initializePage = initializePage;

	function removeLayer(item) {
		item.classList.remove('reveal');
		item.classList.remove('show');
		item.classList.remove('hidden');
		item.classList.add('revealed');
		item.style.opacity = '1';
	}

	function removeLayers() {
		var len = layerQueue.length,
			item;
		while(len--){
			removeLayer(layerQueue[len]);
			layerQueue.splice(len, 1);
		}
	}

	function removeAllLayers() {
		var len = $hiddenTiles.length;
		while(len--){
			removeLayer($hiddenTiles[len].element);
		}
		$hiddenTiles = [];
		len = queue.length;
		while(len--){
			removeLayer(queue[len]);
		}
		queue = [];
		len = layerQueue.length;
		while(len--){
			removeLayer(queue[len]);
		}
		layerQueue = [];
	}

	function flushQueue() {
		var len = queue.length,
			item,
			count = 0;

		while(len--) {
			item = queue[len];
			item.tile.classList.add(queue[len].klass);
			queue.splice(len, 1);
			if(++count === 3 && queue.length) {
				return flushingTimeout = window.setTimeout(finishFlush, 50);
			}
		}
		if(queue.length) {
			return flushingTimeout = window.setTimeout(finishFlush, 50);
		}
		flushingTimeout = null;
	}

	finishFlush = window.requestAnimationFrame.bind(null, flushQueue);

	function onScroll() {
		if(!$hiddenTiles) {
			return;
		}
		var tile,
			len = $hiddenTiles.length,
			added = false;
		hasHiddenTiles = len;

		while(len--) {
			tile = $hiddenTiles[len];
			if(tile.position.y + topOffset < scrollData.bottom) {
				if (tile.position.y + tile.size.height > scrollData.top) {
					if(!firstEventTimeout) {
						queue.push({tile: tile.element, klass: 'reveal'});
						added = true;
					}
				} else {
					queue.push({tile: tile.element, klass: 'show'});
					added = true;
				}
				$hiddenTiles.splice(len, 1);
			}
		}

		if(added && !flushingTimeout) {
			window.requestAnimationFrame(flushQueue);
		}
		throttleTimeout = null;
	}

	function handleScroll(e, data) {
		if(data.isFinalEvent) {
			scrollData = data;
			return onScroll();
		}
		if(!hasHiddenTiles || throttleTimeout) {
			return;
		}
		if(firstEventTimeout) {
			return scrollData = data;
		}

		scrollData = data;
		throttleTimeout = setTimeout(onScroll, 120);
	}

	function transitionEnd (e) {
		if(!e.target.classList.contains('tile')) {
			return;
		}

		//initial fade in
		if (!e.target.classList.contains('show') && !e.target.classList.contains('reveal')) {
			return removeLayer(e.target);
		}

		//remove the layer after scrolling
		if(! window.isScrolling) {
			window.requestAnimationFrame(removeLayer.bind(null, e.target));
		} else {
			layerQueue.push(e.target);
		}
	}

	//only attach events if the device is capable of showing desktop
	$window.on('deviceCapabilities', function (e, data) {
		if(data.desktopCapable) {
			$window.on('pageScroll', handleScroll);
			$window.on('after-scrolling', window.requestAnimationFrame.bind(null, removeLayers));
			$wrap.on('transitionend webkitTransitionEnd', transitionEnd);
			$window.on('article menu', removeAllLayers);
			$window.on('filter', function() {initializePage(); removeAllLayers();});
			scrollData = data;
			firstEventTimeout = window.setTimeout(initializePage, 750);
		}
	});

}());
