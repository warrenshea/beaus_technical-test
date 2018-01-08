/*jshint esversion: 6 */


/*
 * create 'beau' object for entire site
 * @scope public
 */
const beau = (function() {
    'use strict';

    return {
        core: {
            /*
             * Gets a cookie value from name
             *
             * @param string name - cookie name
             * @return string - cookie value
             */
            getCookie: function(name) {
                var start = document.cookie.indexOf(name + '=');
                if (start === -1) {
                    return null;
                } else {
                    start = start + name.length + 1;
                    var end = document.cookie.indexOf(';', start);
                    if (end === -1) {
                        end = document.cookie.length;
                    }
                    return unescape(document.cookie.substring(start, end));
                }
            },
            /*
             * Set a cookie name w/ value and expires
             *
             * @param string name - cookie name
             * @param string value - cookie value
             * @param string expires - cookie expiry
             */
            setCookie: function(name, value, expires) {
                var milliseconds = (expires === undefined ? 0 : parseInt(expires) * 1000 * 60 * 60 * 24);
                var greenwichMeanTime = new Date(new Date().getTime() + milliseconds).toGMTString();
                document.cookie = name + '=' + escape(value) + ((expires > 0) ? ';expires=' + greenwichMeanTime : '') + '; path=/';
            },
            /*
             * Unset a cookie value
             *
             * @param string name - cookie name
             */
            unsetCookie: function(name) {
                var value = this.getCookie(name);
                if (value !== null) {
                    document.cookie = name + '=;expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/';
                }
            },
            /*
             * Gets a query parameter value from the querystring
             *
             * @param string key - query parameter
             * @return string - value for querystring parameter
             */
            getQueryValue: function(key) {
                key = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + key + '=([^&#]*)'),
                    results = regex.exec(location.search);
                if (results !== null) {
                    return decodeURIComponent(results[1].replace(/\+/g, ' '));
                } else {
                    return null;
                }
            },
            /**
             * Extend the beau object
             *
             * @param string namespace
             * @param object namespaceModule
             */
            extend: function(namespace, namespaceModule) {
                if (beau[namespace] === undefined) {
                    beau[namespace] = namespaceModule();
                    if (beau[namespace] !== undefined) {
                        if (typeof beau[namespace].initialize === 'function') {
                            beau[namespace].initialize();
                        }
                        if (typeof beau[namespace].ready === 'function') {
                            $(function() {
                                beau[namespace].ready();
                            });
                        }
                        return beau[namespace];
                    }
                } else {
                    beau.core.throwException('Cannot extend "${namespace}" to beau. The name space "${namespace}" already exists');
                }
            }
        }
    };
})();


/*
 * This module is for some accessibility focus traps
 */
beau.core.extend('accessibility', function() {
    'use strict';

    const _$hamburgerIcon = $('#hamburger-icon');
    const _$hamburgerMenu = $('#hamburger-menu');

    return {
        /*
         * Checks if the hamburger icon and menu exists and adds the listener for the open icon
         */
        initialize: function() {
            const self = this;
            if (_$hamburgerIcon && _$hamburgerMenu) {
                self.addFocusTrapListeners();
            }
        },
        addFocusTrapListeners: function() {
            /*
             * If hamburger menu is open, focus trap occurs. Menu must be closed tabbing on close item.
             */
            $('.tabindex-last-menu').on('keydown', function (e) {
                if ($('this:focus') && (e.which === 9)) {
                  e.preventDefault();
                  $('.tabindex-first-menu').filter(':visible').focus();
                }
            });
        }
    };
});


/*
 * This module is for the hamburger icon and slide out navigation
 */
beau.core.extend('hamburgerMenu', function() {
    'use strict';

    const _$hamburgerIcon = $('#hamburger-icon');
    const _$hamburgerMenu = $('#hamburger-menu');
    let _offsetFromTop = 0;

    return {
        /*
         * Checks if the hamburger icon and menu exists and adds the listener for the open icon
         */
        initialize: function() {
            const self = this;
            if (_$hamburgerIcon && _$hamburgerMenu) {
                self.addListeners();
            }
        },
        /*
         * Opens the menu when the icon is clicked
         */
        addListeners: function() {
            const self = this;
            _$hamburgerIcon.on('click', function() {
                self.open();
            });
        },
        /*
         * Opens the menu. CSS animation mostly used.
         */
        open: function() {
            _offsetFromTop = $(window).scrollTop();
            _$hamburgerMenu.addClass('open');
            $('header.sticky,main,footer.default').addClass('hide');
            $('body').addClass('no-scroll');
        },
        /*
         * Closes the menu. CSS animation mostly used.
         */
        close: function() {
            $('#hamburger-icon').focus();
            _$hamburgerMenu.removeClass('open');
            $('body').removeClass('no-scroll');
            $(window).scrollTop(_offsetFromTop);
            $('header.sticky,main,footer.default').removeClass('hide');
        }
    };
});

