//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//lodash
const _ = require("lodash");
// const date = require(__dirname + "/date.js");   // for understanding other modules
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//conection
mongoose.connect("mongodb+srv://admin-sethu:Test123@cluster0.plkds.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
//schema
const itemsSchema = new mongoose.Schema({
    name: String
});
//model / table
const Item = mongoose.model("Item", itemsSchema);
// creating documents/row
const item1 = new Item({
    name: "Welcome to our To-Do-List"
});
const item2 = new Item({
    name: "Hit the  '+'  button to add a new item."
});
const item3 = new Item({
    name: "<--- Hit this to delete an item."
});
const defaultItems = [item1,item2,item3];


//schema
const listSchema = new mongoose.Schema({
  name : String,
  items: [itemsSchema]
});
//model / table
const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){
  // const day = date.getDate();     // for understanding mongoose
  //rendering info from db to send data

  Item.find({},function(err, foundItems){//it returns a array
    if(foundItems.length === 0)
    {
      //save documents
      Item.insertMany(defaultItems, function(err){
        if(!err){
          console.log("Successfully saved default documents");
        }
        res.redirect("/");
      });

    }
    else{
      res.render("list",{
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  if (customListName == "Favicon.ico") return;
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){

      // creating documents/row
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save(function(err, result) { // Log the result parameter to the console to review it
          res.redirect("/" + customListName);
        });
      } else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});

app.post("/",function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  if(itemName != ""){
    const oneItem = new Item({
      name: itemName
    });

    if (listName === "Today"){
      oneItem.save(function(err, result){ // Log the result parameter to the console to review it
          res.redirect("/");
        });
    }
    else{
      List.findOne({name: listName}, function(err, foundList)
      {
        foundList.items.push(oneItem);
        foundList.save(function(err, result)
        {
          res.redirect("/" + listName);
        });
    });
}
}
});

app.post("/delete",function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted a documents");
        res.redirect("/");
      }

    });
  } else{
      List.findOneAndUpdate({ name: listName},{$pull: {items: {_id: checkedItemId}}},function(err, foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      });
  }

});



app.get("/about",function(req,res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started succesfully");
});      
