const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connects to where mongo db is hoisted locally
mongoose.connect("mongodb+srv://admin_mayank:test123@cluster0.cefcn.mongodb.net/todolistDB");

const itemsSchema = {
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist"
});
const item2=new Item({
  name:"Hit the + button to add a new item"
});
const item3=new Item({
  name:"Click the checkbox to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(!err){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err)
          console.log(err);
        else  
          console.log("Default items added successfully!!");
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      if(!err){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
      }
    });
  }
});

app.post("/delete",function(req,res){

  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  console.log(req.body);

  if(listName === "Today"){
    Item.findByIdAndRemove(checkItemId,function(err){
      if(!err)
        console.log("item deleted successfully");
        res.redirect("/");
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull : {items : {_id:checkItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:customListName",function(req,res){
  var customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