/*
 * This module is for the Google Map icon in the footer
 */
beau.core.extend('googleMap', function() {
    'use strict';

    return {
        /*
         * Checks if Google Map container exists and initializes the map
         */
        initialize: function() {
            const self = this;
            const googleMapContainer = $.find('#gmap_canvas');
            if (googleMapContainer) {
                google.maps.event.addDomListener(window, 'load', self.initializeMap());
            }
        },
        /*
         * Sets location, marker, infobox/window for map
         */
        initializeMap: function() {
            const myOptions = {
                zoom: 11,
                center: new google.maps.LatLng(45.516908, -74.63731999999999),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            const map = new google.maps.Map($('#gmap_canvas')[0], myOptions);
            const marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(45.516908, -74.63731999999999)
            });
            const infowindow = new google.maps.InfoWindow({
                content: '<strong>10 TERRY FOX DR.<br>K0B1R0 VANKLEEK HILL</strong>'
            });
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker);
            });
            infowindow.open(map, marker);
        }
    };
});

/*
 * Allows the height of various divs to be the same by taking the biggest height and applying it to all items.
 * This will occur for any item regardless of viewport. To affect medium size and up, see Options.
 *
 * How to use this:
 * Add 'data-equalize-height="(key)"' to any item where key is a value you input yourself, to link the items.
 * All the items with the same 'key' will have the same height
 *
 * Options:
 * If you only want this to occur on medium size up, add 'data-equalize-medium-up' to the item as well
 */
beau.core.extend('equalizeHeights', function() {
    'use strict';

    let _dataEqualHeightArray = [];
    let _highest = 0;
    let _heights = [];

    /*
     * Sorts items in array from smallest to largest
     */
    let sortNumber = function(a, b) {
        return a - b;
    };

    /*
     * For each "key", determine the largest height and apply to all items with that key
     */
    let maxHeight = function() {
        $.each(_dataEqualHeightArray, function(index, value) {
            _highest = 0;
            _heights = [];
            $('[data-equalize-height=' + value + ']').css('height', 'auto');
            $('[data-equalize-height=' + value + ']').each(function() {
                /* get the height including the padding of an item */
                _heights.push($(this).outerHeight());
            });
            _heights = _heights.sort(sortNumber).reverse();
            _highest = _heights[0];
            $('[data-equalize-height=' + value + ']').css('height', _highest);
        });
    };

    return {
        initialize: function() {
            const self = this;
            self.getDataEqualHeightItems();
            self.resizeListener();
        },
        /*
         * Checks all the items that need to equalize height, and add keys to array
         */
        getDataEqualHeightItems: function() {
            $('[data-equalize-height]').each(function() {
                let newItem = $(this).data('equalize-height');
                if (_dataEqualHeightArray.indexOf(newItem) < 0) {
                    _dataEqualHeightArray.push(newItem);
                }
            });
        },
        /*
         * Re-evaluate the equalizing of the height when the page loads or is resized
         */
        resizeListener: function() {
            const self = this;
            $(window).on('load resize', function(event) {
                self.forceResize();
            });
        },
        /*
         * Check for any new items to equalize, and then equalize them
         * Do not equalize height for small size if the item contains [data-equalize-medium-up] data attribute
         */
        forceResize: function() {
            const self = this;
            self.getDataEqualHeightItems();
            maxHeight();
            if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 640) {
                $('[data-equalize-height][data-equalize-medium-up]').css('height', 'auto');
            }
        }
    };
});

/*
 * Module to interact with the LCBO API
 */
