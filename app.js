var express = require("express");
var app = express();
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');
var faker = require("faker");

app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/recipes");
app.use(bodyParser.urlencoded({ extended: true }));

var recipeSchema = new Schema({
    title: String,
    image: String,
    ingredients: [
        {name: String,
         amount: Number,
         unit: String}
    ],
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
    Recipe.find({}, function(err, recipes){
        if(err){
            console.log(err);
        } else {
            res.render("allRecipes", {recipes: recipes});
        }
    })
    // res.render("allRecipes", {recipes: fake(20)});
});

app.get("/recipes/new", function(req, res){
    res.render("new");
});

app.post("/recipes", function(req, res){
    var ingredients = req.body.ingredients;
    var modifiedIngredients = [];
    for (var i = 0; i < ingredients.name.length; i++){
        var obj = {
            name: ingredients.name[i],
            amount: ingredients.amount[i],
            unit: ingredients.unit[i],
        };
        modifiedIngredients.push(obj);
    }
    req.body.ingredients = modifiedIngredients;
    Recipe.create(req.body, function(err, recipe){
        if(err){
            console.log(err);
        } else {
            res.redirect("/recipes");
        }
    });
});

app.listen(3000, function () {
    console.log('Server has started');
  });

function fake(count){
    var units = ["g", "lb", "ml", "oz", "fl oz", "cup", "tbsp", "tsp", "pcs"];
    var fakeData = [];
    for (var i = 0; i <= count; i++){
        fakeData.push({
            title: faker.random.words(),
            image: faker.image.food() + "?t=" + Date.now(),
            ingredients: [{name: faker.random.word(),
                          amount: faker.random.number(),
                          unit: units[Math.floor(Math.random()*units.length)]},
                          {name: faker.random.word(),
                          amount: faker.random.number(),
                          unit: units[Math.floor(Math.random()*units.length)]}],
            directions: faker.lorem.paragraphs(),
            noOfServings: faker.random.number(),
            prepTime: faker.random.number(),
            cookingTime: faker.random.number()
        });
    }
    return fakeData;
}