var config = {
    deps: [
        "js/vendors/velocity",
    ],
    map: {
        "*": {
            velocity: "js/vendors/velocity",
            promoAnimations: "js/animations/promo",
        },
    },
    shim: {
        velocity: {
            deps: ["jquery"],
        },
    },
};