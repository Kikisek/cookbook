$(document).ready(function(){
    $("#add-form").on("click", "#add-ingredient-btn", function(){
        var newIngredientsForm = $(".ingredients-form").last().clone();
        newIngredientsForm.find("input").val("");;
        $(".ingredients-form").last().after(newIngredientsForm);
    });
    $("#add-form").on("click", ".remove-ingredient-btn", function(){
        if ($(".ingredients-form").length > 1){
            $(this).parent().parent().remove();
        } else {
            $(".ingredients-form").find("input").val("");
            $(".ingredients-form").find("select").val("g");
        }
    });
    $("#recipes-card-container").on("click", ".chevron", function(){
        $(this).siblings(".card-text").slideToggle(function(){
            $(this).siblings(".chevron").children("i").toggleClass("fa-chevron-down");
            $(this).siblings(".chevron").children("i").toggleClass("fa-chevron-up");
        });
    });
});