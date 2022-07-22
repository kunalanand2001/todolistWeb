
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//removing arryas and connecting to the database.
mongoose.connect(process.env.MONGO_URI);

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "The first item of hte great todo list."
});
const item2 = new Item({
  name: "This list is great because it will be working with our own database."
});
const item3 = new Item({
  name: "Data will not be lost on refreshing."
});
defaultItems = [item1, item2, item3];

const listSchema={    // for every newly creatd list.
  name: String,           // name of the list (ex- work)
  items: [itemsSchema]    // items in the neq build list (ex- items in the work list.)
}
const List = mongoose.model("List",listSchema);  // new list model.

// ----------------------------------------------

app.get("/", function (req, res) {

  Item.find({}, function (err, theitems) {

    if (theitems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) { console.log(err); }
        else { console.log("successfully saved the 3 items."); }
      });
      res.redirect("/");
    }
    else{
      res.render("list", { listTitle: "Today", newListItems: theitems });
    }  
  });

});


app.get("/:customName",function(req,res){
  // console.log(req.params.customName);
  const customListName = _.capitalize(req.params.customName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("not exist!");  // make the list if not exist.
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        console.log("exist!");
        res.render("list",{ listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  })

})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.listName;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    console.log("successfully added the new item.")
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});

app.post("/delete",function(req,res){
  const checkedITemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedITemID,function(err){
      if(!err){
        console.log("successfully deleted the checked item.")
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedITemID}}} ,function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT||3000, function () {
  console.log("Server started on port 3000");
});
