var config = {
    map: {
        "*": {
            velocity: "js/vendors/velocity",
            smoothScroll: "js/animations/smoothScroll.min",
            smoothScrollConfig: "js/animations/smoothScrollConfig",
            promoAnimations: "js/animations/promo",
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