/*
 *  Audio Player v-0.1.5
 *  Developed By StellenInfotech.
 *  JS Developers : Rasik Awasthi, Mohit Chawla, Rohit Garg.
 *  Designer : Amit Rai
 */
 
 
if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function ($, window, document) {

    var Carousel = {
        init : function (options, el) {
            var base = this;

            base.$elem = $(el);
            base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);

            base.userOptions = options;
            base.loadContent();
        },

        loadContent : function () {
            var base = this, url;

            function getData(data) {
                var i, content = "";
                if (typeof base.options.jsonSuccess === "function") {
                    base.options.jsonSuccess.apply(this, [data]);
                } else {
                    for (i in data.owl) {
                        if (data.owl.hasOwnProperty(i)) {
                            content += data.owl[i].item;
                        }
                    }
                    base.$elem.html(content);
                }
                base.logIn();
            }

            if (typeof base.options.beforeInit === "function") {
                base.options.beforeInit.apply(this, [base.$elem]);
            }

            if (typeof base.options.jsonPath === "string") {
                url = base.options.jsonPath;
                $.getJSON(url, getData);
            } else {
                base.logIn();
            }
        },

        logIn : function () {
            var base = this;

            base.$elem.data("owl-originalStyles", base.$elem.attr("style"));
            base.$elem.data("owl-originalClasses", base.$elem.attr("class"));

            base.$elem.css({opacity: 0});
            base.orignalItems = base.options.items;
            base.checkBrowser();
            base.wrapperWidth = 0;
            base.checkVisible = null;
            base.setVars();
        },

        setVars : function () {
            var base = this;
            if (base.$elem.children().length === 0) {return false; }
            base.baseClass();
            base.eventTypes();
            base.$userItems = base.$elem.children();
            base.itemsAmount = base.$userItems.length;
            base.wrapItems();
            base.$owlItems = base.$elem.find(".owl-item");
            base.$owlWrapper = base.$elem.find(".owl-wrapper");
            base.playDirection = "next";
            base.prevItem = 0;
            base.prevArr = [0];
            base.currentItem = 0;
            base.customEvents();
            base.onStartup();
        },

        onStartup : function () {
            var base = this;
            base.updateItems();
            base.calculateAll();
            base.buildControls();
            base.updateControls();
            base.response();
            base.moveEvents();
            base.stopOnHover();
            base.owlStatus();

            if (base.options.transitionStyle !== false) {
                base.transitionTypes(base.options.transitionStyle);
            }
            if (base.options.autoPlay === true) {
                base.options.autoPlay = 5000;
            }
            base.play();

            base.$elem.find(".owl-wrapper").css("display", "block");

            if (!base.$elem.is(":visible")) {
                base.watchVisibility();
            } else {
                base.$elem.css("opacity", 1);
            }
            base.onstartup = false;
            base.eachMoveUpdate();
            if (typeof base.options.afterInit === "function") {
                base.options.afterInit.apply(this, [base.$elem]);
            }
        },

        eachMoveUpdate : function () {
            var base = this;

            if (base.options.lazyLoad === true) {
                base.lazyLoad();
            }
            if (base.options.autoHeight === true) {
                base.autoHeight();
            }
            base.onVisibleItems();

            if (typeof base.options.afterAction === "function") {
                base.options.afterAction.apply(this, [base.$elem]);
            }
        },

        updateVars : function () {
            var base = this;
            if (typeof base.options.beforeUpdate === "function") {
                base.options.beforeUpdate.apply(this, [base.$elem]);
            }
            base.watchVisibility();
            base.updateItems();
            base.calculateAll();
            base.updatePosition();
            base.updateControls();
            base.eachMoveUpdate();
            if (typeof base.options.afterUpdate === "function") {
                base.options.afterUpdate.apply(this, [base.$elem]);
            }
        },

        reload : function () {
            var base = this;
            window.setTimeout(function () {
                base.updateVars();
            }, 0);
        },

        watchVisibility : function () {
            var base = this;

            if (base.$elem.is(":visible") === false) {
                base.$elem.css({opacity: 0});
                window.clearInterval(base.autoPlayInterval);
                window.clearInterval(base.checkVisible);
            } else {
                return false;
            }
            base.checkVisible = window.setInterval(function () {
                if (base.$elem.is(":visible")) {
                    base.reload();
                    base.$elem.animate({opacity: 1}, 200);
                    window.clearInterval(base.checkVisible);
                }
            }, 500);
        },

        wrapItems : function () {
            var base = this;
            base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
            base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
            base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
            base.$elem.css("display", "block");
        },

        baseClass : function () {
            var base = this,
                hasBaseClass = base.$elem.hasClass(base.options.baseClass),
                hasThemeClass = base.$elem.hasClass(base.options.theme);

            if (!hasBaseClass) {
                base.$elem.addClass(base.options.baseClass);
            }

            if (!hasThemeClass) {
                base.$elem.addClass(base.options.theme);
            }
        },

        updateItems : function () {
            var base = this, width, i;

            if (base.options.responsive === false) {
                return false;
            }
            if (base.options.singleItem === true) {
                base.options.items = base.orignalItems = 1;
                base.options.itemsCustom = false;
                base.options.itemsDesktop = false;
                base.options.itemsDesktopSmall = false;
                base.options.itemsTablet = false;
                base.options.itemsTabletSmall = false;
                base.options.itemsMobile = false;
                return false;
            }

            width = $(base.options.responsiveBaseWidth).width();

            if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
                base.options.items = base.orignalItems;
            }
            if (base.options.itemsCustom !== false) {
                //Reorder array by screen size
                base.options.itemsCustom.sort(function (a, b) {return a[0] - b[0]; });

                for (i = 0; i < base.options.itemsCustom.length; i += 1) {
                    if (base.options.itemsCustom[i][0] <= width) {
                        base.options.items = base.options.itemsCustom[i][1];
                    }
                }

            } else {

                if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
                    base.options.items = base.options.itemsDesktop[1];
                }

                if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
                    base.options.items = base.options.itemsDesktopSmall[1];
                }

                if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
                    base.options.items = base.options.itemsTablet[1];
                }

                if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
                    base.options.items = base.options.itemsTabletSmall[1];
                }

                if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
                    base.options.items = base.options.itemsMobile[1];
                }
            }

            //if number of items is less than declared
            if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
                base.options.items = base.itemsAmount;
            }
        },

        response : function () {
            var base = this,
                smallDelay,
                lastWindowWidth;

            if (base.options.responsive !== true) {
                return false;
            }
            lastWindowWidth = $(window).width();

            base.resizer = function () {
                if ($(window).width() !== lastWindowWidth) {
                    if (base.options.autoPlay !== false) {
                        window.clearInterval(base.autoPlayInterval);
                    }
                    window.clearTimeout(smallDelay);
                    smallDelay = window.setTimeout(function () {
                        lastWindowWidth = $(window).width();
                        base.updateVars();
                    }, base.options.responsiveRefreshRate);
                }
            };
            $(window).resize(base.resizer);
        },

        updatePosition : function () {
            var base = this;
            base.jumpTo(base.currentItem);
            if (base.options.autoPlay !== false) {
                base.checkAp();
            }
        },

        appendItemsSizes : function () {
            var base = this,
                roundPages = 0,
                lastItem = base.itemsAmount - base.options.items;

            base.$owlItems.each(function (index) {
                var $this = $(this);
                $this
                    .css({"width": base.itemWidth})
                    .data("owl-item", Number(index));

                if (index % base.options.items === 0 || index === lastItem) {
                    if (!(index > lastItem)) {
                        roundPages += 1;
                    }
                }
                $this.data("owl-roundPages", roundPages);
            });
        },

        appendWrapperSizes : function () {
            var base = this,
                width = base.$owlItems.length * base.itemWidth;

            base.$owlWrapper.css({
                "width": width * 2,
                "left": 0
            });
            base.appendItemsSizes();
        },

        calculateAll : function () {
            var base = this;
            base.calculateWidth();
            base.appendWrapperSizes();
            base.loops();
            base.max();
        },

        calculateWidth : function () {
            var base = this;
            base.itemWidth = Math.round(base.$elem.width() / base.options.items);
        },

        max : function () {
            var base = this,
                maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
            if (base.options.items > base.itemsAmount) {
                base.maximumItem = 0;
                maximum = 0;
                base.maximumPixels = 0;
            } else {
                base.maximumItem = base.itemsAmount - base.options.items;
                base.maximumPixels = maximum;
            }
            return maximum;
        },

        min : function () {
            return 0;
        },

        loops : function () {
            var base = this,
                prev = 0,
                elWidth = 0,
                i,
                item,
                roundPageNum;

            base.positionsInArray = [0];
            base.pagesInArray = [];

            for (i = 0; i < base.itemsAmount; i += 1) {
                elWidth += base.itemWidth;
                base.positionsInArray.push(-elWidth);

                if (base.options.scrollPerPage === true) {
                    item = $(base.$owlItems[i]);
                    roundPageNum = item.data("owl-roundPages");
                    if (roundPageNum !== prev) {
                        base.pagesInArray[prev] = base.positionsInArray[i];
                        prev = roundPageNum;
                    }
                }
            }
        },

        buildControls : function () {
            var base = this;
            if (base.options.navigation === true || base.options.pagination === true) {
                base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
            }
            if (base.options.pagination === true) {
                base.buildPagination();
            }
            if (base.options.navigation === true) {
                base.buildButtons();
            }
        },

        buildButtons : function () {
            var base = this,
                buttonsWrapper = $("<div class=\"owl-buttons\"/>");
            base.owlControls.append(buttonsWrapper);

            base.buttonPrev = $("<div/>", {
                "class" : "owl-prev",
                "html" : base.options.navigationText[0] || ""
            });

            base.buttonNext = $("<div/>", {
                "class" : "owl-next",
                "html" : base.options.navigationText[1] || ""
            });

            buttonsWrapper
                .append(base.buttonPrev)
                .append(base.buttonNext);

            buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
            });

            buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
                if ($(this).hasClass("owl-next")) {
                    base.next();
                } else {
                    base.prev();
                }
            });
        },

        buildPagination : function () {
            var base = this;

            base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
            base.owlControls.append(base.paginationWrapper);

            base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function (event) {
                event.preventDefault();
                if (Number($(this).data("owl-page")) !== base.currentItem) {
                    base.goTo(Number($(this).data("owl-page")), true);
                }
            });
        },

        updatePagination : function () {
            var base = this,
                counter,
                lastPage,
                lastItem,
                i,
                paginationButton,
                paginationButtonInner;

            if (base.options.pagination === false) {
                return false;
            }

            base.paginationWrapper.html("");

            counter = 0;
            lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

            for (i = 0; i < base.itemsAmount; i += 1) {
                if (i % base.options.items === 0) {
                    counter += 1;
                    if (lastPage === i) {
                        lastItem = base.itemsAmount - base.options.items;
                    }
                    paginationButton = $("<div/>", {
                        "class" : "owl-page"
                    });
                    paginationButtonInner = $("<span></span>", {
                        "text": base.options.paginationNumbers === true ? counter : "",
                        "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
                    });
                    paginationButton.append(paginationButtonInner);

                    paginationButton.data("owl-page", lastPage === i ? lastItem : i);
                    paginationButton.data("owl-roundPages", counter);

                    base.paginationWrapper.append(paginationButton);
                }
            }
            base.checkPagination();
        },
        checkPagination : function () {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.find(".owl-page").each(function () {
                if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
                    base.paginationWrapper
                        .find(".owl-page")
                        .removeClass("active");
                    $(this).addClass("active");
                }
            });
        },

        checkNavigation : function () {
            var base = this;

            if (base.options.navigation === false) {
                return false;
            }
            if (base.options.rewindNav === false) {
                if (base.currentItem === 0 && base.maximumItem === 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem === 0 && base.maximumItem !== 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.removeClass("disabled");
                } else if (base.currentItem === base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.removeClass("disabled");
                }
            }
        },

        updateControls : function () {
            var base = this;
            base.updatePagination();
            base.checkNavigation();
            if (base.owlControls) {
                if (base.options.items >= base.itemsAmount) {
                    base.owlControls.hide();
                } else {
                    base.owlControls.show();
                }
            }
        },

        destroyControls : function () {
            var base = this;
            if (base.owlControls) {
                base.owlControls.remove();
            }
        },

        next : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
            if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? (base.options.items - 1) : 0)) {
                if (base.options.rewindNav === true) {
                    base.currentItem = 0;
                    speed = "rewind";
                } else {
                    base.currentItem = base.maximumItem;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        prev : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
                base.currentItem = 0;
            } else {
                base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
            }
            if (base.currentItem < 0) {
                if (base.options.rewindNav === true) {
                    base.currentItem = base.maximumItem;
                    speed = "rewind";
                } else {
                    base.currentItem = 0;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        goTo : function (position, speed, drag) {
            var base = this,
                goToPixel;

            if (base.isTransition) {
                return false;
            }
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }

            base.currentItem = base.owl.currentItem = position;
            if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
                base.swapSpeed(0);
                if (base.browser.support3d === true) {
                    base.transition3d(base.positionsInArray[position]);
                } else {
                    base.css2slide(base.positionsInArray[position], 1);
                }
                base.afterGo();
                base.singleItemTransition();
                return false;
            }
            goToPixel = base.positionsInArray[position];

            if (base.browser.support3d === true) {
                base.isCss3Finish = false;

                if (speed === true) {
                    base.swapSpeed("paginationSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.paginationSpeed);

                } else if (speed === "rewind") {
                    base.swapSpeed(base.options.rewindSpeed);
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.rewindSpeed);

                } else {
                    base.swapSpeed("slideSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.slideSpeed);
                }
                base.transition3d(goToPixel);
            } else {
                if (speed === true) {
                    base.css2slide(goToPixel, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.css2slide(goToPixel, base.options.rewindSpeed);
                } else {
                    base.css2slide(goToPixel, base.options.slideSpeed);
                }
            }
            base.afterGo();
        },

        jumpTo : function (position) {
            var base = this;
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem || position === -1) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }
            base.swapSpeed(0);
            if (base.browser.support3d === true) {
                base.transition3d(base.positionsInArray[position]);
            } else {
                base.css2slide(base.positionsInArray[position], 1);
            }
            base.currentItem = base.owl.currentItem = position;
            base.afterGo();
        },

        afterGo : function () {
            var base = this;

            base.prevArr.push(base.currentItem);
            base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
            base.prevArr.shift(0);

            if (base.prevItem !== base.currentItem) {
                base.checkPagination();
                base.checkNavigation();
                base.eachMoveUpdate();

                if (base.options.autoPlay !== false) {
                    base.checkAp();
                }
            }
            if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
                base.options.afterMove.apply(this, [base.$elem]);
            }
        },

        stop : function () {
            var base = this;
            base.apStatus = "stop";
            window.clearInterval(base.autoPlayInterval);
        },

        checkAp : function () {
            var base = this;
            if (base.apStatus !== "stop") {
                base.play();
            }
        },

        play : function () {
            var base = this;
            base.apStatus = "play";
            if (base.options.autoPlay === false) {
                return false;
            }
            window.clearInterval(base.autoPlayInterval);
            base.autoPlayInterval = window.setInterval(function () {
                base.next(true);
            }, base.options.autoPlay);
        },

        swapSpeed : function (action) {
            var base = this;
            if (action === "slideSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
            } else if (action === "paginationSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
            } else if (typeof action !== "string") {
                base.$owlWrapper.css(base.addCssSpeed(action));
            }
        },

        addCssSpeed : function (speed) {
            return {
                "-webkit-transition": "all " + speed + "ms ease",
                "-moz-transition": "all " + speed + "ms ease",
                "-o-transition": "all " + speed + "ms ease",
                "transition": "all " + speed + "ms ease"
            };
        },

        removeTransition : function () {
            return {
                "-webkit-transition": "",
                "-moz-transition": "",
                "-o-transition": "",
                "transition": ""
            };
        },

        doTranslate : function (pixels) {
            return {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            };
        },

        transition3d : function (value) {
            var base = this;
            base.$owlWrapper.css(base.doTranslate(value));
        },

        css2move : function (value) {
            var base = this;
            base.$owlWrapper.css({"left" : value});
        },

        css2slide : function (value, speed) {
            var base = this;

            base.isCssFinish = false;
            base.$owlWrapper.stop(true, true).animate({
                "left" : value
            }, {
                duration : speed || base.options.slideSpeed,
                complete : function () {
                    base.isCssFinish = true;
                }
            });
        },

        checkBrowser : function () {
            var base = this,
                translate3D = "translate3d(0px, 0px, 0px)",
                tempElem = document.createElement("div"),
                regex,
                asSupport,
                support3d,
                isTouch;

            tempElem.style.cssText = "  -moz-transform:" + translate3D +
                                  "; -ms-transform:"     + translate3D +
                                  "; -o-transform:"      + translate3D +
                                  "; -webkit-transform:" + translate3D +
                                  "; transform:"         + translate3D;
            regex = /translate3d\(0px, 0px, 0px\)/g;
            asSupport = tempElem.style.cssText.match(regex);
            support3d = (asSupport !== null && asSupport.length === 1);

            isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;

            base.browser = {
                "support3d" : support3d,
                "isTouch" : isTouch
            };
        },

        moveEvents : function () {
            var base = this;
            if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
                base.gestures();
                base.disabledEvents();
            }
        },

        eventTypes : function () {
            var base = this,
                types = ["s", "e", "x"];

            base.ev_types = {};

            if (base.options.mouseDrag === true && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl mousedown.owl",
                    "touchmove.owl mousemove.owl",
                    "touchend.owl touchcancel.owl mouseup.owl"
                ];
            } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl",
                    "touchmove.owl",
                    "touchend.owl touchcancel.owl"
                ];
            } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
                types = [
                    "mousedown.owl",
                    "mousemove.owl",
                    "mouseup.owl"
                ];
            }

            base.ev_types.start = types[0];
            base.ev_types.move = types[1];
            base.ev_types.end = types[2];
        },

        disabledEvents :  function () {
            var base = this;
            base.$elem.on("dragstart.owl", function (event) { event.preventDefault(); });
            base.$elem.on("mousedown.disableTextSelect", function (e) {
                return $(e.target).is('input, textarea, select, option');
            });
        },

        gestures : function () {
            /*jslint unparam: true*/
            var base = this,
                locals = {
                    offsetX : 0,
                    offsetY : 0,
                    baseElWidth : 0,
                    relativePos : 0,
                    position: null,
                    minSwipe : null,
                    maxSwipe: null,
                    sliding : null,
                    dargging: null,
                    targetElement : null
                };

            base.isCssFinish = true;

            function getTouches(event) {
                if (event.touches !== undefined) {
                    return {
                        x : event.touches[0].pageX,
                        y : event.touches[0].pageY
                    };
                }

                if (event.touches === undefined) {
                    if (event.pageX !== undefined) {
                        return {
                            x : event.pageX,
                            y : event.pageY
                        };
                    }
                    if (event.pageX === undefined) {
                        return {
                            x : event.clientX,
                            y : event.clientY
                        };
                    }
                }
            }

            function swapEvents(type) {
                if (type === "on") {
                    $(document).on(base.ev_types.move, dragMove);
                    $(document).on(base.ev_types.end, dragEnd);
                } else if (type === "off") {
                    $(document).off(base.ev_types.move);
                    $(document).off(base.ev_types.end);
                }
            }

            function dragStart(event) {
                var ev = event.originalEvent || event || window.event,
                    position;

                if (ev.which === 3) {
                    return false;
                }
                if (base.itemsAmount <= base.options.items) {
                    return;
                }
                if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }

                if (base.options.autoPlay !== false) {
                    window.clearInterval(base.autoPlayInterval);
                }

                if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
                    base.$owlWrapper.addClass("grabbing");
                }

                base.newPosX = 0;
                base.newRelativeX = 0;

                $(this).css(base.removeTransition());

                position = $(this).position();
                locals.relativePos = position.left;

                locals.offsetX = getTouches(ev).x - position.left;
                locals.offsetY = getTouches(ev).y - position.top;

                swapEvents("on");

                locals.sliding = false;
                locals.targetElement = ev.target || ev.srcElement;
            }

            function dragMove(event) {
                var ev = event.originalEvent || event || window.event,
                    minSwipe,
                    maxSwipe;

                base.newPosX = getTouches(ev).x - locals.offsetX;
                base.newPosY = getTouches(ev).y - locals.offsetY;
                base.newRelativeX = base.newPosX - locals.relativePos;

                if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
                    locals.dragging = true;
                    base.options.startDragging.apply(base, [base.$elem]);
                }

                if ((base.newRelativeX > 8 || base.newRelativeX < -8) && (base.browser.isTouch === true)) {
                    if (ev.preventDefault !== undefined) {
                        ev.preventDefault();
                    } else {
                        ev.returnValue = false;
                    }
                    locals.sliding = true;
                }

                if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
                    $(document).off("touchmove.owl");
                }

                minSwipe = function () {
                    return base.newRelativeX / 5;
                };

                maxSwipe = function () {
                    return base.maximumPixels + base.newRelativeX / 5;
                };

                base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
                if (base.browser.support3d === true) {
                    base.transition3d(base.newPosX);
                } else {
                    base.css2move(base.newPosX);
                }
            }

            function dragEnd(event) {
                var ev = event.originalEvent || event || window.event,
                    newPosition,
                    handlers,
                    owlStopEvent;

                ev.target = ev.target || ev.srcElement;

                locals.dragging = false;

                if (base.browser.isTouch !== true) {
                    base.$owlWrapper.removeClass("grabbing");
                }

                if (base.newRelativeX < 0) {
                    base.dragDirection = base.owl.dragDirection = "left";
                } else {
                    base.dragDirection = base.owl.dragDirection = "right";
                }

                if (base.newRelativeX !== 0) {
                    newPosition = base.getNewPosition();
                    base.goTo(newPosition, false, "drag");
                    if (locals.targetElement === ev.target && base.browser.isTouch !== true) {
                        $(ev.target).on("click.disable", function (ev) {
                            ev.stopImmediatePropagation();
                            ev.stopPropagation();
                            ev.preventDefault();
                            $(ev.target).off("click.disable");
                        });
                        handlers = $._data(ev.target, "events").click;
                        owlStopEvent = handlers.pop();
                        handlers.splice(0, 0, owlStopEvent);
                    }
                }
                swapEvents("off");
            }
            base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
        },

        getNewPosition : function () {
            var base = this,
                newPosition = base.closestItem();

            if (newPosition > base.maximumItem) {
                base.currentItem = base.maximumItem;
                newPosition  = base.maximumItem;
            } else if (base.newPosX >= 0) {
                newPosition = 0;
                base.currentItem = 0;
            }
            return newPosition;
        },
        closestItem : function () {
            var base = this,
                array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
                goal = base.newPosX,
                closest = null;

            $.each(array, function (i, v) {
                if (goal - (base.itemWidth / 20) > array[i + 1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
                    closest = v;
                    if (base.options.scrollPerPage === true) {
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        base.currentItem = i;
                    }
                } else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
                    if (base.options.scrollPerPage === true) {
                        closest = array[i + 1] || array[array.length - 1];
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        closest = array[i + 1];
                        base.currentItem = i + 1;
                    }
                }
            });
            return base.currentItem;
        },

        moveDirection : function () {
            var base = this,
                direction;
            if (base.newRelativeX < 0) {
                direction = "right";
                base.playDirection = "next";
            } else {
                direction = "left";
                base.playDirection = "prev";
            }
            return direction;
        },

        customEvents : function () {
            /*jslint unparam: true*/
            var base = this;
            base.$elem.on("owl.next", function () {
                base.next();
            });
            base.$elem.on("owl.prev", function () {
                base.prev();
            });
            base.$elem.on("owl.play", function (event, speed) {
                base.options.autoPlay = speed;
                base.play();
                base.hoverStatus = "play";
            });
            base.$elem.on("owl.stop", function () {
                base.stop();
                base.hoverStatus = "stop";
            });
            base.$elem.on("owl.goTo", function (event, item) {
                base.goTo(item);
            });
            base.$elem.on("owl.jumpTo", function (event, item) {
                base.jumpTo(item);
            });
        },

        stopOnHover : function () {
            var base = this;
            if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
                base.$elem.on("mouseover", function () {
                    base.stop();
                });
                base.$elem.on("mouseout", function () {
                    if (base.hoverStatus !== "stop") {
                        base.play();
                    }
                });
            }
        },

        lazyLoad : function () {
            var base = this,
                i,
                $item,
                itemNumber,
                $lazyImg,
                follow;

            if (base.options.lazyLoad === false) {
                return false;
            }
            for (i = 0; i < base.itemsAmount; i += 1) {
                $item = $(base.$owlItems[i]);

                if ($item.data("owl-loaded") === "loaded") {
                    continue;
                }

                itemNumber = $item.data("owl-item");
                $lazyImg = $item.find(".lazyOwl");

                if (typeof $lazyImg.data("src") !== "string") {
                    $item.data("owl-loaded", "loaded");
                    continue;
                }
                if ($item.data("owl-loaded") === undefined) {
                    $lazyImg.hide();
                    $item.addClass("loading").data("owl-loaded", "checked");
                }
                if (base.options.lazyFollow === true) {
                    follow = itemNumber >= base.currentItem;
                } else {
                    follow = true;
                }
                if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
                    base.lazyPreload($item, $lazyImg);
                }
            }
        },

        lazyPreload : function ($item, $lazyImg) {
            var base = this,
                iterations = 0,
                isBackgroundImg;

            if ($lazyImg.prop("tagName") === "DIV") {
                $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
                isBackgroundImg = true;
            } else {
                $lazyImg[0].src = $lazyImg.data("src");
            }

            function showImage() {
                $item.data("owl-loaded", "loaded").removeClass("loading");
                $lazyImg.removeAttr("data-src");
                if (base.options.lazyEffect === "fade") {
                    $lazyImg.fadeIn(400);
                } else {
                    $lazyImg.show();
                }
                if (typeof base.options.afterLazyLoad === "function") {
                    base.options.afterLazyLoad.apply(this, [base.$elem]);
                }
            }

            function checkLazyImage() {
                iterations += 1;
                if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
                    showImage();
                } else if (iterations <= 100) {//if image loads in less than 10 seconds 
                    window.setTimeout(checkLazyImage, 100);
                } else {
                    showImage();
                }
            }

            checkLazyImage();
        },

        autoHeight : function () {
            var base = this,
                $currentimg = $(base.$owlItems[base.currentItem]).find("img"),
                iterations;

            function addHeight() {
                var $currentItem = $(base.$owlItems[base.currentItem]).height();
                base.wrapperOuter.css("height", $currentItem + "px");
                if (!base.wrapperOuter.hasClass("autoHeight")) {
                    window.setTimeout(function () {
                        base.wrapperOuter.addClass("autoHeight");
                    }, 0);
                }
            }

            function checkImage() {
                iterations += 1;
                if (base.completeImg($currentimg.get(0))) {
                    addHeight();
                } else if (iterations <= 100) { //if image loads in less than 10 seconds 
                    window.setTimeout(checkImage, 100);
                } else {
                    base.wrapperOuter.css("height", ""); //Else remove height attribute
                }
            }

            if ($currentimg.get(0) !== undefined) {
                iterations = 0;
                checkImage();
            } else {
                addHeight();
            }
        },

        completeImg : function (img) {
            var naturalWidthType;

            if (!img.complete) {
                return false;
            }
            naturalWidthType = typeof img.naturalWidth;
            if (naturalWidthType !== "undefined" && img.naturalWidth === 0) {
                return false;
            }
            return true;
        },

        onVisibleItems : function () {
            var base = this,
                i;

            if (base.options.addClassActive === true) {
                base.$owlItems.removeClass("active");
            }
            base.visibleItems = [];
            for (i = base.currentItem; i < base.currentItem + base.options.items; i += 1) {
                base.visibleItems.push(i);

                if (base.options.addClassActive === true) {
                    $(base.$owlItems[i]).addClass("active");
                }
            }
            base.owl.visibleItems = base.visibleItems;
        },

        transitionTypes : function (className) {
            var base = this;
            //Currently available: "fade", "backSlide", "goDown", "fadeUp"
            base.outClass = "owl-" + className + "-out";
            base.inClass = "owl-" + className + "-in";
        },

        singleItemTransition : function () {
            var base = this,
                outClass = base.outClass,
                inClass = base.inClass,
                $currentItem = base.$owlItems.eq(base.currentItem),
                $prevItem = base.$owlItems.eq(base.prevItem),
                prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
                origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2,
                animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

            base.isTransition = true;

            base.$owlWrapper
                .addClass('owl-origin')
                .css({
                    "-webkit-transform-origin" : origin + "px",
                    "-moz-perspective-origin" : origin + "px",
                    "perspective-origin" : origin + "px"
                });
            function transStyles(prevPos) {
                return {
                    "position" : "relative",
                    "left" : prevPos + "px"
                };
            }

            $prevItem
                .css(transStyles(prevPos, 10))
                .addClass(outClass)
                .on(animEnd, function () {
                    base.endPrev = true;
                    $prevItem.off(animEnd);
                    base.clearTransStyle($prevItem, outClass);
                });

            $currentItem
                .addClass(inClass)
                .on(animEnd, function () {
                    base.endCurrent = true;
                    $currentItem.off(animEnd);
                    base.clearTransStyle($currentItem, inClass);
                });
        },

        clearTransStyle : function (item, classToRemove) {
            var base = this;
            item.css({
                "position" : "",
                "left" : ""
            }).removeClass(classToRemove);

            if (base.endPrev && base.endCurrent) {
                base.$owlWrapper.removeClass('owl-origin');
                base.endPrev = false;
                base.endCurrent = false;
                base.isTransition = false;
            }
        },

        owlStatus : function () {
            var base = this;
            base.owl = {
                "userOptions"   : base.userOptions,
                "baseElement"   : base.$elem,
                "userItems"     : base.$userItems,
                "owlItems"      : base.$owlItems,
                "currentItem"   : base.currentItem,
                "prevItem"      : base.prevItem,
                "visibleItems"  : base.visibleItems,
                "isTouch"       : base.browser.isTouch,
                "browser"       : base.browser,
                "dragDirection" : base.dragDirection
            };
        },

        clearEvents : function () {
            var base = this;
            base.$elem.off(".owl owl mousedown.disableTextSelect");
            $(document).off(".owl owl");
            $(window).off("resize", base.resizer);
        },

        unWrap : function () {
            var base = this;
            if (base.$elem.children().length !== 0) {
                base.$owlWrapper.unwrap();
                base.$userItems.unwrap().unwrap();
                if (base.owlControls) {
                    base.owlControls.remove();
                }
            }
            base.clearEvents();
            base.$elem
                .attr("style", base.$elem.data("owl-originalStyles") || "")
                .attr("class", base.$elem.data("owl-originalClasses"));
        },

        destroy : function () {
            var base = this;
            base.stop();
            window.clearInterval(base.checkVisible);
            base.unWrap();
            base.$elem.removeData();
        },

        reinit : function (newOptions) {
            var base = this,
                options = $.extend({}, base.userOptions, newOptions);
            base.unWrap();
            base.init(options, base.$elem);
        },

        addItem : function (htmlString, targetPosition) {
            var base = this,
                position;

            if (!htmlString) {return false; }

            if (base.$elem.children().length === 0) {
                base.$elem.append(htmlString);
                base.setVars();
                return false;
            }
            base.unWrap();
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            if (position >= base.$userItems.length || position === -1) {
                base.$userItems.eq(-1).after(htmlString);
            } else {
                base.$userItems.eq(position).before(htmlString);
            }

            base.setVars();
        },

        removeItem : function (targetPosition) {
            var base = this,
                position;

            if (base.$elem.children().length === 0) {
                return false;
            }
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }

            base.unWrap();
            base.$userItems.eq(position).remove();
            base.setVars();
        }

    };

    $.fn.owlCarousel = function (options) {
        return this.each(function () {
            if ($(this).data("owl-init") === true) {
                return false;
            }
            $(this).data("owl-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $.data(this, "owlCarousel", carousel);
        });
    };

    $.fn.owlCarousel.options = {

        items : 5,
        itemsCustom : false,
        itemsDesktop : [1199, 4],
        itemsDesktopSmall : [979, 3],
        itemsTablet : [768, 2],
        itemsTabletSmall : false,
        itemsMobile : [479, 1],
        singleItem : false,
        itemsScaleUp : false,

        slideSpeed : 200,
        paginationSpeed : 800,
        rewindSpeed : 1000,

        autoPlay : false,
        stopOnHover : false,

        navigation : false,
        navigationText : ["prev", "next"],
        rewindNav : false,
        scrollPerPage : false,

        pagination : false,
        paginationNumbers : false,

        responsive : true,
        responsiveRefreshRate : 200,
        responsiveBaseWidth : window,

        baseClass : "owl-carousel",
        theme : "owl-theme",

        lazyLoad : false,
        lazyFollow : true,
        lazyEffect : "fade",

        autoHeight : false,

        jsonPath : false,
        jsonSuccess : false,

        dragBeforeAnimFinish : true,
        mouseDrag : true,
        touchDrag : true,

        addClassActive : false,
        transitionStyle : false,

        beforeUpdate : false,
        afterUpdate : false,
        beforeInit : false,
        afterInit : false,
        beforeMove : false,
        afterMove : false,
        afterAction : false,
        startDragging : false,
        afterLazyLoad: false
    };
}(jQuery, window, document));

