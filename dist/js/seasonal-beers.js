/*jshint esversion: 6 */

/*  Seasonal Beer List variables */
const beerListPerPage = 20;
let beerListShownTotal = 0;
let beerListConsolidated = [];
let beerListPageNumToDisplay = 1;
let beerListTotalPages = 0;

/*  Store List for a beer  */
let storeListConsolidated = [];
let storeListPageNumToDisplay = 1;
let storeListTotalPages = 0;

/*  Temporary Array  */
let beerListTemp = [];
let storeListTemp = [];

/*  Beer Exclusion List Array - each array item is a Product ID  */
/* e.g. beerExclusionList = [1,234,5678,517797]; */
const beerExclusionList = [517797];
/* 517797 Beau's Lug Tread */

beau.core.extend('loadSeasonalBeers', function() {
    'use strict';

    /*  Seasonal Conditions Query  */
    const conditionsQuery = `&where=is_seasonal`;

    return {
        initialize: function() {
            beau.LCBOAPI.retrieveBeersData(beerListPageNumToDisplay, conditionsQuery);
        }
    };
});