var config = {
    map: {
        "*": {
            velocity: "js/vendors/velocity",
            promoAnimations: "js/animations/promo",
            smoothScroll: "js/animations/smoothScroll.min",
            smoothScrollConfig: "js/animations/smoothScrollConfig",
        },
    },
    deps: [
        "js/vendors/velocity",
        "js/animations/smoothScrollConfig",
    ],
    shim: {
        velocity: {
            deps: ["jquery"],
        },
        smoothScrollConfig: {
            deps: ["smoothScroll"]
        },
    },
};