beau.core.extend('LCBOAPI', function() {
    'use strict';

    /*
     * Sets the default API Key. In this case, the API key is for v3.warrenshea.com/sandbox/beaus/
     * To override, add "apikey" queryparameter to querystring
     */
    let _APIKEY = beau.core.getQueryValue('apikey') || 'MDpmZDY3NjczYy1lZjY5LTExZTctYTIxYS1mMzlmNjE4MjIwNTI6ejZiRkxWeWNpdU0zUXNNWnBRMHdxT3lOS2JFQjR3OFFkNUlh';

    return {
        /*
         * Reset global public "Store" variables if a Postal code is set/unset/changed
         */
        resetStoreList: function() {
            storeListPageNumToDisplay = 1;
            storeListTotalPages = 0;
            storeListTemp = [];
            storeListConsolidated = [];
        },
        /*
         * Returns List of Beau's Beers from LCBO
         *
         * @param int pageNum - the page number of the API results to access
         * @param string conditionsQuery - add any special query conditions if any
         */
        retrieveBeersData: function(pageNum, conditionsQuery) {
            $.ajax({
                type: 'GET',
                url: '//lcboapi.com/products?q=Beau\'s' + conditionsQuery + '&page=' + pageNum,
                headers: {
                    Authorization: _APIKEY
                },
                contentType: 'application/javascript',
                dataType: 'jsonp',
                success: function(data, status, xhr) {
                    //console.log('LCBO API success:',status);

                    beerListTotalPages = data.pager.total_pages;

                    /* Add results to temporary array */
                    beerListTemp.push(...data.result);

                    /* If there are more pages to go through, recursively(!) rerun query with next page of results */
                    if (beerListPageNumToDisplay <= beerListTotalPages) {
                        beerListPageNumToDisplay += 1;
                        beau.LCBOAPI.retrieveBeersData(beerListPageNumToDisplay, conditionsQuery);
                    }
                    /* If there are no more pages to go through, create a consolidated array of data */
                    /* Merged arrays with ES6 Spread Operator
                       https://github.com/warrenshea/notes/blob/master/dev.es6-foreveryone!.online-course.md#module-0831-spreading-into-a-function */
                    else {
                        beerListConsolidated.push(...beerListTemp);
                    }
                },
                error: function(xhr, status, error) {
                    console.log('Error:', xhr.status);
                },
                complete: function() {
                    /* Once a consolidated array of data is created, we can use the data */
                    if (beerListConsolidated.length > 0) {

                        /* Go through the array and remove any beers that might be on the exclusion list */
                        /* Adapted this technique I learned from Wes Bos' ES6 for Everyone! course
                           https://github.com/warrenshea/notes/blob/master/dev.es6-foreveryone!.online-course.md#module-0830-more-spread-examples */
                        let tempBeerListConsolidated = beerListConsolidated;
                        for (const [i, beerExclusionItem] of beerExclusionList.entries()) {
                            const exclusionIndex = tempBeerListConsolidated.findIndex(beerData => beerData.id === beerExclusionItem);
                            if (exclusionIndex > -1) {
                                tempBeerListConsolidated = [...tempBeerListConsolidated.slice(0, exclusionIndex), ...tempBeerListConsolidated.slice(exclusionIndex + 1)];
                            }
                        }
                        beerListConsolidated = tempBeerListConsolidated;

                        /* Send the consolidated beer list to the rendering list function */
                        beau.renderBeersData.renderBeersList(beerListConsolidated);
                    }
                }
            });
        },
        /*
         * Returns Stores near point that have the beer (product id)
         *
         * @param int pageNum - the page number of the API results to access
         * @param string productId - the ID of the beer
         */
        retrieveStoresNearPointWithProductId: function(pageNum, productId) {
            const postalCode = beau.postalCodeManager.getPostalCode();
            const postalCodeCondition = (postalCode) ? '&geo=' + postalCode : '';
            $.ajax({
                type: 'GET',
                url: '//lcboapi.com/stores?product_id=' + productId + '&per_page=100' + '&page=' + pageNum + postalCodeCondition,
                headers: {
                    Authorization: _APIKEY
                },
                contentType: 'application/javascript',
                dataType: 'jsonp',
                success: function(data, status, xhr) {
                    //console.log('LCBO API success:',status);

                    storeListTotalPages = data.pager.total_pages;

                    /* Add results to temporary array */
                    storeListTemp.push(...data.result);

                    /* If there are more pages to go through, recursively(!) rerun query with next page of results */
                    if (storeListPageNumToDisplay <= storeListTotalPages) {
                        storeListPageNumToDisplay += 1;
                        beau.LCBOAPI.retrieveStoresNearPointWithProductId(storeListPageNumToDisplay, productId);
                    }
                    /* If there are no more pages to go through, create a consolidated array of data */
                    /* Merged arrays with ES6 Spread Operator
                       https://github.com/warrenshea/notes/blob/master/dev.es6-foreveryone!.online-course.md#module-0831-spreading-into-a-function */
                    else {
                        storeListConsolidated.push(...storeListTemp);
                    }
                },
                error: function(xhr, status, error) {
                    console.log('Error:', xhr.status);
                },
                complete: function() {
                    /* Once a consolidated array of data is created, we can use the data */
                    if (storeListConsolidated.length > 0) {

                        /* Remove all the stores */
                        $('.stores-list').html('');

                        /* Iterate through store list and send store data to the rendering list function */
                        for (const [i, storeData] of storeListConsolidated.entries()) {
                            beau.renderStoresWithProductId.renderStoresListItem(storeData);
                        }
                    }
                }
            });
        }
    };
});

