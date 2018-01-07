var express = require("express");
var app = express();
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');
// var faker = require("faker");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");

app.set("view engine", "ejs");
app.use(express.static("public"));

var url = process.env.DBURL || "mongodb://localhost/recipes";
mongoose.connect(url, { useMongoClient: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

var UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: String,
    email: String,
    admin: { type: Boolean, default: false }
})

UserSchema.plugin(passportLocalMongoose);

var RecipeSchema = new Schema({
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

var User = mongoose.model('User', UserSchema);
var Recipe = mongoose.model('Recipe', RecipeSchema);

// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Recepty!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

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

//show register form
app.get("/register", function (req, res) {
    res.render("register");
})

//handle sign up logic
app.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.username,
    });
    //admin check
    if (req.body.adminCode === "adm1nc0d3") {
        newUser.admin = true;
    }
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            console.log("Successfully registered");
            res.redirect("/recipes");
        });
    });
});

//show login form
app.get("/login", function (req, res) {
    res.render("login")
})

//handle login logic
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/recipes",
        failureRedirect: "/login"
    }), function (req, res) {
});

//logout
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/recipes");
})

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

//create new recipe form
app.get("/recipes/new", function (req, res) {
    res.render("edit", { edit: false });
});

//add new recipe
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

//show individual recipe
app.get("/recipes/:id", function (req, res) {
    Recipe.findById(req.params.id, function (err, foundRecipe) {
        if (err) {
            console.log(err);
        } else {
            res.render("show", { recipe: foundRecipe });
        }
    });
});

//edit recipe form
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

//edit recipe route
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

//SPUSTIT DATABAZI: mongod
//SPUSTIT SERVER: node app.js or npm start
app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("Server is running");
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