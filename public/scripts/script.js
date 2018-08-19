$(document).ready(function () {
    $("#add-form").on("click", "#add-ingredient-btn", function () {
        var newIngredientsForm = $(".ingredients-form").last().clone();
        newIngredientsForm.find("input").val("");
        $(".ingredients-form").last().after(newIngredientsForm);
    });
    $("#add-form").on("click", ".remove-ingredient-btn", function () {
        if ($(".ingredients-form").length > 1) {
            $(this).parent().parent().remove();
        } else {
            $(".ingredients-form").find("input").val("");
            $(".ingredients-form").find("select").val("g");
        }
    });
    $("#add-form").on("click", "#add-direction-btn", function () {
        var newDirectionForm = $(".directions-form").last().clone();
        newDirectionForm.find("textarea").val("");
        $(".directions-form").last().after(newDirectionForm);
    });
    $("#add-form").on("click", ".remove-direction-btn", function () {
        if ($(".directions-form").length > 1) {
            $(this).parent().parent().remove();
        } else {
            $(".directions-form").find("textarea").val("");
        }
    });
    $("#recipes-card-container").on("click", ".chevron", function () {
        $(this).siblings(".card-text").slideToggle(function () {
            $(this).siblings(".chevron").children("i").toggleClass("fa-chevron-down");
            $(this).siblings(".chevron").children("i").toggleClass("fa-chevron-up");
        });
    });
    const arrayOfOriginalIngredients = [];
    jQuery.each($(".original-no-of-ingredients"), (index, value) => {arrayOfOriginalIngredients.push(value.innerHTML)});
    const originalNoOfServings = $("#no-of-servings-input").val();
    $("#no-of-servings").bind("input", function () {
        let noOfServings = $("#no-of-servings-input").val();
        let calculatedServings = [];
        arrayOfOriginalIngredients.forEach(value => {
            calculatedServings.push(Math.round(100 * ((value / originalNoOfServings) * noOfServings)) / 100)
        })
        jQuery.each($(".original-no-of-ingredients"), (index, value) => {value.innerHTML = calculatedServings[index]});
    });
});