/*
 * Module to render/display list of beers
 */
beau.core.extend('renderBeersData', function() {
    'use strict';

    /*
     * Returns a percentage formatted string based on the alcohol content
     *
     * @param int num - the alcohol content from the API
     */
    let _formatAlcoholContent = function(num) {
        return (num / 100).toString() + '%';
    };

    return {
        /*
         * Renders/displays list of beers at a rate of "beerListPerPage" variable.
         * If there are more than the page can show, use a "Load more" button. Otherwise, hide the button.
         *
         * @param object beersList - object of beers array
         * @param string conditionsQuery - add any special query conditions if any
         */
        renderBeersList: function(beersList) {
            const self = this;
            let beerListShown = 0;
            for (const [i, beerData] of beersList.entries()) {
                if (beerListShown < beerListPerPage && i === beerListShownTotal) {
                    self.renderBeerListItem(beerListShown, beerData);
                    beerListShown += 1;
                    beerListShownTotal += 1;
                }
            }
            if (beerListShownTotal < beerListConsolidated.length) {
                $('a.load-more').off();
                beau.renderBeersData.addLoadMoreListeners();
            } else {
                $('a.load-more').off().fadeOut();
            }
        },
        /*
         * Renders/displays on beer for the list of beers
         *
         * @param int iterable - a number to manage fade in delay
         * @param object beerData - beer data from the API
         */
        renderBeerListItem: function(iterable, beerData) {
            const _image_thumb = beerData.image_thumb_url || '../../dist/images/beer-no-image.jpg';
            const _alcoholContent = _formatAlcoholContent(beerData.alcohol_content);
            const _varietal = beerData.varietal || '';
            const _style = beerData.style || '';
            const _tasting_note = beerData.tasting_note || '';
            const _divider = (_varietal && _style) ? ' • ' : ' ';

            /* Use of ES6 template string */
            const markup = `
                <li data-equalize-height='beer-container' data-equalize-medium-up data-product-id="${beerData.id}">
                  <div class="beer-image-container">
                    <img
                      src="${_image_thumb}"
                      alt="Bottle of ${beerData.name}">
                  </div>
                  <div class="details" data-equalize-height='beer-details' data-equalize-medium-up>
                    <div class="heading" data-equalize-height='beer-heading' data-equalize-medium-up>
                      <h2>${beerData.name}</h2>
                    </div>
                    <p class="uppercase">${_varietal}${_divider}${_alcoholContent}</p>
                    <p>${_style}</p>
                    <p class="tasting-note">${_tasting_note}</p>
                  </div>
                  <div class="view">View<span class="screen-reader-only"> about ${beerData.name}</span></div>
                  <div class="stores">
                    <h2>Stores</h2>
                    <div class="postal-code-container">
                    </div>
                    <ul class="stores-list hide-default-list-styles">
                      <li>loading...</li>
                    </ul>
                  </div>
                </li>`;
            $('.beers-list').append(markup);

            /* Fade in the first 5 beers with a delay, and then the rest all at once */
            if (iterable < 5) {
                $('.beers-list > li:last').delay(iterable * 400).animate({ opacity: 1 }, 750, function() {
                    beau.equalizeHeights.forceResize();
                    beau.renderFeaturedBeer.addViewFeaturedBeerListener();
                });
            } else {
                $('.beers-list > li:last').delay(2000).animate({ opacity: 1 }, 750, function() {
                    beau.equalizeHeights.forceResize();
                    beau.renderFeaturedBeer.addViewFeaturedBeerListener();
                });
            }
        },
        /*
         * Renders/displays more beer when the load more button is clicked
         */
        addLoadMoreListeners: function() {
            const self = this;
            $('.load-more-container').fadeIn();
            $('a.load-more').on('click', function() {
                self.renderBeersList(beerListConsolidated);
            });
        }
    };
});

