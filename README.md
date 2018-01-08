# Warren Shea's Full-Stack Masterclass course technical challenge.
## HackerYou Beau's Technical Challenge

### Items of note that may matter
* The package can be found on a web server here: (http://sandbox.warrenshea.com/2018/beaus/beers/seasonal/)
* I used jshint ES6 version to lint my JS. I have one warning on line 380 of `global.js`
* There are a few places where I used ES6 `let`/`const`, Template Strings, Arrow functions, and Spread operators
* [HTML Code Sniffer](http://squizlabs.github.io/HTML_CodeSniffer/) is an accessibility bookmarklet I use. For WCAG2 Level AA, there are only 2 errors. 1 is regarding color constrast of the hamburger menu (which I can't really change due to the styleguide colors provided). The other is an alt tag missing from the Google Maps code that I also can't really control.
* The site is responsive. I did not use the Foundation framework code at all but leveraged a couple of ideas/helper classes I found useful (coded myself though!). `show-for-small-only`, `show-for-medium-up` are a couple, for example. Some animation aspects break going mobile to desktop and vice versa but if you stay in a viewport, the experience should be good.
* The only thing I took from the actual beaus.com site was the general design (though I made some improvements in the footer), the svg for the logo (though I had to modify it to change the `fill` colour), and the hyperlinks for the navigations. All the HTML and CSS was coded from scratch without copying anything from the existing beau site.
* I developed with Sublime Text 3 and with Google Chrome 62. I tested in Firefox 58b and it looks good.

### Package Listing/Details
* /dist/css/global.css
* /dist/css/seasonal-beers.css
* /images/beer-no-image.jpg
* /images/logo.svg
* /dist/js/global.js
* /dist/js/seasonal-beers.js
* /beers/seasonal/index.html
* /readme.html
* /index.html

### File that can/should be code reviewed
* [/dist/css/global.css](http://sandbox.warrenshea.com/2018/beaus/dist/css/global.css)
* [/dist/css/seasonal-beers.css](http://sandbox.warrenshea.com/2018/beaus/dist/css/seasonal-beers.css)
* [/dist/js/global.js](http://sandbox.warrenshea.com/2018/beaus/dist/js/global.js)
* [/dist/js/seasonal-beers.js](http://sandbox.warrenshea.com/2018/beaus/dist/js/seasonal-beers.js)
* [/beers/seasonal/index.html](http://sandbox.warrenshea.com/2018/beaus/beers/seasonal/index.html)