/* Define a global variable*/
var player,playerbuttons, middlebar, rightbar, elements, loadConfig, playerLoad, ytP, youtubePlayer, intrval,popup;
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};
function playerInit(){/*Create a class playerInit*/
	this.container;/*Define container variable for playerInit class*/
	this.configfile;/*Define configfile variable for playerInit class*/
	this.response;/*Define response variable for playerInit class*/
	this.playerType;/*Define playerType variable for playerInit class*/
	this.autoPlay = 1;
	this.playerSkin = 'dark';
};
playerInit.prototype.init = function(){/* Declare a init function of playerInit class*/
	loadConfig = new configFile(this.configfile);/* Create a loadConfig object of configFile class*/
	loadConfig.init();
};
playerInit.prototype.addsong = function(obj){/* Declare a init function of playerInit class*/
	var l = loadConfig.playlist.length;
	clearInterval(intrval);
	if(l == 1 && loadConfig.playlist[0].filename == ''){
		loadConfig.playlist[0] = Object.create(obj);
		l = 0;
	}
	else{
		loadConfig.playlist[l] = Object.create(obj);
	}
	playerLoad.startPl();
	playerLoad.currentTrack = l;
	playerLoad.usePlaylist = Object.create(loadConfig.playlist);
	if(playerLoad.shuffleon === true){
		playerLoad.usePlaylist = playerLoad.shuffleth(playerLoad.usePlaylist);
		for(j in playerLoad.usePlaylist){
			if(playerLoad.usePlaylist[j].filename == loadConfig.playlist[l].filename){
				if(playit==true){
					playerLoad.currentTrack = j;
					l = j;
				}
			}
		}
	}
	if(playit==true){
		playerLoad.playNext(playerLoad.usePlaylist[l]);
	}
};
playerInit.prototype.returnPlaylist = function(obj){/* Declare a init function of playerInit class*/
	return playerLoad.usePlaylist;
};
player = new playerInit();/*Create a player object of playerInit class*/