/*
 * Module to render/display a single beer
 */
beau.core.extend('renderFeaturedBeer', function() {
    'use strict';

    let _postHeight,
        _postWidth,
        _postTop,
        _postLeft,
        _scrollTop;

    return {
        /*
         * Add "ESC" key listener to close featured beer
         */
        initialize: function() {
            const self = this;
            self.addEscListener();
        },
        /*
         * Dynamically reset and re-add individual beer listeners since new beers are added to the list dynamically
         */
        addViewFeaturedBeerListener: function() {
            const self = this;
            $('.beers-list li').off();
            $('.beers-list li').on('click', function() {
                self.viewFeaturedBeer(this);
            });
        },
        /*
         * Dynamically reset and re-add individual beer listeners since new beers are added to the list dynamically
         *
         * @param object anchorItem - dom element for the beer list thumbnail that was clicked
         */
        viewFeaturedBeer: function(anchorItem) {
            const self = this;
            let _productId = 0;
            _productId = $(anchorItem).data('product-id');
            history.pushState({}, {}, '#/product-id=' + _productId);
            _postHeight = $(anchorItem).outerHeight();
            _postWidth = $(anchorItem).outerWidth();
            _postTop = $(anchorItem).offset().top - $(document).scrollTop();
            _postLeft = $(anchorItem).offset().left - $(document).scrollLeft();

            /* create a "clone" of the beer list item, and animate it to be the featured beer */
            $('.featured-beer-container .cloned').remove();
            $('.featured-beer-container').append('<div class="cloned"><div class="featured-container"></div></div>');
            $('.featured-beer-container .cloned .featured-container').html($(anchorItem).html());
            $('.featured-beer-container .cloned .featured-container').attr('data-product-id', _productId);
            $('.featured-beer-container .cloned .details')
                .hide()
                .removeAttr('data-equalize-height')
                .removeAttr('data-equalize-medium-up')
                .css('height', 'auto');
            $('.featured-beer-container .cloned .heading')
                .removeAttr('data-equalize-height')
                .removeAttr('data-equalize-medium-up')
                .css('height', 'auto');
            $('.featured-beer-container').css({ 'display': 'block' });
            $('.featured-beer-container .cloned .view').remove();
            $('.featured-beer-container .cloned').css({
                'height': _postHeight,
                'width': _postWidth,
                'top': _postTop,
                'left': _postLeft
            });
            $('.featured-beer-container .cloned').animate({
                    'width': '100%',
                    'top': '6.2rem',
                    'bottom': '0',
                    'left': '0',
                    'right': '0',
                    'opacity': 1,
                }, 150, 'linear').promise()
                .done(function() {
                    /* when the initial animation is complete, do another animation on medium up only */
                    $('.featured-beer-container .cloned').css({ 'height': 'auto' });
                    if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) >= 640) {
                        _scrollTop = $(document).scrollTop();
                        $('body').addClass('no-scroll');
                        $('.featured-beer-container .cloned .beer-image-container')
                            .animate({
                                'width': '50%',
                            }, 150, 'linear');
                        $('.featured-beer-container .cloned .details')
                            .css({
                                'position': 'absolute',
                                'top': '0',
                                'right': '0',
                                'width': 'calc(100% - 270px)',
                                'text-align': 'left',
                            });
                    }
                    /* show more beer information that wasn't in the beer list */
                    $('.featured-beer-container .cloned .details .tasting-note').fadeIn();
                    $('.featured-beer-container .cloned .details').fadeIn();
                    $('.featured-beer-container .cloned .stores').fadeIn();
                    self.addBackListener();
                    /* show the correct Postal Code UI */
                    beau.postalCodeManager.initUI();
                    /* get store details from the LCBO API */
                    beau.LCBOAPI.retrieveStoresNearPointWithProductId(storeListPageNumToDisplay, _productId);
                });
        },
        /*
         * Add close button listener to close featured beer
         */
        addBackListener: function() {
            $('.featured-beer-container .featured-beer-close').on('click', function() {
                $('body').removeClass('no-scroll');
                $(document).scrollTop(_scrollTop);
                /* Animate moving the featured beer images back to the beer list spot */
                $('.cloned').animate({
                        'height': _postHeight,
                        'width': _postWidth,
                        'top': _postTop,
                        'left': _postLeft,
                        'bottom': 'auto',
                        'right': 'auto'
                    }, 150, 'linear').promise()
                    .done(function() {
                        /* Reset Featured Beer defaults */
                        $('.featured-beer-container .featured-beer-close').off();
                        $('.featured-beer-container').css({ 'display': 'none' });
                        $('.stores-list').html(`<li>loading...</li>`);
                        beau.LCBOAPI.resetStoreList();
                        history.pushState({}, {}, '#/');
                    });
            });
        },
        /*
         * Add "ESC" key listener to close featured beer
         */
        addEscListener: function(e) {
            $(document).keyup(function(e) {
                if (e.keyCode === 27) {
                    $('.featured-beer-container .featured-beer-close').trigger('click');
                }
            });
        }
    };
});

