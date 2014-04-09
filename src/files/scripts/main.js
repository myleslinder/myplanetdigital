(function main () {

    'use strict';

    if(!window.isSinglePageApp) {
        return;
    }

    var $window = $(window),
        $body = $('body'),
        $article = $('#article'),
        $back = $('#back'),
        $backlink = $('#back a'),
        $viewport = $('#viewport'),
        $articlein = $('#article-inner'),
        $wrap = $('#wrap'),
        $main = $('#main'),
        $mainWrap = $('.main-wrap'),
        $loadgif = $('.loading-overlay'),
        $loadgiftiles = $('.loading-overlay-tiles'),
        $anchors = $('a'),
        $footer = $('#main .footer'),
        $articleFooter = $('#article .footer'),
        $ajaxer = null,
        popped = false,
        fromTiles = false,
        hasLoadedTiles,
        filterTag,
        isLoading =  false,
        scrollTimeout,
        preScrollTimeout,
        articleScrollTop = 0,
        tileScrollTop = 0,
        RELATIVE_URL_REGEX = /^(?:\/\/|[^\/]+)*\//,
        pageUrl = '/' + document.location.href.replace(RELATIVE_URL_REGEX, ''),
        pageTitle,
        linkTag,
        lastArticleUrl = '',
        doArticleAjax,
        doTileAjax,
        isFirstArticleLoad = true,
        isTransitioning = false,
        isTransitionEnding = false,
        cancelTransition = false,
        pageLoaded = false,
        linkClickedTime = new Date(),
        wasLinkClick,
        aborted = false,
        chromePopStateTimeout,
        chromePopStateScrollTop = null,
        chromeUsedBackLink,
        EXTERNAL_URL_REGEX = /^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/,
        ARTICLE_REGEX = /^((?!tags).)*\/(article|people|careers)\//,
        TAG_REGEX = /\/tags\/(.*)?/,
        MAPS_REGEX = /http:\/\/maps\.google\.com/,
        COVER_SRC_REGEX = /url\(['"]?(.*\.\w+)['"]?\)/,
        IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        IS_CHROME = navigator.userAgent.toLowerCase().indexOf('chrome') > -1,
        IS_SAFARI = !IS_CHROME && navigator.userAgent.toLowerCase().indexOf('safari') > -1,
        FULL_WIDTH = 1324,
        DESKTOP_WIDTH = 1174,
        END_SCROLL_THRESHOLD = 250,
        SPINNER_HEIGHT = 61,
        IOS_CHROME_HEIGHT = 70,
        PRE_SCROLL_THRESHOLD = 100,
        FOUROHFOUR_HTML = '<div class="article-404"><div class="article-404-text"><h1>This page does not exist</h1><h2><em><a href="' + window.baseUrl  + '">Go home</a></em></h2></div></div>',
        FOOTER_SCROLLTO_OFFSET = 110;

    function setResponsiveState() {
        var width = $window.width(),
            old,
            state = width >= FULL_WIDTH ? 'full' : (width >= DESKTOP_WIDTH ? 'desktop' : 'mobile');

        window.pageHeight = $window.height();
        $body.css('min-height', window.pageHeight + 1);
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
           // window.requestAnimationFrame(finishStartScrolling);
    //  }, 0);
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
            if(!isFirstArticleLoad) {
                $articlein.removeClass('reveal');
            }
            window.requestAnimationFrame(function () {
                $articleFooter.show();
                isFirstArticleLoad = false;
                $articlein.html(data);
                window.requestAnimationFrame(function() {
                    isLoading = false;
                    $loadgif.hide();
                    $back.addClass('reveal');
                    $articlein.addClass('reveal');
                    $body.css('height', '');
                    $article.css('height', '');
                    window.setTimeout(function () {
                        if(isTransitioning || isTransitionEnding) {
                            return;
                        }
                        window.isBusy = false;
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
                $ajaxer = $.get(window.baseUrl + 'index-content-tiles/index.html', function(data){
                    $ajaxer = null;
                    window.setTimeout(function () {
                        window.requestAnimationFrame(function () {
                            $mainWrap.html(data);
                            $window.trigger('tiles-init');
                            window.requestAnimationFrame(function() {
                                hasLoadedTiles = true;
                                isLoading = false;
                                $loadgiftiles.hide();
                                window.tiles.arrange({filter: '.' + filterTag});
                                $window.trigger('filter', [filterTag]);
                                window.currentTag = filterTag;
                                if(isTransitioning || isTransitionEnding) {
                                    return;
                                }
                                $body.css('height', '');
                                $main.css('height', '');
                                window.setTimeout(function () {
                                    window.isBusy = false;
                                }, 100);
                            });
                        });
                    }, 100);
                });
            }
        }
        else {
            isLoading = true;
            $ajaxer = $.get(removeTrailingSlash(window.location.href) + '-content/index.html', function(data) {
                $ajaxer = null;
                window.setTimeout(function () {
                    debugger;
                    var image = new Image(),
                        $loadedData = $(data).eq(0),
                        bgImg;
                        if($loadedData.length && $loadedData[0].nodeType === 1 && (bgImg = $loadedData.css('background-image'))) {
                            image = new Image();
                            image.onload = image.onerror = finishArticleLoad.bind(null, data);
                            image.src = bgImg.match(COVER_SRC_REGEX)[1];
                        } else {
                            finishArticleLoad(data);
                        }
                }, 0);
                if (!fromTiles) {
                    var tag = $(data).closest('.article-body').attr('data-tag') || $(data).closest('.profile-body').attr('data-tag'),
                        href = tag === 'home'? window.baseUrl : '/tags/' + tag;
                    $backlink.attr('href', href);
                    $window.trigger('article-to-article', [tag]);
                }
            }).fail( function() {
                if(!aborted) {
                    finishArticleLoad(FOUROHFOUR_HTML);
               }
            });
        }
        $body.removeClass('animating');
    }

    function abortAjax() {
        $ajaxer.abort();
        $body.removeClass('animating');
        $body.css({
            height: ''
        });
        isLoading = false;
        window.isBusy = false;
        if(window.isTileView) {
            window.currentTag = '';
            $main.css('height', '');
        } else {
            lastArticleUrl = '';
            $article.css('height', '');
        }
    }

    function handlePageChange() {
       if(!(wasLinkClick = new Date() - linkClickedTime < 300)) {
           pageUrl = '/' + document.location.href.replace(RELATIVE_URL_REGEX, '');
       }

       var isArticleUrl = pageUrl.match(ARTICLE_REGEX),
           isTagUrl = !isArticleUrl && pageUrl.match(TAG_REGEX),
           overridePopstateScrollmove,
           timeoutLen = 0,
           noTransition = false,
           doFilter = false,
           wasCancelled,
           top;

       if(window.isIOS) {
           window.curScrollTop = window.pageYOffset;
       }

       if(aborted = $ajaxer) {
           abortAjax();
       }

       cancelTransition = isTransitionEnding;
       isTransitionEnding = false;

       overridePopstateScrollmove = !window.isIOS; //ios doesn't mess with the scrollbar during popstate
       top = window.curScrollTop;
       wasCancelled = cancelTransition || isTransitioning || aborted;

       filterTag = null;

       if (isTagUrl) {
           filterTag = isTagUrl[1];
           filterTag = removeTrailingSlash(filterTag);
       }
       if (pageUrl === window.baseUrl) {
           filterTag = 'home';
       }

       if(isArticleUrl && window.isTileView) { // Going to article view from tile view
           window.isTileView = false;
           window.isBusy = true;
           fromTiles = true;

           if(!wasCancelled) {
           //    tileScrollTop = top;
           }
           isTransitioning = true;

           doArticleAjax = lastArticleUrl !== pageUrl;
           lastArticleUrl = pageUrl;
           if(wasLinkClick || doArticleAjax) {
               articleScrollTop = 0;
           }

           $window.trigger('article');

           $article.css({
               transform:  !overridePopstateScrollmove ? 'translate3d(0, ' + (top - articleScrollTop) + 'px, 0)' : '',
               transition: 'none'
           });
           $main.css({
               transform: overridePopstateScrollmove ? 'translate3d(0, ' + -(top - articleScrollTop) + 'px, 0)' : (wasCancelled ? 'translate3d(0, ' + (top - tileScrollTop) + 'px, 0)' : ''),
               transition: 'none'
           });
           $body.addClass('animating');
           $body.css('height', articleScrollTop + window.pageHeight + 100);
           if(overridePopstateScrollmove) {
               window.scroll(0, window.curScrollTop = articleScrollTop);
           }

           window.setTimeout(function () {
             if(overridePopstateScrollmove && IS_CHROME && !chromeUsedBackLink) {
                 window.scroll(0, window.curScrollTop = articleScrollTop);
             }
             window.requestAnimationFrame(function () {
                   if(doArticleAjax) {
                       $articleFooter.hide();
                       $articlein.html('');
                       $article.css('height', window.pageHeight + (window.isIOS ? IOS_CHROME_HEIGHT : 1));
                       $loadgif.find('.loading-spinner').css('top', window.pageHeight / 2 - SPINNER_HEIGHT);
                       $loadgif.show();
                   } else if(window.responsiveState === 'mobile') {
                        $back.addClass('reveal');
                     }
                   $main.css({
                       transform: overridePopstateScrollmove ? 'translate3d(-100%, ' + -(top - articleScrollTop) + 'px, 0)' : (wasCancelled ? 'translate3d(-100%, ' + (top - tileScrollTop) + 'px, 0)' : ''),
                       transition: ''
                   });
                   $article.css({
                       transform:  !overridePopstateScrollmove ?'translate3d(-100%, ' + (top - articleScrollTop) + 'px, 0)' : '',
                       transition: ''
                   });

                   $window.trigger('article-transition', [{
                       top: articleScrollTop
                   }]);
                   $body.addClass('article');
               });
           }, timeoutLen);

       }  else if(isArticleUrl && !window.isTileView) { // article view to article view transition
           window.isBusy = true;
           doArticleAjax = true;
           fromTiles = false;
           articleScrollTop = 0;
           lastArticleUrl = pageUrl;
          // window.setTimeout(function () {
            //   window.requestAnimationFrame(function () {
                   //if(doArticleAjax) {
                       $articlein.html('');
                       $article.css('height', window.pageHeight + (window.isIOS ? IOS_CHROME_HEIGHT : 1));
                       $back.removeClass('reveal');
                       $loadgif.find('.loading-spinner').css('top', window.pageHeight / 2 - SPINNER_HEIGHT);
                       $loadgif.show();
                       window.scroll(0, window.curScrollTop = articleScrollTop);
                       window.requestAnimationFrame(loadViaAjax);
                   //}
              // });
          // }, timeoutLen);

       } else if(!isArticleUrl && !window.isTileView) { // Article view back to tile view
           window.isTileView = true;
           window.isBusy = true;
           if(!wasCancelled) {
              // articleScrollTop = top;
           }
           isTransitioning = true;
           doTileAjax = !hasLoadedTiles;
           if(wasLinkClick || doTileAjax) {
               tileScrollTop = 0;
           }
           $window.trigger('tiles');
           $main.css({
               transform: !overridePopstateScrollmove ? 'translate3d(-100%, ' + (top - tileScrollTop) + 'px, 0)' : '',
               transition: 'none'
           });
           $article.css({
               transform: overridePopstateScrollmove ? 'translate3d(-100%, ' + -(top - tileScrollTop) + 'px, 0)' : (wasCancelled ? 'translate3d(-100%, ' + (top - articleScrollTop) + 'px, 0)' : ''),
               transition: 'none'
           });

           $body.addClass('animating');
           $body.css('height', tileScrollTop + window.pageHeight + 100);
            if(overridePopstateScrollmove) {
               window.scroll(0, window.curScrollTop = tileScrollTop);
           }
           window.setTimeout(function () {
              if(overridePopstateScrollmove && IS_CHROME && !chromeUsedBackLink) {
                 window.scroll(0, window.curScrollTop = tileScrollTop);
              }
               window.requestAnimationFrame(function () {
                   if (doTileAjax) {
                       $main.css('height', window.pageHeight + (window.isIOS ? IOS_CHROME_HEIGHT : 0));
                       $loadgiftiles.find('.loading-spinner').css('top', window.pageHeight / 2 - SPINNER_HEIGHT);
                       $loadgiftiles.show();
                   } else if(doFilter) {
                        window.tiles.arrange({filter: '.' + filterTag});
                        $window.trigger('filter', [filterTag, !noTransition]);
                   }
                   $back.removeClass('reveal');

                   $main.css({
                       transform:  !overridePopstateScrollmove ? 'translate3d(0, ' + (top - tileScrollTop) + 'px, 0)' : '',
                       transition: noTransition ? 'none' : ''
                   });
                   $article.css({
                       transform: overridePopstateScrollmove  ? 'translate3d(0, ' + -(top - tileScrollTop) + 'px, 0)' : (wasCancelled ? 'translate3d(0, ' + (top - articleScrollTop) + 'px, 0)' : ''),
                       transition:  noTransition ? 'none' : ''
                   });
                   $window.trigger('tiles-transition', [{
                       top: tileScrollTop
                   }]);
                   $body.removeClass('article');

                   if(noTransition){
                       window.setTimeout(window.requestAnimationFrame.bind(null, function() {
                           handleTransitionEnd();
                       }), 0);
                   }
               });
           }, timeoutLen);

           if(window.responsiveState === 'mobile' && window.mobileMenuIsOpen) {
               noTransition = true;
           } else if(!hasLoadedTiles) {
            noTransition = false;
           }

           if (filterTag && hasLoadedTiles && window.currentTag !== filterTag) { //article to tile view on different tag
               doFilter = true;
               window.currentTag = filterTag;
           } else if(hasLoadedTiles) {
               $window.trigger('same-filter');
           }
           if(wasLinkClick && window.isWebkitMobileNotIOS) {
               window.justClosedMenu = true;
               window.scroll(0, 0);
               $wrap.css('top', 0);
           }
       } else if(filterTag && window.isTileView && window.currentTag !== filterTag) { //change tag on tile view
           //window.requestAnimationFrame(function () {
              $window.trigger('filter', [window.currentTag = filterTag]);
              window.tiles.arrange({filter: '.' + filterTag});
              tileScrollTop = 0;
              //if(wasLinkClick) {
                //window.scroll(0, 0);
              //} else {
                //window.requestAnimationFrame(function () {
                //  window.scroll(0, 0);
               // });
              //}
              if(window.isWebkitMobileNotIOS) {
                window.justClosedMenu = true;
                $wrap.css('top', 0);
              }
           //  }
         // });
       }
       chromePopStateScrollTop = null;
       chromePopStateTimeout = null;
       chromeUsedBackLink = false;
   }

    function cleanupTransition() {
        isTransitionEnding = false;
        if(cancelTransition && window.isTileView && doArticleAjax) {
            lastArticleUrl = '';
        } else if(cancelTransition && !window.isTileView && doTileAjax) {
            window.currentTag = null;
        }
        if(!cancelTransition) {
            $body.removeClass('animating').css('height', '');
        }
        cancelTransition = false;
    }
    function finishTransition() {
        if((window.isTileView && doTileAjax) || (!window.isTileView && doArticleAjax)) {
            window.setTimeout(function () {
                isTransitionEnding = false;
                if(cancelTransition) {
                    return cleanupTransition();
                }
                window.requestAnimationFrame(loadViaAjax);
            }, 0);
        } else {
            //window.setTimeout(window.requestAnimationFrame.bind(null, function () {
                cleanupTransition();
                window.isBusy = false;
                if (!window.isTileView && !doArticleAjax) {
                    window.setTimeout(function() {
                        $back.addClass('reveal');
                    }, 0);
                }
          // }), 0);
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
        var startTransitionEnd,
            endTransition;
        if(!isTransitioning ||  (e && e.target !== $article[0])) {
            return;
        }

        isTransitionEnding = true;
        isTransitioning = false;

        if(!window.isTileView) {
            endTransition =  function () {
                if(cancelTransition) {
                    return cleanupTransition();
                }
                window.scroll(0, window.curScrollTop = articleScrollTop);
                window.setTimeout(window.requestAnimationFrame.bind(null, function () {
                        if(cancelTransition) {
                            return cleanupTransition();
                        }
                        $loadgiftiles.hide();
                        if(!doArticleAjax) {
                          $back.addClass('reveal');
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
                }), window.isIOS ? 50 : 0);
            };
        } else {
            endTransition = function () {
                if(cancelTransition) {
                    return cleanupTransition();
                }
               window.scroll(0, window.curScrollTop = tileScrollTop);

               window.setTimeout(window.requestAnimationFrame.bind(null, function () {
                      if(cancelTransition) {
                          return cleanupTransition();
                      }
                      //$loadgif.hide();
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
                }), window.isIOS ? 50 : 0);
            };
        }

        startTransitionEnd = function() {
            if(cancelTransition) {
                return cleanupTransition();
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
        };
        if(window.isIOS){
            return window.setTimeout(window.requestAnimationFrame.bind(null, startTransitionEnd), 50);
        }
        startTransitionEnd();
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
    window.isWebkitMobileNotIOS =  window.hasTouchEvents && !window.isIOS;


    SPINNER_HEIGHT = window.isIOS ? 25 : SPINNER_HEIGHT;
    pageUrl = pageUrl || window.baseUrl;

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
    $body.on('click', 'a', function(e) {
        var url = $(this).attr('href');

        if(!isExternalUrl(url)) {
            if(e.currentTarget.getAttribute('data-attr') === 'contact-link') {
                $window.trigger('scroll-to', [window.isTileView ? $footer.offset().top - FOOTER_SCROLLTO_OFFSET : $articleFooter.offset().top - FOOTER_SCROLLTO_OFFSET]);
            } else if (e.currentTarget.getAttribute('data-attr') === 'back' && (hasLoadedTiles || doArticleAjax)) {
                if(IS_CHROME) {
                  $body.css('height', Math.max(articleScrollTop + tileScrollTop) + window.pageHeight);
                  chromeUsedBackLink = true;
                }
                History.back();
            } else if(url === pageUrl) {
                $window.trigger('same-page');
            } else {
                pageUrl = url;
                pageTitle = 'Myplanet Digital';
                linkClickedTime = new Date();
                if (url.match(ARTICLE_REGEX)) {
                    pageTitle = $('a[href="' + url + '"].tile-title').find('h2').text() + ' | Myplanet Digital';
                }
                else if (url.match(TAG_REGEX)) {
                    // Add an active class to the menu earlier.
                    linkTag = $(this).attr('data-tag');

                    if(linkTag) {
                        $(this).addClass('active');
                        pageTitle = (linkTag !== 'home')? linkTag.charAt(0).toUpperCase() + linkTag.slice(1) + ' | Myplanet Digital' : 'Myplanet Digital';
                    }
                }

               // window.requestAnimationFrame(function () {
                  //chromePopStateTimeout = IS_CHROME;
                  History.pushState({}, pageTitle, pageUrl);
                //});
            }
            return false;
        }
    });

    //$article.append($articleFooter = $footer.clone());
    window.currentTag = $('#menu').find('li.active').attr('class').split(' ')[0];
    $window.on('page-change', function () {
      debugger;
      if(!pageLoaded) {
        debugger;
        return;
      }
      if(IS_CHROME && chromeUsedBackLink) {
        $body.css('height', Math.max(articleScrollTop + tileScrollTop) + window.pageHeight);
      }
      if(!isTransitioning && !isTransitionEnding && $ajaxer === null) {
        if(window.isTileView) {
          tileScrollTop = window.isIOS ? window.pageYOffset : window.curScrollTop;
        } else {
          articleScrollTop = window.isIOS ? window.pageYOffset : window.curScrollTop;
        }
      }
      if(!IS_CHROME || !chromeUsedBackLink) {
          handlePageChange();
      } else {
        chromePopStateTimeout = window.setTimeout(handlePageChange, 0);
      }

    });
    //$window.on('page-change', handlePageChange);
    $article.on('transitionend webkitTransitionEnd', handleTransitionEnd);

    //global scroll handler
    $window.on('scroll', function() {
        if(window.isIOS) {
            return;
        }

        if(chromePopStateTimeout) {
          window.clearTimeout(chromePopStateTimeout);
          chromePopStateScrollTop = window.pageYOffset;

          return handlePageChange();
        }

        window.curScrollTop = window.pageYOffset;
        if(isTransitioning || isLoading || isTransitionEnding) {
            return;
        }

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
            //$articlein.addClass('reveal');
            $back.addClass('reveal');
            // set link to return to primary tag on landing on article
            $backlink.attr('href', window.currentTag === 'home'? window.baseUrl : '/tags/' + window.currentTag);
            articleScrollTop = window.curScrollTop;
            isFirstArticleLoad = false;
        } else {
            tileScrollTop = window.curScrollTop;
        }
        pageLoaded = true;
    }, 500);

   window.requestAnimationFrame(function () {
        if(!window.isTileView) {
            lastArticleUrl = pageUrl;
        }
        $body.addClass('loaded');
    });
}());