function configFile(file){/*Create a configFile class*/
	this.file = file;/*Declare file variable for configFile class*/
	this.shareUrl;/*Define shareUrl variable for configFile class*/
	this.playlist = new Array();/*Define playlist array for configFile class*/
	this.skin;
}
configFile.prototype.init = function(){
	this.load(); /*call function load for configFile class*/
}
configFile.prototype.load = function(){/* Declare a load function for configFile class*/
	/* Get XML file using ajax*/

	if(player.configfile != undefined){
		var xhttp,xmlfile = this.file;
		if (window.XMLHttpRequest){
		  xhttp=new XMLHttpRequest();
		}
		else{
		  xhttp=new ActiveXObject("Microsoft.XMLHTTP"); 
		}
		xhttp.open("GET",xmlfile,true);
		try{
			xhttp.send();
		}
		catch(e){
			if(e.name === 'NetworkError'){
				console.log("Error: There was a network error.");
			}
		}
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState===4 && xhttp.status===200){
				player.response = xhttp.responseXML;
				loadConfig.genPlayList();/*call function genPlayList for loadConfig class*/
				playerLoad = new playerLoader(player.container);/*Create a playerLoad object for playerLoader class*/
				playerLoad.init();/* call function init for playerLoader class */
			}
		};
	}
	else{
		loadConfig.directPlay();/*call function genPlayList for loadConfig class*/
		playerLoad = new playerLoader(player.container);/*Create a playerLoad object for playerLoader class*/
		playerLoad.init();
	}
};
configFile.prototype.directPlay = function(){
	this.skin = '';
	this.playlist = new Array
	this.playlist[0] = {
			id : '',
			mediatype : '',
			filename : '',
			artist : '',
			title : '',
			comments : '',
			cover : '',
			album : '',
	};
	if(player.playerSkin == 'light'){
		this.skin = 'light-theme'; 
	}
	if(player.playerType == 'mainplayer'){
		this.loadElements();/*call a loadElements function in which we are creating a html for mainplayer*/
	}
	else if(player.playerType == 'horizontal'){
		this.horizontal();/*call a horizontal function in which we are creating a html for horizontal*/
	}
	else if(player.playerType == 'vertical'){
		this.vertical();/*call a vertical function in which we are creating a html for vertical*/
	}
	else if(player.playerType == 'topbar'){
		this.topbar();/*call a topbar function in which we are creating a html for topbar*/
	}
};
configFile.prototype.genPlayList = function(){/*Declare function genPlayList for configFile class*/
	var li = this.getTag('item',player.response);/*call a function getTag with two parameters*/
	this.shareUrl = this.getTag('iframe',player.response);/*call a function getTag with two parameters*/
	this.shareUrl = this.getContent(this.shareUrl);/*call a function getContent*/
	/* get content from xml file and generate a playlist array */
	for(i = 0; i < li.length; i++){
		var mediatype = li[i].getAttribute('mediatype');
		var id = this.getTag('id',li[i]);
		id = this.getContent(id);
		
		var filename = this.getTag('filename',li[i]);
		filename = this.getContent(filename);
		
		var artist = this.getTag('artist',li[i]);
		artist = this.getContent(artist);
		
		var title = this.getTag('title',li[i]);
		title = this.getContent(title);
		
		var comments = this.getTag('comments',li[i]);
		comments = this.getContent(comments);
		
		var cover = this.getTag('cover',li[i]);
		cover = this.getContent(cover);
		
		var album = this.getTag('album',li[i]);
		album = this.getContent(album);
		/*create a playlist array*/
		this.playlist[i] = {
			id : id,
			mediatype : mediatype,
			filename : filename,
			artist : artist,
			title : title,
			comments : comments,
			cover : cover,
			album : album
		};
	}
	this.skin = '';
	if(player.playerSkin == 'light'){
		this.skin = 'light-theme'; 
	}
	if(player.playerType == 'mainplayer'){
		this.loadElements();/*call a loadElements function in which we are creating a html for mainplayer*/
	}
	else if(player.playerType == 'horizontal'){
		this.horizontal();/*call a horizontal function in which we are creating a html for horizontal*/
	}
	else if(player.playerType == 'vertical'){
		this.vertical();/*call a vertical function in which we are creating a html for vertical*/
	}
	else if(player.playerType == 'topbar'){
		this.topbar();/*call a topbar function in which we are creating a html for topbar*/
	}
};
configFile.prototype.getTag = function(tagname,refrence){/*Declare function getTag for configFile class.In which we are getting a tag name*/
	if(typeof refrence === 'object'){
	 	return refrence.getElementsByTagName(tagname);
	}
};
configFile.prototype.getContent = function(tag){/*Declare function getContent for configFile class.In which we are getting a content for particular tag*/
	if(typeof tag !== 'undefined'){
		if(tag[0].childNodes.length > 0 && typeof tag === 'object'){
			return tag[0].childNodes[0].nodeValue;
		}
		else{
			return null;
		}
	}
	else{
		return null;
	}
};

configFile.prototype.loadElements = function(){	/* creating a html for main player*/
ref=this;
playerbuttons = {
	obj : {
		type : {
			type : 'a',
			attr : {
				class : 'btnPlayer previous  colorbtn'
			},
			set : {
				objname : "previous"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : "spritePlayer"
						}
					}
				}
			}
		},
		type2 : {
			type : 'a',
			attr : {
				class : 'btnPlayer playPause play  colorbtn'
			},
			set : {
				objname : "play"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : "spritePlayer"
						}
					}
				}
			}
		},
		type3 : {
			type : 'a',
			attr : {
				class : 'btnPlayer next  colorbtn'
			},
			set : {
				objname : "next"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : "spritePlayer"
						}
					}
				}
			}
		}
	}
}
/**
	Player Middle Bar 
*/

middlebar = {
	obj : {
		type : {
			type : 'div',
			attr : {
				class : 'player_controller'
			},
			elements : {
				obj : {
					type : { 
						type : 'div',
						attr : {
							class : "song-title1"
						},
						elements : {
							obj : {
								type : {
									type : 'div',
									attr : {
										id : "trackInfo",
										class : "white inline-block"
									},
									text : loadConfig.playlist[0].title+' <span><a href="#"> - '+loadConfig.playlist[0].artist+'</a> </span>',
									set : {
										objname : "trackinfo"
									}
								},
								type2 : {
									type : 'div',
									attr : {
										class : "song_progress clearfix"
									},
									elements : {
										obj : {
											type : {
												type : 'div',
												attr : {
													class : "time startime a-d player-timer"
												},
												text : '0:00',
												set : {
													objname : "currenttime"
												}
											},
											type2 : {
												type : 'div',
												attr : {
													class : "buffer"
												},
												set : {
													objname : "progressbar"
												},
												elements : {
													obj : {
														type : {
															type : 'div',
															attr : {
																class : 'slider-range-min',
																style : 'width:0px'
															},
															set : {
																objname : "slider"
															},
															elements : {
																obj : {
																	type : {
																		type : 'a',
																		attr : {
																			class : 'timer-handle'
																		},
																		set : {
																			objname : "seekHead"
																		},
																	}
																}
															}
														},
														type2 : {
															type : 'div',
															attr : {
																class : 'buffering-range-min',
																style : 'width:0px'
															},
															set : {
																objname : "buffer"
															},
														}
													}
												}
											},
											type3 : {
												type : 'div',
												attr : {
													class : "total endtime a-d player-timer enabled"
												},
												text : '-0:00',
												set : {
													objname : "timeleft"
												}
											}
										}
									} 
								}
							}
						}
					}
				}
			}
		}
	}
}

/**
	Player Right Bar
*/
rightbar = {
	obj : {
		type : { 
			type : 'a',
			attr : {
				class : 'volume on'
			},
			set : {
				objname : "volume"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : 'spritePlayer'
						},
						elements : {
							obj : {
								type : { 
									type : 'div',
									attr : {
										class : 'volumeSeek'
									},
									set : {
										objname : "volumeSeek"
									},
									elements : {
										obj : {
											type : {
												type : 'span',
												attr : {
													class : 'volbar a_1'
												}
											},
											type2 : {
												type : 'span',
												attr : {
													class : 'volbar a_2'
												}
											},
											type3 : {
												type : 'span',
												attr : {
													class : 'volbar a_3'
												}
											},
											type4 : {
												type : 'span',
												attr : {
													class : 'volbar a_4'
												}
											},
											type5 : {
												type : 'span',
												attr : {
													class : 'volbar a_5'
												}
											},
											type6 : {
												type : 'span',
												attr : {
													class : 'volbar a_6'
												}
											},
											type7 : {
												type : 'span',
												attr : {
													class : 'volbar a_7'
												}
											},
											type8 : {
												type : 'span',
												attr : {
													class : 'volbar a_8'
												}
											},
											type9 : {
												type : 'span',
												attr : {
													class : 'volbar a_9'
												}
											},
											type10 : {
												type : 'span',
												attr : {
													class : 'volbar a_10'
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		},
		type2 : { 
			type : 'a',
			attr : {
				class : 'musicList link',
				rel : "playerList"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : 'spritePlayer'
						},
						set : {
							objname : "playlist"
						}
					}
				}
			}
		},
		type3 : { 
			type : 'a',
			attr : {
				class : 'suffle'
			},
			set : {
				objname : "shuffle"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : 'spritePlayer'
						}
					}
				}
			}
		},
		type4 : { 
			type : 'a',
			attr : {
				class : 'playLink'
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : 'spritePlayer'
						},
						set : {
							objname : "link"
						}
					}
				}
			}
		},
		type5 : { 
			type : 'a',
			attr : {
				class : 'add'
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : 'spritePlayer'
						},
						set : {
							objname : "add"
						}
					}
				}
			}
		}
	}
}


elements = {
	obj : {
		type : { 
			type : 'div',
			attr : {
				id : 'mainPlayer',
				'class' : ref.skin
			},
			set : {
				objname : "mainPlayer"
			},
			elements : {
				obj : {
					type : {
						type : 'div',
						attr : {
							class : 'playerWrap seprator'
						},
						elements : {
							obj : {
								type : { 
									type : 'div',
									attr : {
										class : "playersongimg"
									},
									elements : {
										obj : {
											type : {
												type : 'a',
												attr : {
													class : 'thumbHolder'
												},
												elements : {
													obj : {
														type : { 
															type : 'img',
															attr : {
																src : loadConfig.playlist[0].cover,
																width : 45,
																height : 45,
																alt : 'player thumb'
															},
															set : {
																objname : "coverimg"
															}
														}
													}
												}
											}
										}
									}
								},
								type2 : {
									type : 'div',
									attr : {
										class : "playersongcontrol seprator"
									},
									elements : playerbuttons
								},
								type3 : {
									type : 'div',
									attr : {
										class : "playercontrol"
									},
									elements : middlebar
								},
								type4 : {
									type : 'div',
									attr : {
										class : "player_control_right seprator-left"
									},
									elements : rightbar
								}
							}
						}
					},
					type2 : {
						type : 'div',
						attr : {
							class : "content",
							id : "playerList"
						},
						elements : {
							obj : {
								type : { 
									type : 'div',
									attr : {
										class : "owl-carousel",
										id : "playerListItem"
									},
									set : {
										objname : "playlistholder"
									}
								}
							}
						}
					},
					type3 : {
						type : 'a',
						attr : {
							'class' : "minmax minimize"
						},
						set : {
							objname : "minimize"
						},
						text : '<span class="spritePlayer"></span>'
					}
				}
			} 
		}
	}
}
}

