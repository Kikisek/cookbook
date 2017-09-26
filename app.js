var express = require("express");
var app = express();
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/recipes");

var recipeSchema = new Schema({
    title: String,
    image: String,
    ingredients: {name: String,
                  amount: Number,
                  unit: String},
    directions: String,
    noOfServings: Number,
    prepTime: Number,
    cookingTime: Number
});

var Recipe = mongoose.model('Recipe', recipeSchema);

app.get("/", function(req, res){
    res.redirect("/recipes");
});

app.get("/recipes", function(req, res){
    res.render("allRecipes");
});

app.get("/recipes/new", function(req, res){
    res.render("new");
});

app.listen(3000, function () {
    console.log('Server has started');
  });