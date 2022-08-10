require(["jquery"], ($) => {
    $('[data-role="show-all-btn"]').on("click", function () {
        $(this).parents('[data-role="collapsible-content"]').addClass('collapsed');
        $(this).parents('[data-role="collapsible-content"]').css('max-height', 'none');
        $(this).hide();
    });
});
