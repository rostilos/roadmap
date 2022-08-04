var config = {
    map: {
        "*": {
            velocity: "js/vendors/velocity",
            smoothScroll: "js/vendors/smoothScroll.min",
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