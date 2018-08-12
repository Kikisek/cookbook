var express = require("express");
var app = express();
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');
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
    cookingTime: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            rel: "User"
        },
        username: String
    }
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


//MIDDLEWARE
function checkAuthForRecipe (req, res, next) {
    //is user logged in?
    if (req.isAuthenticated()) {
        Recipe.findById(req.params.id, function (err, foundRecipe) {
            if (err || !foundRecipe) {
                res.redirect("back");
            } else {
                //does user own the recipe?
                if (foundRecipe.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    }
}

let isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}


//ROUTES
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

//root
app.get("/recipes", function (req, res) {
    Recipe.find({}, function (err, recipes) {
        if (err) {
            console.log(err);
        } else {
            res.render("allRecipes", { recipes: recipes });
        }
    })
});

//add recipe form
app.get("/recipes/new", isLoggedIn, function (req, res) {
    res.render("edit", { edit: false });
});

//add new recipe
app.post("/recipes", isLoggedIn, function (req, res) {
    let newRecipe = {
        title: req.body.title,
        image: req.body.image,
        ingredients: reshapeIngredients(req.body.ingredients),
        directions: req.body.directions,
        servings: req.body.servings,
        prepTime: req.body.prepTime,
        cookingTime: req.body.cookingTime,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    }
    Recipe.create(newRecipe, function (err, recipe) {
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
app.get("/recipes/:id/edit", checkAuthForRecipe, function (req, res) {
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
app.put("/recipes/:id", checkAuthForRecipe, function (req, res) {
    console.log('editing')
    req.body.ingredients = reshapeIngredients(req.body.ingredients);
    Recipe.findByIdAndUpdate(req.params.id, req.body, function (err, updatedRecipe) {
        if (err) {
            res.send("error" + err);
        } else {
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

//remove recipe
app.delete("/recipes/:id", checkAuthForRecipe, function (req, res) {
    Recipe.findByIdAndRemove(req.params.id, function (err, removedRecipe) {
        if (err) {
            res.send("error", + err);
        } else {
            res.redirect("/recipes");
        }
    });
});

//SPUSTIT DATABAZI: mongod
//SPUSTIT SERVER: node app.js or npm start
app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("Server is running");
});
