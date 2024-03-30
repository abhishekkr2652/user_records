const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const {v4 : uuidv4} = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'sql_node',
    password: 'admin123',
  });

  let getRandomUser =  () => {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ];
  };
  //HOME PAGE
  app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM user1`;
    try{
        connection.query( q, (err, result) => {
        if (err) throw err;
        let count = result[0]["count(*)"];
        res.render("home.ejs", {count});
        });
    } catch(err) {
        res.send("some error occured");
    }
  });
  //USERS DATA
  app.get("/user", (req, res) => {
    let q = `SELECT * FROM user1`;
    try{
      connection.query( q, (err, result) => {
      if (err) throw err;
      res.render("user_data.ejs", {result});
      });
  } catch(err) {
      res.send("some error occured");
  }
  });
  //EDIT USER
  app.get("/user/:id/edit", (req, res) =>{
      let {id} = req.params;
      let q = `SELECT * FROM user1 WHERE id = '${ id }'`;
      try{
        connection.query( q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("edit.ejs", { user });
        });
    } catch(err) {
        res.send("some error occured");
    }
  });
  // UPDATE(DB) USER(update)
  app.patch("/user/:id", (req, res) => {
    let {id} = req.params;
    let { password: formPass, username: newUsername} = req.body;
    let q = `SELECT * FROM user1 WHERE id = '${ id }'`;
    try{
      connection.query( q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if(formPass != user.password){
        res.send("wrong password");
      } else{
        let q1 = `UPDATE user1 SET username = '${newUsername}' WHERE id = '${ id }'`;
        connection.query(q1, (err, result) => {
            if (err) throw err;
            res.redirect("/user"); 
        }); 
      }
      });
  } catch(err) {
      res.send("some error occured");
  }
  });
  // DELETE user
  app.get("/user/:id/delete", (req, res) => {
      let {id} = req.params;
      let q = `SELECT * from user1 WHERE id = '${id}'`;

      try{
      connection.query(q, (err, result) => {
          if (err) throw err;
          let user = result[0];
          res.render("delete.ejs", {user});
      });
    } catch(err){
      console.log("error occured");
    }
  });
  // DELETE(db) user(update)
  app.delete("/user/:id", (req, res) => {
    let {id} = req.params;
    let {email : formEmail, password: formPass} = req.body;
    let q = `SELECT * from user1 WHERE id = '${id}'`;
    try{
    connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        if(formEmail != user.email || formPass != user.password){
            res.send("Wrong credential/s");
        } else{
          let q1 = `DELETE FROM user1 WHERE id = '${id}'`;
          connection.query(q1, (err, result) => {
              if (err) throw err;
              console.log(result);
              res.redirect("/user");
          });
        }
    });
  } catch(err){
    console.log("error occured");
  }
  });
  // ADD user
  app.get("/user/add", (req, res) => {
      res.render("new.ejs");
  });
  // ADD user(new)
  app.post("/user/new", (req, res) => {
      let id = uuidv4();
      let {username, email, password} = req.body;

      let q = `INSERT INTO user1 VALUES ( '${id}', '${username}', '${email}', '${password}' )`;

      connection.query(q, (err, result) => {
          if (err) throw err;
          console.log(result);
          res.redirect("/user");
      });
  });


  app.listen("8080", () => {
        console.log("server is listening to port number 8080");
  });