configFile.prototype.horizontal = function(){ /* creating a html for horizontal player*/
var ref=this;
	rightbar = {
		obj : {
			type : { 
				type : 'a',
				attr : {
					class : 'volume on'
				},
				set : {
					objname : "volume"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							},
							elements : {
								obj : {
									type : { 
										type : 'div',
										attr : {
											class : 'volumeSeek'
										},
										set : {
											objname : "volumeSeek"
										},
										elements : {
											obj : {
												type : {
													type : 'span',
													attr : {
														class : 'volbar a_1'
													}
												},
												type2 : {
													type : 'span',
													attr : {
														class : 'volbar a_2'
													}
												},
												type3 : {
													type : 'span',
													attr : {
														class : 'volbar a_3'
													}
												},
												type4 : {
													type : 'span',
													attr : {
														class : 'volbar a_4'
													}
												},
												type5 : {
													type : 'span',
													attr : {
														class : 'volbar a_5'
													}
												},
												type6 : {
													type : 'span',
													attr : {
														class : 'volbar a_6'
													}
												},
												type7 : {
													type : 'span',
													attr : {
														class : 'volbar a_7'
													}
												},
												type8 : {
													type : 'span',
													attr : {
														class : 'volbar a_8'
													}
												},
												type9 : {
													type : 'span',
													attr : {
														class : 'volbar a_9'
													}
												},
												type10 : {
													type : 'span',
													attr : {
														class : 'volbar a_10'
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			type2 : { 
				type : 'a',
				attr : {
					class : 'musicList link',
					rel : "playerList"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							},
							set : {
								objname : "playlist"
							}
						}
					}
				}
			},
			type3 : { 
				type : 'a',
				attr : {
					class : 'suffle'
				},
				set : {
					objname : "shuffle"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							}
						}
					}
				}
			},
			type4 : { 
				type : 'a',
				attr : {
					class : 'playLink'
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							},
							set : {
								objname : "link"
							}
						}
					}
				}
			},
			type5 : { 
				type : 'a',
				attr : {
					class : 'add'
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							},
							set : {
								objname : "add"
							}
						}
					}
				}
			}
		}
	}

	playerbuttons = {
		obj : {
			type : {
				type : 'a',
				attr : {
					class : 'btnPlayer previous  colorbtn'
				},
				set : {
					objname : "previous"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : "spritePlayer"
							}
						}
					}
				}
			},
			type2 : {
				type : 'a',
				attr : {
					class : 'btnPlayer playPause play  colorbtn'
				},
				set : {
					objname : "play"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : "spritePlayer"
							}
						}
					}
				}
			},
			type3 : {
				type : 'a',
				attr : {
					class : 'btnPlayer next  colorbtn'
				},
				set : {
					objname : "next"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : "spritePlayer"
							}
						}
					}
				}
			}
		}
	}

	middlebar = {
		obj : {
			type : {
				type : 'div',
				attr : {
					id : "trackInfo",
					'class' : "white inline-block"
				},
				text : '<div class="song-title">'+loadConfig.playlist[0].title+'</div><span>Por<a href="#"> - '+loadConfig.playlist[0].artist+'</a> </span><a class="logo"><img src="images/logo.png" alt="" /></a>',
				set : {
					objname : "trackinfo"
				}
			},
			type2 : {
				type : 'div',
				attr : {
					'class' : "playerWrap seprator"
				},
				elements : {
					obj : {
						type : {
							type : 'div',
							attr : {
								'class' : 'playersongcontrol seprator'
							},
							elements : playerbuttons
						},
						type2 : {
							type : 'div',
							attr : {
								'class' : "playercontrol"
							},
							elements : {
								obj : {
									type : {
										type : 'div',
										attr : {
											'class' : 'player_controller'
										},
										elements : {
											obj : {
												type : {
													type : "div",
													attr : {
														'class' : 'song-title1'
													},
													elements : {
														obj : {
															type : {
																type : 'div',
																attr : {
																	class : "song_progress clearfix"
																},
																elements : {
																	obj : {
																		type : {
																			type : 'div',
																			attr : {
																				class : "time startime a-d player-timer"
																			},
																			text : '0:00',
																			set : {
																				objname : "currenttime"
																			}
																		},
																		type2 : {
																			type : 'div',
																			attr : {
																				class : "buffer"
																			},
																			set : {
																				objname : "progressbar"
																			},
																			elements : {
																				obj : {
																					type : {
																						type : 'div',
																						attr : {
																							class : 'slider-range-min',
																							style : 'width:0px'
																						},
																						set : {
																							objname : "slider"
																						},
																						elements : {
																							obj : {
																								type : {
																									type : 'a',
																									attr : {
																										class : 'timer-handle'
																									},
																									set : {
																										objname : "seekHead"
																									},
																								}
																							}
																						}
																					},
																					type2 : {
																						type : 'div',
																						attr : {
																							class : 'buffering-range-min',
																							style : 'width:0px'
																						},
																						set : {
																							objname : "buffer"
																						},
																					}
																				}
																			}
																		},
																		type3 : {
																			type : 'div',
																			attr : {
																				class : "total endtime a-d player-timer enabled"
																			},
																			text : '-0:00',
																			set : {
																				objname : "timeleft"
																			}
																		}
																	}
																} 
															}
														}
													}
												},
												type2 : {
													type : 'a',
													attr : {
														'class' : "linkbtn"
													},
													text : 'baixar'
												}
											}
										}
									}
								}
							}
						},
						type3 : {
							type : 'div',
							attr : {
								class : "player_control_right seprator-left"
							},
							elements : rightbar
						}
					}
				}
			}
		}
	},
	
	elements = {
		obj : {
			type : { 
				type : 'div',
				attr : {
					id : 'mainPlayer',
					'class' : "horizontal-view "+ref.skin,
				},
				set : {
					objname : "mainPlayer"
				},
				elements : {
					obj : {
						type : {
							type : 'div',
							attr : {
								'class' : 'vertical-info'
							},
							elements : {
								obj : {
									type : {
										type : 'div',
										attr : {
											'class' : 'playersongimg'
										},
										elements : {
											obj : {
												type : {
													type : 'a',
													attr : {
														class : 'thumbHolder'
													},
													set : {
														objname : 'thumbHolder'
													},
													elements : {
														obj : {
															type : { 
																type : 'img',
																attr : {
																	src : loadConfig.playlist[0].cover,
																	width : 142,
																	height : 142,
																	alt : 'player thumb'
																},
																set : {
																	objname : "coverimg"
																}
															}
														}
													}
												}
											}
										}
									},
									type2 : {
										type : 'div',
										attr : {
											class : "playdescription"
										},
										elements : middlebar
									}
								}
							}
						},
						type4 : {
							type : 'div',
							attr : {
								id : "playerList-vertical"
							},
							elements : {
								obj : {
									type : { 
										type : 'ul',
										set : {
											objname : "playlistholder"
										}
									}
								}
							}
						}
					}
				} 
			},
			type3 : {
				type : 'a',
				attr : {
					'class' : "minmax minimize"
				},
				set : {
					objname : "minimize"
				},
				text : '<span class="spritePlayer"></span>'
			}
		}
	}
}

configFile.prototype.vertical = function(){ /* creating a html for vertical player*/
var ref=this;
	var playerprogress = {
		obj : {
			type : {
				type : "div",
				attr : {
					'class' : 'song-title1'
				},
				elements : {
					obj : {
						type : {
							type : 'div',
							attr : {
								class : "song_progress clearfix"
							},
							elements : {
								obj : {
									type : {
										type : 'div',
										attr : {
											class : "time startime a-d player-timer"
										},
										text : '0:00',
										set : {
											objname : "currenttime"
										}
									},
									type2 : {
										type : 'div',
										attr : {
											class : "buffer"
										},
										set : {
											objname : "progressbar"
										},
										elements : {
											obj : {
												type : {
													type : 'div',
													attr : {
														class : 'slider-range-min',
														style : 'width:0px'
													},
													set : {
														objname : "slider"
													},
													elements : {
														obj : {
															type : {
																type : 'a',
																attr : {
																	class : 'timer-handle'
																},
																set : {
																	objname : "seekHead"
																},
															}
														}
													}
												},
												type2 : {
													type : 'div',
													attr : {
														class : 'buffering-range-min',
														style : 'width:0px'
													},
													set : {
														objname : "buffer"
													},
												}
											}
										}
									},
									type3 : {
										type : 'div',
										attr : {
											class : "total endtime a-d player-timer enabled"
										},
										text : '-0:00',
										set : {
											objname : "timeleft"
										}
									}
								}
							} 
						}
					}
				}
			}
		}
	}, 

	rightbar = {
		obj : {
			type : { 
				type : 'a',
				attr : {
					class : 'volume on'
				},
				set : {
					objname : "volume"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							},
							elements : {
								obj : {
									type : { 
										type : 'div',
										attr : {
											class : 'volumeSeek'
										},
										set : {
											objname : "volumeSeek"
										},
										elements : {
											obj : {
												type : {
													type : 'span',
													attr : {
														class : 'volbar a_1'
													}
												},
												type2 : {
													type : 'span',
													attr : {
														class : 'volbar a_2'
													}
												},
												type3 : {
													type : 'span',
													attr : {
														class : 'volbar a_3'
													}
												},
												type4 : {
													type : 'span',
													attr : {
														class : 'volbar a_4'
													}
												},
												type5 : {
													type : 'span',
													attr : {
														class : 'volbar a_5'
													}
												},
												type6 : {
													type : 'span',
													attr : {
														class : 'volbar a_6'
													}
												},
												type7 : {
													type : 'span',
													attr : {
														class : 'volbar a_7'
													}
												},
												type8 : {
													type : 'span',
													attr : {
														class : 'volbar a_8'
													}
												},
												type9 : {
													type : 'span',
													attr : {
														class : 'volbar a_9'
													}
												},
												type10 : {
													type : 'span',
													attr : {
														class : 'volbar a_10'
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			type2 : { 
				type : 'a',
				attr : {
					class : 'musicList link',
					rel : "playerList"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							},
							set : {
								objname : "playlist"
							}
						}
					}
				}
			},
			type3 : { 
				type : 'a',
				attr : {
					class : 'suffle'
				},
				set : {
					objname : "shuffle"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							}
						}
					}
				}
			},
			type4 : { 
				type : 'a',
				attr : {
					class : 'playLink'
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							},
							set : {
								objname : "link"
							}
						}
					}
				}
			},
			type5 : { 
				type : 'a',
				attr : {
					class : 'add'
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : 'spritePlayer'
							},
							set : {
								objname : "add"
							}
						}
					}
				}
			}
		}
	}

	playerbuttons = {
		obj : {
			type : {
				type : 'a',
				attr : {
					class : 'btnPlayer previous  colorbtn'
				},
				set : {
					objname : "previous"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : "spritePlayer"
							}
						}
					}
				}
			},
			type2 : {
				type : 'a',
				attr : {
					class : 'btnPlayer playPause play  colorbtn'
				},
				set : {
					objname : "play"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : "spritePlayer"
							}
						}
					}
				}
			},
			type3 : {
				type : 'a',
				attr : {
					class : 'btnPlayer next  colorbtn'
				},
				set : {
					objname : "next"
				},
				elements : {
					obj : {
						type : { 
							type : 'span',
							attr : {
								class : "spritePlayer"
							}
						}
					}
				}
			}
		}
	}

	middlebar = {
		obj : {
			type : {
				type : 'div',
				attr : {
					id : "trackInfo",
					'class' : "white inline-block"
				},
				text : '<div class="song-title">'+loadConfig.playlist[0].title+'</div><span>Por<a href="#"> - '+loadConfig.playlist[0].artist+'</a> </span>',
				set : {
					objname : "trackinfo"
				}
			},
			type2 : {
				type : 'a',
				attr : {
					'class' : "linkbtn"
				},
				text : 'baixar'
			}
		}
	},
	
	elements = {
		obj : {
			type : { 
				type : 'div',
				attr : {
					id : 'mainPlayer',
					'class' : "vertical-view "+ref.skin
				},
				set : {
					objname : "mainPlayer"
				},
				elements : {
					obj : {
						type : {
							type : 'div',
							attr : {
								'class' : 'vertical-info'
							},
							elements : {
								obj : {
									type : {
										type : 'div',
										attr : {
											'class' : 'playersongimg'
										},
										elements : {
											obj : {
												type : {
													type : 'a',
													attr : {
														class : 'thumbHolder'
													},
													set : {
														objname : 'thumbHolder'
													},
													elements : {
														obj : {
															type : { 
																type : 'img',
																attr : {
																	src : loadConfig.playlist[0].cover,
																	width : 102,
																	height : 102,
																	alt : 'player thumb'
																},
																set : {
																	objname : "coverimg"
																}
															}
														}
													}
												}
											}
										}
									},
									type2 : {
										type : 'div',
										attr : {
											'class' : "playdescription"
										},
										elements : middlebar
									}
								}
							}
						},
						type2 : {
							type : 'div',
							attr : {
								'class' : "playerWrap seprator"
							},
							elements : {
								obj : {
									type : {
										type : 'div',
										attr : {
											'class' : 'playersongcontrol seprator'
										},
										elements : playerbuttons
									},
									type2 : {
										type : 'div',
										attr : {
											'class' : 'playercontrol'
										},
										elements : {
											obj : {
												type : {
													type : 'div',
													attr : {
														'class' : 'player_controller'
													},
													elements : playerprogress
												}
											}
										}
									},
									type3 : {
										type : 'div',
										attr : {
											'class' : 'player_control_right seprator-left'
										},
										elements : rightbar
									}
								}
							}
						},
						type3 : {
							type : 'a',
							attr : {
								'class' : "minmax minimize"
							},
							set : {
								objname : "minimize"
							},
							text : '<span class="spritePlayer"></span>'
						},
						type4 : {
							type : 'div',
							attr : {
								id : "playerList-vertical"
							},
							elements : {
								obj : {
									type : { 
										type : 'ul',
										set : {
											objname : "playlistholder"
										}
									}
								}
							}
						}
					}
				} 
			}
		}
	}
};

configFile.prototype.topbar = function(){/* creating a html for topbar player*/
var ref=this;	
playerbuttons = {
	obj : {
		type : {
			type : 'a',
			attr : {
				class : 'btnPlayer previous  colorbtn'
			},
			set : {
				objname : "previous"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : "spritePlayer"
						}
					}
				}
			}
		},
		type2 : {
			type : 'a',
			attr : {
				class : 'btnPlayer playPause play  colorbtn'
			},
			set : {
				objname : "play"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : "spritePlayer"
						}
					}
				}
			}
		},
		type3 : {
			type : 'a',
			attr : {
				class : 'btnPlayer next  colorbtn'
			},
			set : {
				objname : "next"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : "spritePlayer"
						}
					}
				}
			}
		}
	}
}
/**
	Player Middle Bar 
*/

middlebar = {
	obj : {
		type : {
			type : 'div',
			attr : {
				class : 'player_controller'
			},
			elements : {
				obj : {
					type : { 
						type : 'div',
						attr : {
							class : "song-title1"
						},
						elements : {
							obj : {
								type : {
									type : 'div',
									attr : {
										id : "trackInfo",
										class : "white inline-block"
									},
									text : loadConfig.playlist[0].title+' <span><a href="#"> - '+loadConfig.playlist[0].artist+'</a> </span>',
									set : {
										objname : "trackinfo"
									}
								},
								type2 : {
									type : 'div',
									attr : {
										class : "song_progress clearfix"
									},
									elements : {
										obj : {
											type : {
												type : 'div',
												attr : {
													class : "time startime a-d player-timer"
												},
												text : '0:00',
												set : {
													objname : "currenttime"
												}
											},
											type2 : {
												type : 'div',
												attr : {
													class : "buffer"
												},
												set : {
													objname : "progressbar"
												},
												elements : {
													obj : {
														type : {
															type : 'div',
															attr : {
																class : 'slider-range-min',
																style : 'width:0px'
															},
															set : {
																objname : "slider"
															},
															elements : {
																obj : {
																	type : {
																		type : 'a',
																		attr : {
																			class : 'timer-handle'
																		},
																		set : {
																			objname : "seekHead"
																		},
																	}
																}
															}
														},
														type2 : {
															type : 'div',
															attr : {
																class : 'buffering-range-min',
																style : 'width:0px'
															},
															set : {
																objname : "buffer"
															},
														}
													}
												}
											},
											type3 : {
												type : 'div',
												attr : {
													class : "total endtime a-d player-timer enabled"
												},
												text : '-0:00',
												set : {
													objname : "timeleft"
												}
											}
										}
									} 
								}
							}
						}
					},
					type2 : {
						type : 'a',
						attr : {
							'class' : "linkbtn"
						},
						text : 'baixar'
					}
				}
			}
		}
	}
}

/**
	Player Right Bar
*/
rightbar = {
	obj : {
		type : { 
			type : 'a',
			attr : {
				'class' : 'volume on'
			},
			set : {
				objname : "volume"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							'class' : 'spritePlayer'
						},
						elements : {
							obj : {
								type : { 
									type : 'div',
									attr : {
										'class' : 'volumeSeek'
									},
									set : {
										objname : "volumeSeek"
									},
									elements : {
										obj : {
											type : {
												type : 'span',
												attr : {
													'class' : 'volbar a_1'
												}
											},
											type2 : {
												type : 'span',
												attr : {
													'class' : 'volbar a_2'
												}
											},
											type3 : {
												type : 'span',
												attr : {
													'class' : 'volbar a_3'
												}
											},
											type4 : {
												type : 'span',
												attr : {
													'class' : 'volbar a_4'
												}
											},
											type5 : {
												type : 'span',
												attr : {
													'class' : 'volbar a_5'
												}
											},
											type6 : {
												type : 'span',
												attr : {
													'class' : 'volbar a_6'
												}
											},
											type7 : {
												type : 'span',
												attr : {
													'class' : 'volbar a_7'
												}
											},
											type8 : {
												type : 'span',
												attr : {
													'class' : 'volbar a_8'
												}
											},
											type9 : {
												type : 'span',
												attr : {
													'class' : 'volbar a_9'
												}
											},
											type10 : {
												type : 'span',
												attr : {
													'class' : 'volbar a_10'
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		},
		type2 : { 
			type : 'a',
			attr : {
				class : 'musicList link',
				rel : "playerList"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : 'spritePlayer'
						},
						set : {
							objname : "playlist"
						}
					}
				}
			}
		},
		type3 : { 
			type : 'a',
			attr : {
				class : 'suffle'
			},
			set : {
				objname : "shuffle"
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : 'spritePlayer'
						}
					}
				}
			}
		},
		type4 : { 
			type : 'a',
			attr : {
				class : 'playLink'
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : 'spritePlayer'
						},
						set : {
							objname : "link"
						}
					}
				}
			}
		},
		type5 : { 
			type : 'a',
			attr : {
				class : 'add'
			},
			elements : {
				obj : {
					type : { 
						type : 'span',
						attr : {
							class : 'spritePlayer'
						},
						set : {
							objname : "add"
						}
					}
				}
			}
		},
		type6 : { 
			type : 'a',
			attr : {
				class : 'logo'
			},
			elements : {
				obj : {
					type : { 
						type : 'img',
						attr : {
							src : 'images/logo.png',
							alt : ''
						}
					}
				}
			}
		}
	}
}


