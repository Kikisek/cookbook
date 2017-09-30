$(document).ready(function(){
    $("#addForm").on("click", "#addIngredientBtn", function(){
        var newIngredientsForm = `<div class="form-row ingredientsForm">
                                    <div class="form-group col-md-3">
                                        <input type="text" class="form-control" name="ingredients[name]" placeholder="spaghetti">
                                    </div>
                                    <div class="form-group col-md-3">
                                        <input type="number" step="0.01" class="form-control" name="ingredients[amount]" placeholder="0">
                                    </div>
                                    <div class="form-group col-md-3">
                                        <input type="text" class="form-control" name="ingredients[unit]" placeholder="g">
                                    </div>
                                    <div class="form-group col-md-3 pl-4">           
                                        <button type="button" class="form-control btn btn-regular removeIngredientBtn">Remove</button>
                                    </div>
                                </div>`;
        // newIngredientsForm.find("input").val("");
        $(".ingredientsForm").last().after(newIngredientsForm);
    });
    $("#addForm").on("click", ".removeIngredientBtn", function(){
        if ($(".ingredientsForm").length > 1){
        $(this).parent().parent().remove();
        } else {
            $(".ingredientsForm").find("input").val("");
            $(".ingredientsForm").find("select").val("g");
        }
    });
    $("#recipesCardContainer").on("click", ".chevron", function(){
        $(this).siblings(".card-text").slideToggle(function(){
            $(this).siblings(".chevron").children("i").toggleClass("fa-chevron-down");
            $(this).siblings(".chevron").children("i").toggleClass("fa-chevron-up");
            console.log($(this));
        });
        // $(this).toggleClass("hidden");
    });
    // $("#recipesCardContainer").on("click", "#chevron-up", function(){
    //     $(this).siblings(".card-text").slideToggle(function(){
    //         $(this).siblings("#chevron-down").toggleClass("hidden");
    //     });
    //     $(this).toggleClass("hidden");
    // });
});