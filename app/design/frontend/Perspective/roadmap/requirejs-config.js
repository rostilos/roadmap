var config = {
    map: {
        "*": {
            velocity: "js/vendors/velocity",
            smoothScroll: "js/vendors/smoothScroll.min",
            scrollAnimations: "js/animations/scrollAnimations",
            promoPage: "js/pages/promo",
        },
    },
    deps: ["js/vendors/velocity"],
    shim: {
        velocity: {
            deps: ["jquery"],
        },
        smoothScrollConfig: {
            deps: ["smoothScroll"],
        },
    },
};