elements = {
	obj : {
		type : { 
			type : 'div',
			attr : {
				id : 'mainPlayer',
				'class' : 'topbar-view '+ref.skin 
			},
			set : {
				objname : "mainPlayer"
			},
			elements : {
				obj : {
					type : {
						type : 'div',
						attr : {
							class : 'playerWrap seprator'
						},
						elements : {
							obj : {
								type : { 
									type : 'div',
									attr : {
										class : "playersongimg"
									},
									elements : {
										obj : {
											type : {
												type : 'a',
												attr : {
													class : 'thumbHolder'
												},
												elements : {
													obj : {
														type : { 
															type : 'img',
															attr : {
																src : loadConfig.playlist[0].cover,
																width : 45,
																height : 45,
																alt : 'player thumb'
															},
															set : {
																objname : "coverimg"
															}
														}
													}
												}
											}
										}
									}
								},
								type2 : {
									type : 'div',
									attr : {
										class : "playersongcontrol seprator"
									},
									elements : playerbuttons
								},
								type3 : {
									type : 'div',
									attr : {
										class : "playercontrol"
									},
									elements : middlebar
								},
								type4 : {
									type : 'div',
									attr : {
										class : "player_control_right seprator-left"
									},
									elements : rightbar
								}
							}
						}
					},
					type2 : {
						type : 'div',
						attr : {
							class : "content",
							id : "playerList"
						},
						elements : {
							obj : {
								type : { 
									type : 'div',
									attr : {
										class : "owl-carousel",
										id : "playerListItem"
									},
									set : {
										objname : "playlistholder"
									}
								}
							}
						}
					},
					type3 : {
						type : 'a',
						attr : {
							'class' : "minmax minimize",
							'style' : 'display:none'
						},
						set : {
							objname : "minimize"
						},
						text : '<span class="spritePlayer"></span>'
					}
				}
			} 
		}
	}
}
}
configFile.prototype.PlayerPopup = function(){ /* creating a html for popup*/
vertical_view = {
	obj : {
		type : { 
			type : 'div',
			attr : {
				class:"player-spacer-vertical clearfix"
			},
			elements : {
				obj : {
					type : { 
						type : 'div',
						attr : {
							class:"player-left-section"
						},						
						set : {
							objname : "verticalView"
						},
						elements:{
							obj : {
								type : { 
									type : 'div',
									attr : {
										class:  "vertical-view",
										id   :  "mainPlayer"
									},
									elements : {
										obj : {
											type : { 
												type : 'div',
												attr : {
													class:"vertical-info"
												},
												elements : {
													obj : {
														type : { 
															type : 'div',
															attr : {
																class:"playersongimg"
															},
															elements : {
																obj : {
																	type : { 
																		type : 'a',
																		attr : {
																			class:"thumbHolder"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'img',
																					attr : {
																						width  : "102",
																						height : "102", 
																						alt    : "player thumb",
																						src    : "images/playersongimg.jpg"
																					},
																					
																				}
																			}
																		}												
																	}
																}
															}									
														},
														type2 : { 
															type : 'div',
															attr : {
																class:"playdescription"
															},
															elements : {
																obj : {
																	type : { 
																		type : 'div',
																		attr : {
																			id    :  "trackInfo", 
																			class :  "white inline-block"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'div',
																					attr : {
																						class :"song-title"
																					},
																					text :'01 Avioes do Forro ao vivo no Forro no Sitio 12 anos de Avioes 11 10 14 www.JonathaCds.com',															
																				},
																				type2 : { 
																					type : 'span',
																					attr : {
																						id    :  "trackInfo", 
																						class :  "white inline-block"
																					},
																					text : 'Por',
																					elements : {
																						obj : {
																							type : { 
																								type : 'a',															
																								text :'— Aviões Oficial',															
																							}
																						}
																					}												
																				}
																			}
																		}												
																	},
																	type2 : { 
																		type : 'a',
																		attr : {
																			class :  "linkbtn"
																		},
																		text : 'baixar',												
																	}											
																}
															}									
														}
													}
												}
											},
											type2 : { 
												type : 'div',
												attr : {
													class :  "playerWrap seprator",
												},
												elements : {
													obj : {
														type : { 
															type : 'div',
															attr : {
																class :"playersongcontrol seprator"
															},
															elements : {
																obj : {
																	type : { 
																		type : 'a',
																		attr : {
																			class :"btnPlayer previous  colorbtn"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'span',
																					attr : {
																						class :"spritePlayer"
																					},
																				}								
																			}
																		}		
																	},
																	type2 : { 
																		type : 'a',
																		attr : {
																			class :"btnPlayer playPause play  colorbtn"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'span',
																					attr : {
																						class :"spritePlayer"
																					},
																				}								
																			}
																		}		
																	},
																	type3 : { 
																		type : 'a',
																		attr : {
																			class :"btnPlayer next  colorbtn"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'span',
																					attr : {
																						class :"spritePlayer"
																					},
																				}								
																			}
																		}		
																	}
																}
															}		
														},
														type2 :{ 
															type : 'div',
															attr : {
																class :"playercontrol"
															},
															elements : {
																obj : {
																	type : { 
																		type : 'div',
																		attr : {
																			class :"player_controller"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'div',
																					attr : {
																						class :"song-title1"
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'div',
																								attr : {
																									class :"song_progress clearfix"
																								},
																								elements : {
																									obj : {
																										type : { 
																											type : 'div',
																											attr : {
																												class :"time startime a-d player-timer"
																											},
																											text : '0:33'
																										},
																										type2 : { 
																											type : 'div',
																											attr : {
																												class :"buffer"
																											},
																											elements : {
																												obj : {
																													type : { 
																														type : 'div',
																														attr : {
																															class : "slider-range-min",
																															style : "width:45%",
																														},
																														elements : {
																															obj : {
																																type : { 
																																	type : 'a',
																																	attr : {
																																		class :"timer-handle"
																																	},
																																}								
																															}
																														}
																													},
																													type2 : { 
																														type : 'div',
																														attr : {
																															class : "buffering-range-min",
																															style : "width:52%",
																														},
																													}
																												}
																											}
																										},
																										type3 : { 
																											type : 'div',
																											attr : {
																												class :"total endtime a-d player-timer enabled"
																											},
																											text : '-1:54'
																										}
																									}
																								}
																							}								
																						}
																					}	
																				}								
																			}
																		}	
																	}								
																}
															}		
														},
														type3 : { 
															type : 'div',
															attr : {
																class :"player_control_right seprator-left"
															},
															elements : {
																obj : {
																	type : { 
																		type : 'a',
																		attr : {
																			class :"volume mute"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'span',
																					attr : {
																						class :"spritePlayer"
																					},
																				}								
																			}
																		}		
																	},
																	type2 : { 
																		type : 'a',
																		attr : {
																			class : "musicList link",
																			rel   : "playerList"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'span',
																					attr : {
																						class :"spritePlayer"
																					},
																				}								
																			}
																		}		
																	},
																	type3 : { 
																		type : 'a',
																		attr : {
																			class :"suffle off"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'span',
																					attr : {
																						class :"spritePlayer"
																					},
																				}								
																			}
																		}		
																	},
																	type4 : { 
																		type : 'a',
																		attr : {
																			class :"playLink"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'span',
																					attr : {
																						class :"spritePlayer"
																					},
																				}								
																			}
																		}		
																	},
																	type5 : { 
																		type : 'a',
																		attr : {
																			class :"add"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'span',
																					attr : {
																						class :"spritePlayer"
																					},
																				}								
																			}
																		}		
																	}
																}
															}		
														}
													}
												}												
											},
											type3 : { 
												type : 'div',
												attr : {
													id :"playerList-vertical"
												},
												elements : {
													obj : {
														type : { 
															type : 'ul',
															elements : {
																obj : {
																	type : { 
																		type : 'li',
																		attr : {
																			class :"video-list selected"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'a',
																					text  :'Avioes do Forro ao vivo no... ',
																				}
																			}
																		}
																	},
																	type2 : { 
																		type : 'li',
																		attr : {
																			class:"audio-list",
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'a',
																					text  :'Avioes do Forro ao vivo no... ',
																				}
																			}
																		}
																	},
																	type3 : { 
																		type : 'li',
																		attr : {
																			class:"video-list"													
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'a',
																					text  :'Avioes do Forro ao vivo no... ',
																				}
																			}
																		}
																	},
																	type4 : { 
																		type : 'li',
																		attr : {
																			class:"audio-list selected"													
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'a',
																					text  :'Avioes do Forro ao vivo no... ',
																				}
																			}
																		}
																	}
																}
															}
														},														
													}
												}		
											},
										}
									}
								}
							}
						}
					},
					type2 : { 
						type : 'div',
						attr : {
							class:"player-right-section player-description-section"
						},
						elements:{
							obj : {
								type : { 
									type : 'label',
									text : 'Embed Code:',
																	
								},
								type2 : { 
									type : 'div',
									attr : {
										class :"embed"
									},
									elements : {
										obj : {
											type : { 
												type : 'input',
												attr : {
													type :"text",
													name : "VerticalIframe",
												},
												set : {
													objname: "verticaliframe"
												}
											},
											type2 : { 
												type : 'input',
												attr : {
													type : "submit",
													value : "COPIAR"
												},
												set : {
													objname :"VerticalCopiar"
												}
											}	
										}
									}
								},
								type3 : { 
									type : 'label',
									text : 'Color Scheme:',
																	
								},
								type4 : { 
									type : 'div',
									attr : {
										class :"color-section clearfix"
									},
									elements : {
										obj : {
											type : { 
												type : 'select',
												attr : {
													class :"set-color"
												},
												set : {
													objname : 'vcs'
												},
												elements : {
													obj : {
														type : { 
															type : 'option',
															attr : {
																value :"dark"
															},
															text : 'DARK'
														},
														type2 : { 
															type : 'option',
															attr : {
																value :"light"
															},
															text : 'LIGHT'
														}
													}
												}
											}								
										}
									}
								},
								type5 : { 
									type : 'div',
									attr : {
										class :"clearfix"
									},
									elements : {
										obj : {
											type : { 
												type : 'label',
												text : 'Tamanho:',
																				
											},
											type2 : { 
												type : 'div',
												attr : {
													class :"dimention"
												},
												elements : {
													obj : {
														type : { 
															type : 'input',
															attr : {
																type      : "text",
																maxlength : "7",
																name      : "verticalwidth",
																value     : "352"
															},
															set : {
																objname : "vw"
															}
														},
														type2 : { 
															type : 'span',
															text : 'x'
														},
														type3 : { 
															type : 'input',
															attr : {
																type      : "text",
																maxlength : "7",
																name      : "verticalheight",
																value     : "378"
															},
															set : {
																objname : "vh"
															}
														}
													}
												}
											}
										}
									}
								},
								type6 : { 
									type : 'div',
									attr : {
										class : "select-auto",
									},
									elements : {
										obj : {
											type : { 
												type : 'input',
												attr : {
													type   : "checkbox", 
													id     : "squaredFour1", 
												},
												set : {
													objname : "va"
												}
											},
											type2 : { 
												type : 'label',
												attr : {
													'for' : "squaredFour1",
												},
												text : 'Autoplay:',
																				
											}
										}
									}
								},
								type7 : { 
									type : 'div',
									attr : {
										class : "socials",
									},
									elements : {
										obj : {
											type : { 
												type : 'a',
												set : {
													objname : "vfb"
												},
												elements : {
													obj : {
														type : { 
															type : 'img',
															attr : {
																src : "images/facebook.png",
																alt : ""
															},
														}								
													}
												}
											},
											type2 : { 
												type : 'a',
												set : {
													objname : "vtw"
												},
												elements : {
													obj : {
														type : { 
															type : 'img',
															attr : {
																src : "images/twitter.png",
																alt : ""
															},
														}								
													}
												}
											},
											type3 : { 
												type : 'a',
												set : {
													objname : "vgp"
												},
												elements : {
													obj : {
														type : { 
															type : 'img',
															attr : {
																src : "images/google-plus.png",
																alt : ""
															},
														}								
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
horizontal_view={
	obj : {
		type : { 
			type : 'div',
			attr : {
				class : 'player-spacer'
			},						
			set : {
				objname : "horizontalView"
			},
			elements : {
				obj : {
					type : { 
						type : 'div',
						attr : {
							id     : "mainPlayer" ,
							class  : "horizontal-view"
						},
						elements : {
							obj : {
								type : { 
									type : 'div',
									attr : {
										class:"vertical-info"
									},
									elements : {
										obj : {
											type : { 
												type : 'div',
												attr : {
													class:"playersongimg"
												},
												elements : {
													obj : {
														type : { 
															type : 'a',
															attr : {
																class:"thumbHolder"
															},
															elements : {
																obj : {
																	type : { 
																		type : 'img',
																		attr : {
																			src    :"images/playersongimg2.jpg",
																			width  :"142",
																			height :"142" ,
																			alt    :"player thumb"
																		},
																	}								
																}
															}
														}								
													}
												}
											},
											type2 : { 
												type : 'div',
												attr : {
													class:"playdescription"
												},
												elements : {
													obj : {
														type : { 
															type : 'div',
															attr : {
																id:"trackInfo", 
																class:"white inline-block"
															},
															elements : {
																obj : {
																	type : { 
																		type : 'div',
																		attr : {
																			class    :"song-title",
																		},
																		text:'01 Avioes do Forro ao vivo no Forro no Sitio 12 anos de Avioes 11 10 14 www.JonathaCds.com ',																		
																	},
																	type2 : { 
																		type : 'span',
																		text : 'Por',
																		elements : {
																			obj : {
																				type : { 
																					type : 'a',
																					text: '— Aviões Oficial'
																				}								
																			}
																		}
																	},
																	type3 : { 
																		type : 'a',
																		attr : {
																			class    :"logo",
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'img',
																					attr : {
																						src : "images/logo.png",
																						alt : ""
																					},
																				}								
																			}
																		}
																	}
																}
															}
														},
														type2 : { 
															type : 'div',
															attr : {
																class : "playerWrap seprator",
															},
															elements : {
																obj : {
																	type : { 
																		type : 'div',
																		attr : {
																			class :"playersongcontrol seprator"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'a',
																					attr : {
																						class    :"btnPlayer previous  colorbtn",
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'span',
																								attr : {
																									class : "spritePlayer",
																								},
																							}								
																						}
																					}
																				},
																				type2 : { 
																					type : 'a',
																					attr : {
																						class    :"btnPlayer playPause play   colorbtn",
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'span',
																								attr : {
																									class : "spritePlayer",
																								},
																							}								
																						}
																					}
																				},
																				type3 : { 
																					type : 'a',
																					attr : {
																						class    :"btnPlayer next  colorbtn",
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'span',
																								attr : {
																									class : "spritePlayer",
																								},
																							}								
																						}
																					}
																				}
																			}
																		}
																	},
																	type2 : { 
																		type : 'div',
																		attr : {
																			class : "playercontrol",
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'div',
																					attr : {
																						class :"player_controller"
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'div',
																								attr : {
																									class :"song-title1"
																								},
																								elements : {
																									obj : {
																										type : { 
																											type : 'div',
																											attr : {
																												class :"song_progress clearfix"
																											},
																											elements : {
																												obj : {
																													type : { 
																														type : 'div',
																														attr : {
																															class :"time startime a-d player-timer"
																														},
																														text :'0:33'
																													},
																													type2 : { 
																														type : 'div',
																														attr : {
																															class :"buffer"
																														},
																														elements : {
																															obj : {
																																type : { 
																																	type : 'div',
																																	attr : {
																																		class :"slider-range-min",
																																		style :"width:45%"
																																	},
																																	elements : {
																																		obj : {
																																			type : { 
																																				type : 'a',
																																				attr : {
																																					class :"timer-handle"
																																				},
																																			}								
																																		}
																																	}
																																},
																																type2 : { 
																																	type : 'div',
																																	attr : {
																																		class :"buffering-range-min",
																																		style :"width:52%"
																																	},
																																}
																															}
																														}
																													},
																													type3 : { 
																														type : 'div',
																														attr : {
																															class :"total endtime a-d player-timer enabled"
																														},
																														text :'-1:54'
																													}	
																												}
																											}
																										}								
																									}
																								}
																							},
																							type2 : { 
																								type : 'a',
																								attr : {
																									class :"linkbtn"
																								},
																								text : 'baixar'
																							}	
																						}
																					}
																				}								
																			}
																		}
																	},
																	type3 : { 
																		type : 'div',
																		attr : {
																			class :"player_control_right seprator-left"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'a',
																					attr : {
																						class :"volume mute"
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'span',
																								attr : {
																									class :"spritePlayer"
																								},
																							}								
																						}
																					}		
																				},
																				type2 : { 
																					type : 'a',
																					attr : {
																						class : "musicList link",
																						rel   : "playerList"
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'span',
																								attr : {
																									class :"spritePlayer"
																								},
																							}								
																						}
																					}		
																				},
																				type3 : { 
																					type : 'a',
																					attr : {
																						class :"suffle off"
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'span',
																								attr : {
																									class :"spritePlayer"
																								},
																							}								
																						}
																					}		
																				},
																				type4 : { 
																					type : 'a',
																					attr : {
																						class :"playLink"
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'span',
																								attr : {
																									class :"spritePlayer"
																								},
																							}								
																						}
																					}		
																				},
																				type5 : { 
																					type : 'a',
																					attr : {
																						class :"add"
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'span',
																								attr : {
																									class :"spritePlayer"
																								},
																							}								
																						}
																					}		
																				}
																			}
																		}		
																	}
																}
															}
														}														
													}
												}
											}
										}
									}
								}								
							}
						}
					},
					type2 : {
						type : 'div',
						attr : {
							class : 'player-description-section'
						},
						elements : {
							obj : {
								type : { 
									type : 'label',
									text  :'Embed Code:',
								},
								type2 : { 
									type : 'div',
									attr : {
										class :"embed"
									},
									elements : {
										obj : {
											type : { 
												type : 'input',
												attr : {
													type :"text",
													name : "HorizontalIframe"
												},
												set : {
													objname :"horizontaliframe"
												}
											},
											type2 : { 
												type : 'input',
												attr : {
													type : "submit",
													value : "COPIAR"
												},
												set : {
													objname :"HorizontalCopiar"
												}
											}	
										}
									}
								},
								type3 : { 
									type : 'div',
									attr : {
										class :"color-section"
									},
									elements : {
										obj : {
											type : { 
												type : 'label',
												text : 'Color Scheme:',
																				
											},
											type1 : { 
												type : 'select',
												attr : {
													class :"set-color"
												},
												set : {
													objname : 'hcs'
												},
												elements : {
													obj : {
														type : { 
															type : 'option',
															attr : {
																value :"dark"
															},
															text : 'DARK'
														},
														type2 : { 
															type : 'option',
															attr : {
																value :"light"
															},
															text : 'LIGHT'
														}
													}
												}
											}								
										}
									}
								},
								type4 : { 
									type : 'div',
									attr : {
										class :"section2"
									},
									elements : {
										obj : {
											type : { 
												type : 'div',
												attr : {
													class :"clearfix"
												},
												elements : {
													obj : {
														type : { 
															type : 'label',
															text : 'Tamanho:',
																							
														},
														type2 : { 
															type : 'div',
															attr : {
																class :"dimention"
															},
															elements : {
																obj : {
																	type : { 
																		type : 'input',
																		attr : {
																			type      : "text",
																			maxlength : "7",
																			value     : "700"
																			},
																			set : {
																				objname : "hw"
																			}
																	},
																	type2 : { 
																		type : 'span',
																		text : 'x'
																	},
																	type3 : { 
																		type : 'input',
																		attr : {
																			type      : "text",
																			maxlength : "7",
																			value     : "366"
																		},
																		set : {
																			objname : "hh"
																		}
																	}
																}
															}
														},
														type3 : { 
															type : 'div',
															attr : {
																class : "socials",
															},
															elements : {
																obj : {
																	type : { 
																		type : 'a',
																		elements : {
																			obj : {
																				type : { 
																					type : 'img',
																					set : {
																						objname : "hfb"
																					},
																					attr : {
																						src : "images/facebook.png",
																						alt : ""
																					},
																				}								
																			}
																		}
																	},
																	type2 : { 
																		type : 'a',
																		elements : {
																			obj : {
																				type : { 
																					type : 'img',
																					set : {
																						objname : "htw"
																					},
																					attr : {
																						src : "images/twitter.png",
																						alt : ""
																					},
																				}								
																			}
																		}
																	},
																	type3 : { 
																		type : 'a',
																		elements : {
																			obj : {
																				type : { 
																					type : 'img',
																					set : {
																						objname : "hgp"
																					},
																					attr : {
																						src : "images/google-plus.png",
																						alt : ""
																					},
																				}								
																			}
																		}
																	}
																}
															}
														}
													}
												}
											},
											type2 : { 
												type : 'div',
												attr : {
													'class' : "select-auto",
												},
												elements : {
													obj : {
														type : { 
															type : 'input',
															attr : {
																type   : "checkbox", 
																id     : "squaredFour2",
															},
															set : {
																objname : "ha"
															}															
														},
														type2 : { 
															type : 'label',
															attr : {
																'for' : "squaredFour2",
															},
															text : 'Autoplay:',
																							
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}	
				}
			}
		}
	}
}
topbar_view={
	obj : {
		type : { 
			type : 'div',
			attr : {
				class :"topbar-view",
				id    :"mainPlayer"
			},
			elements : {
				obj : {
					type : { 
						type : 'div',
						attr : {
							class :"playerWrap seprator"
						},
						elements : {
							obj : {
								type : { 
									type : 'div',
									attr : {
										class:"playersongimg"
									},
									elements : {
										obj : {
											type : { 
												type : 'a',
												attr : {
													class:"thumbHolder"
												},
												elements : {
													obj : {
														type : { 
															type : 'img',
															attr : {
																width  : "45",
																height : "45", 
																alt    : "player thumb",
																src    : "images/playersongimg.jpg"
															},
															
														}
													}
												}												
											}
										}
									}									
								},
								type2 : {
														
									type : 'div',
									attr : {
										class :"playersongcontrol seprator"
									},
									elements : {
										obj : {
											type : { 
												type : 'a',
												attr : {
													class :"btnPlayer previous  colorbtn"
												},
												elements : {
													obj : {
														type : { 
															type : 'span',
															attr : {
																class :"spritePlayer"
															},
														}								
													}
												}		
											},
											type2 : { 
												type : 'a',
												attr : {
													class :"btnPlayer playPause play  colorbtn"
												},
												elements : {
													obj : {
														type : { 
															type : 'span',
															attr : {
																class :"spritePlayer"
															},
														}								
													}
												}		
											},
											type3 : { 
												type : 'a',
												attr : {
													class :"btnPlayer next  colorbtn"
												},
												elements : {
													obj : {
														type : { 
															type : 'span',
															attr : {
																class :"spritePlayer"
															},
														}								
													}
												}		
											}
										}
									}		
								},
								type3 : { 
									type : 'div',
									attr : {
										class : "playercontrol",
									},
									elements : {
										obj : {
											type : { 
												type : 'div',
												attr : {
													class :"player_controller"
												},
												elements : {
													obj : {
														type : { 
															type : 'div',
															attr : {
																class :"song-title1"
															},
															elements : {
																obj : {
																	type : { 
																		type : 'div',
																		attr : {
																			id:"trackInfo", 
																			class:"white inline-block"
																		},
																		text:'01 Avioes do Forro ao vivo no Forro no Sitio 12 anos de Avioes 11 10 14 www.JonathaCds.com',
																		elements : {
																			obj : {
																				type : { 
																					type : 'span',
																					elements : {
																						obj : {
																							type : { 
																								type : 'a',
																								text : '— Aviões Oficial'
																								
																							}
																						}
																					}
																				}
																			}
																		}
																	},
																	type2 : { 
																		type : 'div',
																		attr : {
																			class :"song_progress clearfix"
																		},
																		elements : {
																			obj : {
																				type : { 
																					type : 'div',
																					attr : {
																						class :"time startime a-d player-timer"
																					},
																					text :'0:33'
																				},
																				type2 : { 
																					type : 'div',
																					attr : {
																						class :"buffer"
																					},
																					elements : {
																						obj : {
																							type : { 
																								type : 'div',
																								attr : {
																									class :"slider-range-min",
																									style :"width:45%"
																								},
																								elements : {
																									obj : {
																										type : { 
																											type : 'a',
																											attr : {
																												class :"timer-handle"
																											},
																										}								
																									}
																								}
																							},
																							type2 : { 
																								type : 'div',
																								attr : {
																									class :"buffering-range-min",
																									style :"width:52%"
																								},
																							}
																						}
																					}
																				},
																				type3 : { 
																					type : 'div',
																					attr : {
																						class :"total endtime a-d player-timer enabled"
																					},
																					text :'-1:54'
																				}	
																			}
																		}
																	}								
																}
															}
														},
														type2 : { 
															type : 'a',
															attr : {
																class :"linkbtn"
															},
															text : 'baixar'
														}	
													}
												}
											}								
										}
									}
								},
								type4 : { 
									type : 'div',
									attr : {
										class :"player_control_right seprator-left"
									},
									elements : {
										obj : {
											type : { 
												type : 'a',
												attr : {
													class :"volume mute"
												},
												elements : {
													obj : {
														type : { 
															type : 'span',
															attr : {
																class :"spritePlayer"
															},
														}								
													}
												}		
											},
											type2 : { 
												type : 'a',
												attr : {
													class : "musicList link",
													rel   : "playerList"
												},
												elements : {
													obj : {
														type : { 
															type : 'span',
															attr : {
																class :"spritePlayer"
															},
														}								
													}
												}		
											},
											type3 : { 
												type : 'a',
												attr : {
													class :"suffle off"
												},
												elements : {
													obj : {
														type : { 
															type : 'span',
															attr : {
																class :"spritePlayer"
															},
														}								
													}
												}		
											},
											type4 : { 
												type : 'a',
												attr : {
													class :"playLink"
												},
												elements : {
													obj : {
														type : { 
															type : 'span',
															attr : {
																class :"spritePlayer"
															},
														}								
													}
												}		
											},
											type5 : { 
												type : 'a',
												attr : {
													class :"add"
												},
												elements : {
													obj : {
														type : { 
															type : 'span',
															attr : {
																class :"spritePlayer"
															},
														}								
													}
												}		
											},
											type5 : { 
												type : 'a',
												attr : {
													class :"logo"
												},
												elements : {
													obj : {
														type : { 
															type : 'img',
															attr : {
																rc  : "images/logo.png" ,
																alt : ""
															},
														}								
													}
												}		
											}
										}
									}		
								}
							}
						}
					}								
				}
			}
		},
		type2 : { 
			type : 'div',
			attr : {
				class :"player-spacer clearfix",
			},
			elements : {
				obj : {
					type : {
						type : 'div',
						attr : {
							class : 'player-description-section'
						},
						elements : {
							obj : {
								type : { 
									type : 'label',
									text  :'Embed Code:',
								},
								type2 : { 
									type : 'div',
									attr : {
										class :"embed"
									},
									elements : {
										obj : {
											type : { 
												type : 'input',
												attr : {
													type :"text",
													name: "TopbarIframe"
												},
												set : {
													objname :"topbariframe"
												}
											},
											type2 : { 
												type : 'input',
												attr : {
													type : "submit",
													value : "COPIAR"
												},
												set : {
													objname :"TopbarCopiar"
												}
											}	
										}
									}
								},
								type3 : { 
									type : 'div',
									attr : {
										class :"color-section"
									},
									elements : {
										obj : {
											type : { 
												type : 'label',
												text : 'Color Scheme:',
																				
											},
											type1 : { 
												type : 'select',
												attr : {
													class :"set-color"
												},
												set : {
													objname : 'tcs'
												},
												elements : {
													obj : {
														type : { 
															type : 'option',
															attr : {
																value :"dark"
															},
															text : 'DARK'
														},
														type2 : { 
															type : 'option',
															attr : {
																value :"light"
															},
															text : 'LIGHT'
														}
													}
												}
											}								
										}
									}
								},
								type4 : { 
									type : 'div',
									attr : {
										class :"section2"
									},
									elements : {
										obj : {											
											type : { 
												type : 'div',
												attr : {
													class : "select-auto",
												},
												elements : {
													obj : {
														type : { 
															type : 'input',
															attr : {
																type   : "checkbox", 
																id     : "autop", 
															},
															set : {
																objname : "ta"
															}		
														},
														type2 : { 
															type : 'label',
															attr : {
																'for' : "autop",
															},
															text : 'Autoplay:',
																							
														}
													}
												}
											}
										}
									}
								},
								type5 : { 
									type : 'div',
									attr : {
										class : "clearfix",
									},
									elements : {
										obj : {
											type : { 
												type : 'div',
												attr : {
													class : "socials",
												},
												elements : {
													obj : {
														type : { 
															type : 'a',
															elements : {
																obj : {
																	type : { 
																		type : 'img',
																		set : {
																			objname : "tfb"
																		},
																		attr : {
																			src : "images/facebook.png",
																			alt : ""
																		},
																	}								
																}
															}
														},
														type2 : { 
															type : 'a',
															elements : {
																obj : {
																	type : { 
																		type : 'img',
																		set : {
																			objname : "ttw"
																		},
																		attr : {
																			src : "images/twitter.png",
																			alt : ""
																		},
																	}								
																}
															}
														},
														type3 : { 
															type : 'a',
															elements : {
																obj : {
																	type : { 
																		type : 'img',
																		set : {
																			objname : "tgp"
																		},
																		attr : {
																			src : "images/google-plus.png",
																			alt : ""
																		},
																	}								
																}
															}
														}
													}
												}
											}								
										}
									}																	
								}
							}
						}
					}	
				}
			}
		}
	}
}
popup={
	obj:{
		type : {
			type : 'div',
			attr : {
				id : 'radioPopup'
			},
			set : {
				objname : 'radioPopup'
			},			
			elements : {
				obj : {
					type : { 
						type : 'div',
						attr : {
							class : "tabcontainer"
						},
						elements : {
							obj : {
								type : { 
									type : 'div',
									attr : {
										class : "PopupClose",
									},
									elements : {
										obj : {
											type : { 
												type : 'a',
												attr : {
													rel   : "",
													class : "PopupClose"
												},
												set : {
													objname : 'PopupClose'
												},
												elements : {
													obj : {
														type : { 
															type : 'img',
															attr : {
																src : "images/popupclose.png",
																alt : ""
															},
														}								
													}
												}
											}
										}
									}
								},
								type2 : { 
									type : 'ul',
									attr : {
										class : "tabheading"
									},
									elements : {
										obj : {
											type : { 
												type : 'li',
												attr : {
													rel : "vertical",
													class :"active"
												},
												elements : {
													obj : {
														type : { 
															type : 'a',
															text  :'VERTICAL',
															set : {
																objname : 'cv'
															}
														}
													}
												}
											},
											type2 : { 
												type : 'li',
												attr : {
													rel : "horizontal",
												},
												elements : {
													obj : {
														type : { 
															type : 'a',
															text  :'HORIZONTAL',
															set : {
																objname : 'ch'
															}
														}
													}
												}
											},
											type3 : { 
												type : 'li',
												attr : {
													rel : "topbar",													
												},
												elements : {
													obj : {
														type : { 
															type : 'a',
															text  :'TOPBAR',
															set : {
																objname : 'ct'
															}
														}
													}
												}
											}
										}
									}
								},
								type3 : { 
									type : 'div',
									attr : {
										class : "tabbody active",
										id    : "vertical",
										style : "display: block",
									},
									elements : vertical_view
								},
								type4 : { 
									type : 'div',
									attr : {
										class : "tabbody",
										id    : "horizontal",
										style : "display: none",
									},
									elements : horizontal_view
								},
								type5 : { 
									type : 'div',
									attr : {
										class : "tabbody",
										id    : "topbar",
										style : "display: none",
									},													
									set : {
										objname : "topbarView"
									},
									elements : topbar_view
								}
							}
						}
					}
				}
			}
		}	
	}
}
};
function playerLoader(container){
/*Define variables for playerLoader class*/
	this.play;
	this.previous;
	this.next;
	this.mainPlayer;
	this.audio;
	this.currenttime;
	this.timeleft;
	this.slider;
	this.buffer;
	this.progressbar;
	this.settime;
	this.volume;
	this.playlist;
	this.shuffleon  = false;
	this.shuffle;
	this.link;
	this.add;
	this.PopupClose;
	this.thumbHolder;
	this.volumeSeek;
	this.seekHead;
	this.oldVolume;
	this.trackinfo;
	this.minimize;
	this.coverimg;
	this.youtube;
	this.radioPopup;
	this.currentPlayer;
	this.usePlaylist = new Array();
	this.currentTrack = 0;
	this.playlistholder;
	this.playlistItems = new Array();
	this.moving = false;
	this.m = false;
	this.playercontainer = document.getElementById(container);
	
	this.cv;
	this.vw;
	this.vh;
	this.va;
	this.vfb;
	this.vtw;
	this.vgp;
	this.vcs;
	this.vap=0;
	this.VerticalCopiar;
	this.verticaliframe;
    this.verticalView;	
	
	this.ch;
	this.ha;
	this.hw;
	this.hh;
	this.hcs;
	this.hap=0;
	this.hfb;
	this.htw;
	this.hgp;
	this.HorizontalCopiar;
	this.horizontaliframe;
	this.horizontalView;
	
	this.ct;
	this.ta;
	this.tcs;
	this.tap=0;
	this.tfb;
	this.ttw;
	this.tgp;
	this.TopbarCopiar;
	this.topbariframe;
	this.topbarView;
	this.owl;

};
playerLoader.prototype.init = function(){/*Declare init function for playerLoader*/
	this.createElements(elements,this.playercontainer);/*call function createElements for playerLoader class*/
	if(player.playerType == 'mainplayer' || player.playerType == 'topbar'){
		this.youtube = this.mainPlayer;
	}
	if(player.playerType == 'vertical' || player.playerType == 'horizontal'){
		this.youtube = this.thumbHolder;
	}
	if(player.configfile!=undefined){
		this.startPl();
	}else{
		this.coverimg.src="http://www.iamstellen.pw/radio/images/playersongimg.jpg";
	}
	this.bindPlayer();
}
playerLoader.prototype.bindPlayer = function(){
	this.usePlaylist = Object.create(loadConfig.playlist);
	var ref = this;
	this.audio = new audioPlayer();
	this.play.onclick = function(e){
		e.preventDefault();
		ref.audio.playpause();
	};
	this.progressbar.onclick = function(e){
		var c = ref.pointerPosition(e);
		ref.settime = ref.findTime(c);
		ref.audio.updateTime();
	};
	this.minimize.onclick = function(){
		if(ref.m === false){
			ref.mainPlayer.setAttribute('class','minimize-view');
			this.setAttribute('class','minmax maximize');
			ref.m = true;
		}
		else if(ref.m === true){
			ref.mainPlayer.removeAttribute('class');
			this.setAttribute('class','minmax minimize');
			ref.m = false;
		}
	};
	if(typeof this.shuffle == 'object'){
		this.shuffle.onclick = function(e){
			var shuff = this;
			var holArr = Object.create(loadConfig.playlist);
			(function(o){
				var thisfil = ref.usePlaylist[ref.currentTrack].filename;
				if(!ref.shuffleon){
					ref.usePlaylist = ref.shuffleth(o);
					shuff.setAttribute('class','suffle on');
					ref.shuffleon = true;
				}
				else{
					ref.usePlaylist = o;
					ref.shuffleon = false;
					shuff.setAttribute('class','suffle');
				}
				for(var i=0; i < ref.usePlaylist.length; i++){
					if(thisfil == ref.usePlaylist[i].filename){
						ref.currentTrack = i;
					}
				}
			})(holArr);
		}; 
	}
	this.previous.onclick = function(e){
		clearInterval(intrval);
		if(playerLoad.audio.player.currentTime > 5){
			playerLoad.audio.player.currentTime = 0;
		}
		else{
			playerLoad.currentTrack = playerLoad.getPrev();
			playerLoad.playNext(playerLoad.usePlaylist[playerLoad.currentTrack]);
		}
	};
	this.next.onclick = function(e){
		clearInterval(intrval);
		playerLoad.currentTrack = playerLoad.getNext();
		playerLoad.playNext(playerLoad.usePlaylist[playerLoad.currentTrack]);
	};
	this.seekHead.onmousedown = function(e){
		ref.moving = true;
		this.onmousemove = function(ev){
			if(ref.moving == true){
				ref.slider.style.width = ref.pointerPosition(ev)+"px";
			}
		}
	};
	this.progressbar.onmousemove = function(e){
		if(ref.moving == true){
			ref.slider.style.width = ref.pointerPosition(e)+"px";
		}
	}
	this.progressbar.onmouseout = function(e){
		if(ref.moving){
			var c = ref.findParentNode('mainPlayer',e.target);
			if(!c){
				ref.moving = false;
				var c1 = ref.pointerPosition(e);
				ref.settime = ref.findTime(c1);
				ref.audio.updateTime();
			}
		}
	};
	this.mainPlayer.onmouseup = function(e){
		if(ref.moving){
			ref.moving = false;
			var c = ref.pointerPosition(e);
			ref.settime = ref.findTime(c);
			ref.audio.updateTime();
		}
	};
	for(i in this.volumeSeek.childNodes){
		if(typeof(this.volumeSeek.childNodes[i]) == 'object'){
			(function(i,e){
				e.onclick = function(){
					ref.audio.setVolume(parseInt(i)+1);
					ref.updateVolControl(parseInt(i));
				}
			})(i,this.volumeSeek.childNodes[i]);
		}
	}
	this.volume.onclick = function(e){
		if(e.target.getAttribute('class') == 'spritePlayer'){
			ref.audio.muteUnmute();
		}
	};
	this.volume.onmouseover = function(e){
		var vol = 10 - (ref.audio.player.volume*10);
		ref.updateVolControl(vol);
		ref.volumeSeek.style.display = "block";
	};
	this.volume.onmouseout = function(e){
		ref.volumeSeek.style.display = "none";
	};
	
	this.link.onclick = function(){
		loadConfig.PlayerPopup();
		var b = document.querySelector('body');
		ref.createElements(popup,b);		
		$('.tabheading li').click(function () {
			var tabid = $(this).attr("rel");
			$(this).parents('.tabcontainer').find('.active').removeClass('active');
			$('.tabbody').hide();
			$('#' + tabid).show();
			$(this).addClass('active');			
			return false;
		});
		ref.PopupClose.onclick = function(){
			ref.radioPopup.remove();
		};
		ref.verticalpopup();
		ref.cv.onclick = function(){
			ref.verticalpopup();
		}
		ref.ch.onclick = function(){
			ref.horizontalpopup();
		}
		ref.ct.onclick = function(){
			ref.topbarpopup();			
		}		
	};
	if(player.configfile != undefined){
		this.audio.addfile(ref.usePlaylist[0].filename);
	}
};
playerLoader.prototype.setInput = function(ele,val,w,h){
	ele.setAttribute('value','<iframe src="'+val+'" width="'+w+'" height="'+h+'" frameborder="0" allowfullscreen="0"></iframe>');
}
/* =======Start vertical popup functionality=======*/
playerLoader.prototype.verticalpopup = function(){
	ref=this;
	var vcs=ref.vcs.value;
		ref.setInput(ref.verticaliframe,loadConfig.shareUrl+"?pt=vertical&ap="+ref.vap+"&cs="+vcs,ref.vw.value,ref.vh.value);
	ref.vw.onchange=function(){
		ref.setInput(ref.verticaliframe,loadConfig.shareUrl+"?pt=vertical&ap="+ref.vap+"&cs="+vcs,ref.vw.value,ref.vh.value);
	};
	ref.vh.onchange=function(){
		ref.setInput(ref.verticaliframe,loadConfig.shareUrl+"?pt=vertical&ap="+ref.vap+"&cs="+vcs,ref.vw.value,ref.vh.value);
	};
	ref.vcs.onchange=function(){
		vcs=ref.vcs.value;
		ref.setInput(ref.verticaliframe,loadConfig.shareUrl+"?pt=vertical&ap="+ref.vap+"&cs="+vcs,ref.vw.value,ref.vh.value);
		if(vcs=='light'){
		    ref.verticalView.setAttribute('class','player-left-section light-theme');
		}else{
			ref.verticalView.setAttribute('class','player-left-section');
		}
	};
	ref.va.onchange=function(){
		var autoplay = ref.va.checked;
		if(autoplay==true){
			ref.vap=1;
		}else{
			ref.vap=0;
		}
		ref.setInput(ref.verticaliframe,loadConfig.shareUrl+"?pt=vertical&ap="+ref.vap+"&cs="+vcs,ref.vw.value,ref.vh.value);
	};
	ref.VerticalCopiar.onclick= function(){
		ref.verticaliframe.select();
	}
	ref.vtw.onclick=function(){
		alert('twitter');
	};
	ref.vgp.onclick=function(){
		alert('google-plus');
	};
	ref.vfb.onclick=function(){
		alert('facebook');
	};		
}
/* =======End vertical popup functionality=======*/
/* =======Start horizontal popup functionality=======*/
playerLoader.prototype.horizontalpopup = function(){
	ref=this;
	var hcs = ref.hcs.value;
	ref.setInput(ref.horizontaliframe,loadConfig.shareUrl+"?pt=horizontal&ap="+ref.hap+"&cs="+hcs,ref.hw.value,ref.hh.value);
	ref.hcs.onchange=function(){
		hcs = ref.hcs.value;
		ref.setInput(ref.horizontaliframe,loadConfig.shareUrl+"?pt=horizontal&ap="+ref.hap+"&cs="+hcs,ref.hw.value,ref.hh.value);
		if(hcs=='light'){
		    ref.horizontalView.setAttribute('class','player-spacer light-theme');
		}else{
			ref.horizontalView.setAttribute('class','player-spacer');
		}
	};
	ref.hw.onchange=function(){
		ref.setInput(ref.horizontaliframe,loadConfig.shareUrl+"?pt=horizontal&ap="+ref.hap+"&cs="+hcs,ref.hw.value,ref.hh.value);
	};
	ref.hh.onchange=function(){
		ref.setInput(ref.horizontaliframe,loadConfig.shareUrl+"?pt=horizontal&ap="+ref.hap+"&cs="+hcs,ref.hw.value,ref.hh.value);
	};	
	ref.ha.onclick=function(){
		var autoplay = ref.ha.checked;
		if(autoplay==true){
			ref.hap=1;
		}else{
			ref.hap=0;
		}
		ref.setInput(ref.horizontaliframe,loadConfig.shareUrl+"?pt=horizontal&ap="+ref.hap+"&cs="+hcs,ref.hw.value,ref.hh.value);
	};
	ref.HorizontalCopiar.onclick= function(){
		ref.horizontaliframe.select();
	}
	ref.htw.onclick=function(){
		alert('twitter');
	};
	ref.hgp.onclick=function(){
		alert('google-plus');
	};
	ref.hfb.onclick=function(){
		alert('facebook');
	};
}
/* =======End horizontal popup functionality=======*/
/* =======Start topbar popup functionality=======*/
playerLoader.prototype.topbarpopup = function(){
	ref=this;
	var tcs=ref.tcs.value;
	ref.setInput(ref.topbariframe,loadConfig.shareUrl+"?pt=topbar&ap="+ref.tap+"&cs="+tcs,"1366","57");
	ref.tcs.onchange=function(){
		tcs=ref.tcs.value;
		ref.setInput(ref.topbariframe,loadConfig.shareUrl+"?pt=topbar&ap="+ref.tap+"&cs="+tcs,"1366","57");
		
		if(tcs=='light'){
		    ref.topbarView.setAttribute('class','tabbody light-theme');
		}else{
			ref.topbarView.setAttribute('class','tabbody');
		}
	};
	ref.ta.onchange=function(){
		var autoplay = ref.ta.checked;
		if(autoplay==true){
			ref.tap=1;
		}else{
			ref.tap=0;
		}
		ref.setInput(ref.topbariframe,loadConfig.shareUrl+"?pt=topbar&ap="+ref.tap+"&cs="+tcs,"1366","57");
	};
	ref.TopbarCopiar.onclick= function(){
		ref.topbariframe.select();
	}
	ref.ttw.onclick=function(){
		alert('twitter');
	};
	ref.tgp.onclick=function(){
		alert('google-plus');
	};
	ref.tfb.onclick=function(){
		alert('facebook');
	};
}
/* =======End topbar popup functionality=======*/

playerLoader.prototype.playNext = function(i){
	if(player.playerType == 'mainplayer' || player.playerType == 'topbar'){
		this.trackinfo.innerHTML = i.title+' <span><a> - '+i.artist+'</a> </span>';
	}
	else if(player.playerType == 'horizontal'){
		this.trackinfo.innerHTML = '<div class="song-title">'+i.title+'</div><span>Por<a href="#"> - '+i.artist+'</a> </span><a class="logo"><img src="images/logo.png" alt="" /></a>';
	}
	else if(player.playerType == 'vertical'){
		this.trackinfo.innerHTML = '<div class="song-title">'+i.title+'</div><span>Por<a href="#"> - '+i.artist+'</a> </span>';
	}
	this.coverimg.setAttribute('src',i.cover);
	this.audio.addfile(i.filename);
}

playerLoader.prototype.updateVolControl = function(i){
	if(playerLoad.currentPlayer == 'audio'){
		for(j = 0; j < 10; j++){
			if(j >= i){
				document.querySelector(".a_"+(j+1)).setAttribute('class','a_'+(j+1)+' vactive');
			}
			else{
				document.querySelector(".a_"+(j+1)).setAttribute('class','volbar a_'+(j+1));
			}
		}
	}
	else if(playerLoad.currentPlayer == 'youtube'){
		if(ytP.mute == false){
			i = 0;
			try{
				i = 10 - (youtubePlayer.getVolume() / 10);
			}
			catch(ex){
			}
		}
		else{
			i = 10;	
		}
		for(j = 0; j < 10; j++){
			if(j >= i){
				document.querySelector(".a_"+(j+1)).setAttribute('class','a_'+(j+1)+' vactive');
			}
			else{
				document.querySelector(".a_"+(j+1)).setAttribute('class','volbar a_'+(j+1));
			}
		}
	}
}

playerLoader.prototype.createElements = function(object,appendto){
	for(i in object.obj){
		var ele = document.createElement(object.obj[i].type);
		for(j in object.obj[i].attr){
			ele.setAttribute(j,object.obj[i].attr[j]);
		}
		if(typeof(object.obj[i].set) != 'undefined'){
			this[object.obj[i].set.objname] = ele;
		}
		if(typeof(object.obj[i].text) != 'undefined'){
			ele.innerHTML = object.obj[i].text;
		}
		if(typeof(object.obj[i].elements) != 'undefined'){
			for(k in object.obj[i].elements){
				this.createElements(object.obj[i].elements,ele)
			}
		}
		appendto.appendChild(ele);
	}
};
playerLoader.prototype.initowl = function(){
	this.owl = $("#playerListItem");
	this.owl.owlCarousel({
		itemsCustom : [
		  [0, 1],
		  [450, 2],
		  [600, 3],
		  [700, 4],
		  [1000, 5],
		  [1200, 5],
		  [1400, 6],
		  [1600, 6]
		],
		navigation : true
	});
	$('.link').click(function(e) {
		e.stopImmediatePropagation();
		var content = $(this).attr('rel');
		if($(this).hasClass('active')){
			$(this).removeClass('active');
			$('.content').hide();
			$('#' + content).hide();
		}
		else{		
			$(this).addClass('active');
			$('.content').hide();
			$('#' + content).show();
			var fn = playerLoad.usePlaylist[playerLoad.currentTrack].filename;
			var incr = 0;
			for(i in loadConfig.playlist){
				if(loadConfig.playlist[i].filename == fn ){
					break;
				}
				incr++;
			}
			playerLoad.owl.trigger('owl.goTo',incr);
		}
	});
	jQuery('.owl-item').on('click', '.item', function(){
		jQuery('.owl-item .item').removeClass('active');
		jQuery(this).addClass('active');
	});
}
playerLoader.prototype.startPl = function(){
	$(this.playlistholder).unbind().removeData();
	this.playlistholder.innerHTML = '';
	if(player.playerType == 'mainplayer'){
		var ref = this;
		for(i in loadConfig.playlist){
			var u = loadConfig.playlist[i];
			(function(u,i){
				adc = '';
				if(i == ref.currentTrack){
					adc = ' playing';
				}
				var tele = {
					obj : {
						type : {
							type : 'div',
							attr : {
								class : 'item'+adc
							},
							text : '<a class="item-list"><span class="removeSong"></span><span class="list-thumb"><img src="'+u.cover+'" alt="" width="70" height="70" /></span><div class="description"><span class="title">'+u.title+'</span><span class="sub-title">'+u.album+'</span><span class="small-title">por <small>'+u.artist+'</small></span></div></a>'
						}
					}
				}
				var ret = ref.createPlaylist(tele,ref.playlistholder);
				
				ref.playlistItems[i] = ret;
				ret.onclick = function(){
					for(var j in ref.usePlaylist){
						if(ref.usePlaylist[j].filename == u.filename){
							ref.currentTrack = j;							
						}
					}
					ref.playNext(u);
				}
				ret.onmouseover = function(){
					var ac = this.getAttribute('class');
					ac = ac.replace(' active','');
					this.setAttribute('class',ac+" active");
					var cn = this.childNodes[0].childNodes[0];
					cn.onclick = function(e){
						e.stopImmediatePropagation();
						ret.remove();
						ref.playlistItems.splice(i,1);
						var fl = loadConfig.playlist[i].filename;
						delete loadConfig.playlist[i];
						for(j in ref.usePlaylist){
							if(ref.usePlaylist[j].filename == fl){
								delete ref.usePlaylist[j];
							}
						}
						ref.startPl();
					} 
				}
				ret.onmouseout = function(){
					var ac = this.getAttribute('class');
					ac = ac.replace(' active','');
					this.setAttribute('class',ac);
				}
			})(u,i);			
		}
		ref.initowl();
	}
	if(player.playerType == 'vertical' || player.playerType == 'horizontal'){
		var ref = this;
		for(i = 0; i < loadConfig.playlist.length; i++){
			var u = loadConfig.playlist[i];
			var stclass = 'audio-list';
			if(u.mediatype == 'video'){
				var stclass = 'video-list';
			}
			(function(u,i){
				var tele = {
					obj : {
						type : {
							type : 'li',
							attr : {
								'class' : stclass
							},
							text : '<a>'+u.title+'</a>'
						}
					}
				}
				var ret = ref.createPlaylist(tele,ref.playlistholder);
				ref.playlistItems[i] = ret;
				ret.onclick = function(){
					for(var j = 0; j < ref.usePlaylist.length; j++){
						if(ref.usePlaylist[j].filename == u.filename){
							ref.currentTrack = j;
						}
					}
					ref.playNext(u);
				}
			})(u,i);
		}
	}
};

playerLoader.prototype.createPlaylist = function(object,appendto){
	var ele = document.createElement(object.obj.type.type);
	for(j in object.obj.type.attr){
		ele.setAttribute(j,object.obj.type.attr[j]);
	}
	if(typeof(object.obj.type.set) != 'undefined'){
		this[object.obj.type.set.objname] = ele;
	}
	if(typeof(object.obj.type.text) != 'undefined'){
		ele.innerHTML = object.obj.type.text;
	}
	appendto.appendChild(ele);
	return ele;
}

playerLoader.prototype.getTimefromsScond = function(seconds){
	var minutes = Math.floor(seconds / 60);
	var hours = Math.floor(seconds / 3600);
	minutes = minutes - hours * 60;
	var rseconds = seconds - ((hours * 3600) + (minutes * 60));
	if(isNaN(rseconds)){
		return "0:00";
	}
	else{
		var h='',m='',s='';
		if(hours>1){
			h = hours+":";
			m = this.pad(minutes,2,0)+":";
		}
		else{
			m = minutes+":";
		}
		s = this.pad(Math.floor(rseconds),2,0);
		return h+m+s;
	}
};
playerLoader.prototype.pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
playerLoader.prototype.pointerPosition = function(event) {
	var ele = this.progressbar;
	var x1 = ele.offsetLeft;
	var s = (document.compatMode === 'CSS1Compat') ? document.documentElement : document.body;
	x = event.clientX + s.scrollLeft;
	var eR = ele.getBoundingClientRect();
	var  sp = (x-x1) - eR.left;
	if(player.playerType == 'mainplayer' || player.playerType == 'topbar'){
		return (sp+50);
	}
	else{
		return (sp);
	}
};
playerLoader.prototype.findTime = function(c){
	var w = this.audio.widthOneSec();
	return c/w;
};
playerLoader.prototype.findParentNode = function(parentName, childObj) {
    var testObj = childObj.parentNode;
    var count = 1;
	var ret = false;
    while(testObj.getAttribute('id') != parentName) {
        testObj = testObj.parentNode;
        count++;
    }
	if(testObj.getAttribute('id') == parentName){
		ret = true;
	}
    return ret;
};
playerLoader.prototype.shuffleth = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
playerLoader.prototype.getNext = function() {
	var nxt = false;
	var inc = 1;
	var len = this.usePlaylist.length;
	var retNxt = 0;
	for(i in this.usePlaylist){
		if(nxt == true){
			retNxt = i;
			break;
		}
		if(i == this.currentTrack && len > inc){
			nxt = true;
		}
		if(i == this.currentTrack && len == inc){
			for(j in this.usePlaylist){
				retNxt = j;
				break;
			}
		}
		inc++;
	}
	return retNxt;
}
playerLoader.prototype.getPrev = function() {
	var nxt = false;
	var inc = 1;
	var len = this.usePlaylist.length;
	var retNxt = 0;
	for(i in this.usePlaylist){
		if(i == this.currentTrack && inc == 1){
			for(j in this.usePlaylist){
				retNxt = j;
			}
			break;
		}
		else if(i == this.currentTrack && len >= inc){
			break;
		}
		inc++;
		retNxt = i;
	}
	return retNxt;
}
function audioPlayer(){
	this.player = document.createElement('video');
};
audioPlayer.prototype.addfile = function(file){
	var pl = playerLoad.usePlaylist[playerLoad.currentTrack];
	if( pl.mediatype == 'video'){
		 this.stopPlaying();
		 (function () {
			if(document.querySelector("#youtube") !== null){
				document.querySelector("#youtube").remove();
			}
			var you = document.createElement("div");
			you.setAttribute('id',"youtube");
			playerLoad.youtube.appendChild(you);
			playerLoad.currentPlayer = 'youtube';
			youtubePlayer = new YT.Player('youtube', {
			  height: '390',
			  width: '800',
			  videoId: pl.filename,
			  playerVars : {
				  controls: '0',
				  enablejsapi : '1',
				  autoplay : player.autoPlay,
				  showinfo : '0',
				  fs : '0'
			  },
			  events: {
				'onReady': ytP.onPlayerReady,
				'onStateChange': ytP.onStateChange,
			  }
			});
		  })();
	}
	else{
		ytP.stopVideo();
		playerLoad.currentPlayer = 'audio';
		this.player.setAttribute('src',file);
		this.player.setAttribute('type',"audio/mpeg; codecs='mp3';");
		this.loadedmetadata();
	}
}
audioPlayer.prototype.stopPlaying = function(){
	this.player.pause();
	this.player.setAttribute('src','');
}
audioPlayer.prototype.loadedmetadata = function(){
	this.player.onerror = function(e){
		//console.log(e.target.error);
	};
	this.player.onloadedmetadata = function(){
		if(document.querySelector("#youtube") !== null){
			document.querySelector("#youtube").style.display = 'none';
		}
		if(player.autoPlay == 1){
			this.play();
			player.autoPlay = 1;
		}
		playerLoad.audio.currentItem();
		playerLoad.audio.attachEvents();
		playerLoad.audio.progress();
	}
}
audioPlayer.prototype.currentItem = function(){
	var filen = playerLoad.usePlaylist[playerLoad.currentTrack].filename;
	for(var j in loadConfig.playlist){
		if(loadConfig.playlist[j].filename == filen){
			var usethis = j;
		}
	}
	for(i in playerLoad.playlistItems){
			if(player.playerType == 'mainplayer'){
				if(i == usethis){
					playerLoad.playlistItems[i].setAttribute('class','playing item');
				}
				else{
					playerLoad.playlistItems[i].setAttribute('class','item');
				}
			}
			else if(player.playerType == 'vertical' || player.playerType == 'horizontal'){
				if(i == usethis){
					var pcalss = 'audio-list selected';
					if(loadConfig.playlist[i].mediatype == 'video'){
						pcalss = 'video-list selected';
					}  
					playerLoad.playlistItems[i].setAttribute('class',pcalss);
				}
				else{
					var pcalss = 'audio-list';
					if(loadConfig.playlist[i].mediatype == 'video'){
						pcalss = 'video-list';
					}  
					playerLoad.playlistItems[i].setAttribute('class',pcalss);
				}
			}
	}
},
audioPlayer.prototype.playpause = function(){
	if(playerLoad.currentPlayer == 'audio'){
		if(this.player.paused === false){
			this.player.pause();
			playerLoad.play.setAttribute("class","btnPlayer playPause play colorbtn")
		}
		else{
			this.player.play();
		}
	}
	else if(playerLoad.currentPlayer == 'youtube'){
		if(ytP.playing === true){
			youtubePlayer.pauseVideo();
			ytP.playing = false;
			playerLoad.play.setAttribute("class","btnPlayer playPause play colorbtn");
		}
		else if(ytP.playing === false){
			youtubePlayer.playVideo();
		}
		else{
			youtubePlayer.playVideo();
		}
	}
}
audioPlayer.prototype.attachEvents = function(){
	this.playing();
	this.timeupdate();
	this.ended();
}
audioPlayer.prototype.playing = function(){
	this.player.onplaying = function(){
		playerLoad.play.setAttribute("class","btnPlayer playPause pause colorbtn")
	}
}
audioPlayer.prototype.ended = function(){
	this.player.onended = function(){
		playerLoad.currentTrack = playerLoad.getNext();
		playerLoad.playNext(playerLoad.usePlaylist[playerLoad.currentTrack]);
	}
}

audioPlayer.prototype.widthOneSec = function(){
	if(playerLoad.currentPlayer == 'audio'){
		return playerLoad.progressbar.offsetWidth/this.player.duration;
	}
	else if(playerLoad.currentPlayer == 'youtube'){
		return playerLoad.progressbar.offsetWidth/ytP.duration;
	}
}
audioPlayer.prototype.timeupdate = function(){
	this.player.ontimeupdate = function(){
		var duration = playerLoad.getTimefromsScond(this.duration - this.currentTime);
		var current = playerLoad.getTimefromsScond(this.currentTime);
		playerLoad.currenttime.innerHTML = current;
		playerLoad.timeleft.innerHTML = '- '+duration;
		var sO = playerLoad.audio.widthOneSec();
		if(playerLoad.moving == false){
			playerLoad.slider.style.width = (sO*this.currentTime)+"px";
		}
		playerLoad.audio.updatebuffer();
	}
}


audioPlayer.prototype.progress = function(){
	this.player.onprogress = function(){
		playerLoad.audio.updatebuffer();
	}
}
audioPlayer.prototype.updatebuffer = function(){
	var sO = this.widthOneSec();
	var b = this.getMaxBuffer();
	playerLoad.buffer.style.width = (sO*b)+"px";
}
audioPlayer.prototype.getMaxBuffer = function(){
	var m = 0;
	for(var i = 0; i < this.player.buffered.length; i++){
		if( m < this.player.buffered.end(i)){
			m = this.player.buffered.end(i);
		}
	}
	return m;
}
audioPlayer.prototype.updateTime = function(){
	if(playerLoad.currentPlayer == 'audio'){
		this.player.currentTime = playerLoad.settime;
		this.player.play();
	}
	else if(playerLoad.currentPlayer == 'youtube'){
		 ytP.seekTo(playerLoad.settime);
	}
}
audioPlayer.prototype.muteUnmute = function(){
	if(playerLoad.currentPlayer == 'audio'){
		if(this.player.volume > 0){
			playerLoad.oldVolume = this.player.volume;
			this.player.volume  = 0;
			playerLoad.updateVolControl(10);
			playerLoad.volume.setAttribute('class','volume mute');
		}else{
			this.player.volume  = playerLoad.oldVolume;
			playerLoad.updateVolControl(10-playerLoad.oldVolume*10);
			playerLoad.volume.setAttribute('class','volume on');
		}
	}
	else if(playerLoad.currentPlayer == 'youtube'){
		if(!youtubePlayer.isMuted()){
			ytP.mute=true;
			youtubePlayer.mute();
			playerLoad.updateVolControl(5);
			playerLoad.volume.setAttribute('class','volume mute');
		}else{
			ytP.mute=false;
			youtubePlayer.unMute();
			var vol = youtubePlayer.getVolume()/10;
			vol = 11 - vol;
			vol = (vol * 10);
			playerLoad.updateVolControl(vol);
			playerLoad.volume.setAttribute('class','volume on');
		}
	}
}
audioPlayer.prototype.setVolume = function(vol){
	if(playerLoad.currentPlayer == 'audio'){
		vol = 11 - vol;
		vol = (vol / 10);
		playerLoad.oldVolume = vol;
		this.player.volume = vol;
		playerLoad.volume.setAttribute('class','volume on');
	}
	else if(playerLoad.currentPlayer == 'youtube'){
		vol = 11 - vol;
		vol = (vol * 10);
		youtubePlayer.setVolume(vol);
		playerLoad.volume.setAttribute('class','volume on');
	}
}
function ytPlayer(){
	this.currentTime;
	this.buffered;
	this.duration;
	this.playing;
	this.volume;
	this.mute = false;
}
ytPlayer.prototype.onStateChange = function(e){
		if (e.data == YT.PlayerState.PLAYING){
			player.autoPlay = 1;
			ytP.playing = true;
			playerLoad.play.setAttribute("class","btnPlayer playPause pause colorbtn");
			clearInterval(intrval);
			intrval = setInterval(function(){
				if(youtubePlayer != null){
					ytP.currentTime = youtubePlayer.getCurrentTime();
					var loaded = youtubePlayer.getVideoLoadedFraction();
					ytP.duration = youtubePlayer.getDuration();
					ytP.buffered = loaded*ytP.duration;
					ytP.progress();
				}
				else{
					clearInterval(intrval);
				}
			},200);
		}
		if (e.data == YT.PlayerState.PAUSED){
			playerLoad.play.setAttribute("class","btnPlayer playPause play colorbtn");
			ytP.playing = false;
		}
        if (e.data == YT.PlayerState.ENDED){
			clearInterval(intrval);
			playerLoad.currentTrack = playerLoad.getNext();
			playerLoad.playNext(playerLoad.usePlaylist[playerLoad.currentTrack]);
			ytP.stopVideo();
			document.querySelector("#youtube").remove();
		}   
}

ytPlayer.prototype.seekTo = function(e){
	youtubePlayer.seekTo(e);
}
ytPlayer.prototype.onPlayerReady = function(e){
	playerLoad.audio.currentItem();
	playerLoad.audio.attachEvents();
	playerLoad.audio.progress();
}
ytPlayer.prototype.stopVideo = function(e){
	clearInterval(intrval);
	if(typeof(youtubePlayer) != 'undefined' && youtubePlayer != null){
		youtubePlayer.stopVideo();
	}
	youtubePlayer = null;
}
ytPlayer.prototype.playVideo = function(e){
	youtubePlayer.playVideo();
}
ytPlayer.prototype.progress = function(){
	var duration = playerLoad.getTimefromsScond(this.duration - this.currentTime);
	var current = playerLoad.getTimefromsScond(this.currentTime);
	playerLoad.currenttime.innerHTML = current;
	playerLoad.timeleft.innerHTML = '- '+duration;
	var sO = playerLoad.progressbar.offsetWidth/this.duration;
	if(playerLoad.moving == false){
		playerLoad.slider.style.width = (sO*this.currentTime)+"px";
	}
	playerLoad.buffer.style.width = (sO*this.buffered)+"px";
}
ytP = new ytPlayer();