/*
 * Module to render/display stores of a beer
 */
beau.core.extend('renderStoresWithProductId', function() {
    'use strict';

    return {
        /*
         * Renders/displays stores for featured beer
         *
         * @param object storeData - object of stores array
         */
        renderStoresListItem: function(storeData) {
            const postalCode = beau.postalCodeManager.getPostalCode();
            const addressEncode = `${storeData.address_line_1}, ${storeData.city}, ${storeData.postal_code}`.replace(/ /g, '+');
            const markup = `
                <li data-store-id="${storeData.id}">
                  <div>
                    <h3>${storeData.name}</h3>
                    <p>${storeData.address_line_1}</p>
                    <a href="https://www.google.ca/maps/dir/${postalCode}/${addressEncode}/" target="_blank">Get directions via Google Maps</a>
                  </div>
                  <hr class="divider">
                </li>`;
            $('.stores-list').append(markup);
        }
    };
});

/*
 * Module to render/display and manage the postal code aspect of this page/tool
 */
beau.core.extend('postalCodeManager', function() {
    'use strict';

    const markupHavePostalCode = `
        <span class="existing-postal-code">
          Stores nears this location: <b><span id="postal-code"></span></b>.
          <a href="javascript:beau.postalCodeManager.clear();">Enter another Postal Code</a>
        </span>`;
    const markupGetPostalCode = `
        <form action="" method="post" class="enter-postal-code" onSubmit="beau.postalCodeManager.savePostalCode();return false;">
          <label for="postal-code-input">Enter your postal code to find stores near you</label>
          <input type="text" class="text" pattern="[A-Za-z][0-9][A-Za-z] [0-9][A-Za-z][0-9]" id="postal-code-input" onfocus="this.placeholder = ''" onblur="this.placeholder = 'M4W 3N5'" placeholder="M4W 3N5">
          <label for="postal-code-submit" class="screen-reader-only">Submit to find stores near you</label>
          <input type="submit" class="submit" id="postal-code-submit" value="Enter">
        </form>`;
    return {
        /*
         * Determines if the "already set" postal code UI or the "need" postal code UI will render
         */
        initUI: function() {
            const postalCode = beau.postalCodeManager.getPostalCode();
            $('.cloned .postal-code-container').html('');
            if (postalCode) {
                $('.cloned .postal-code-container').append(markupHavePostalCode);
                $('.cloned #postal-code').html(postalCode);
            } else {
                $('.cloned .postal-code-container').append(markupGetPostalCode);
            }
        },
        /*
         * When a new postal code is entered, change the UI and reload stores based on that postal code
         */
        savePostalCode: function() {
            const self = this;
            beau.core.setCookie('postalCode', $('#postal-code-input').val(), 30);
            $('.stores-list').html(`<li>loading...</li>`);
            self.initUI();
            beau.LCBOAPI.resetStoreList();
            beau.LCBOAPI.retrieveStoresNearPointWithProductId(storeListPageNumToDisplay, $('.featured-beer-container .cloned .featured-container').data('product-id'));
        },
        /*
         * Gets the postal code value from a cookie
         *
         * @return string - cookie value
         */
        getPostalCode: function() {
            return beau.core.getCookie('postalCode');
        },
        /*
         * Unsets the cookie for the Postal Code. Loads the default store list
         */
        clear: function() {
            const self = this;
            beau.core.unsetCookie('postalCode');
            $('.stores-list').html('');
            self.initUI();
            beau.LCBOAPI.resetStoreList();
        }
    };
});