var express = require("express");
var app = express();
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');
var faker = require("faker");
var methodOverride = require("method-override");

app.set("view engine", "ejs");
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/recipes");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

var recipeSchema = new Schema({
    title: String,
    image: String,
    ingredients: [
        {
            name: String,
            amount: Number,
            unit: String
        }
    ],
    directions: [String],
    servings: Number,
    prepTime: Number,
    cookingTime: Number
});

var Recipe = mongoose.model('Recipe', recipeSchema);

function reshapeIngredients(ingredients) {
    var modifiedIngredients = [];
    for (var i = 0; i < ingredients.name.length; i++) {
        var obj = {
            name: ingredients.name[i],
            amount: ingredients.amount[i],
            unit: ingredients.unit[i],
        };
        modifiedIngredients.push(obj);
    }
    return modifiedIngredients;
};

app.get("/", function (req, res) {
    res.redirect("/recipes");
});

app.get("/recipes", function (req, res) {
    Recipe.find({}, function (err, recipes) {
        if (err) {
            console.log(err);
        } else {
            res.render("allRecipes", { recipes: recipes });
        }
    })
    // res.render("allRecipes", {recipes: fake(20)});
});

app.get("/recipes/new", function (req, res) {
    res.render("edit", { edit: false });
});

app.post("/recipes", function (req, res) {
    req.body.ingredients = reshapeIngredients(req.body.ingredients);
    Recipe.create(req.body, function (err, recipe) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/recipes");
        }
    });
});

app.get("/recipes/:id", function (req, res) {
    Recipe.findById(req.params.id, function (err, foundRecipe) {
        if (err) {
            console.log(err);
        } else {
            res.render("show", { recipe: foundRecipe });
        }
    });
});

app.get("/recipes/:id/edit", function (req, res) {
    Recipe.findById(req.params.id, function (err, foundRecipe) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit", {
                recipe: foundRecipe,
                edit: true
            });
        }
    });
});

app.put("/recipes/:id", function (req, res) {
    req.body.ingredients = reshapeIngredients(req.body.ingredients);
    Recipe.findByIdAndUpdate(req.params.id, req.body, function (err, updatedRecipe) {
        if (err) {
            res.send("error" + err);
        } else {
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

app.listen(3000, function () {
    console.log('Server has started');
});

function fake(count) {
    var units = ["g", "lb", "ml", "oz", "fl oz", "cup", "tbsp", "tsp", "pcs"];
    var fakeData = [];
    for (var i = 0; i <= count; i++) {
        fakeData.push({
            title: faker.random.words(),
            image: faker.image.food() + "?t=" + Date.now(),
            ingredients: [{
                name: faker.random.word(),
                amount: faker.random.number(),
                unit: units[Math.floor(Math.random() * units.length)]
            },
            {
                name: faker.random.word(),
                amount: faker.random.number(),
                unit: units[Math.floor(Math.random() * units.length)]
            },
            {
                name: faker.random.word(),
                amount: faker.random.number(),
                unit: units[Math.floor(Math.random() * units.length)]
            }],
            directions: faker.lorem.paragraphs(),
            servings: faker.random.number(),
            prepTime: faker.random.number(),
            cookingTime: faker.random.number()
        });
    }
    return fakeData;
}