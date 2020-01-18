"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

const cors = require('cors');

app.use(function(req, res, next) { //allow cross origin requests
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  // res.header( "Cache-Control",'no-cache');
  next();
});
app.use(bodyParser.json()); // for parsing POST req
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set("views", __dirname + "/views"); // Render on browser
app.set("view engine", "html");
app.engine("html", ejs.renderFile);
app.use(express.static(__dirname + "/views"));

const server = app.listen(process.env.PORT || 9999, () => {
  console.log(
    "Express server listening on port %d in %s mode",
    server.address().port,
    app.settings.env
  );
});

const BRAND_NAME = "AlphaQ";
const NEXMO_API_KEY = "38285cb0";
const NEXMO_API_SECRET = "F1ty1LHxIzu6rmdU";

const Nexmo = require("nexmo");
const nexmo = new Nexmo({
  apiKey: NEXMO_API_KEY,
  apiSecret: NEXMO_API_SECRET
});

// Web UI ("Registration Form")
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/register", cors(), (req, res) => {
  // A user registers with a mobile phone number
  let phoneNumber = req.body.number;
  console.log(phoneNumber);
  res.header('Access-Control-Allow-Origin', '*');
  nexmo.verify.request(
    {
      number: phoneNumber,
      brand: BRAND_NAME
    },
    (err, result) => {
      if (err) {
        res.sendStatus(500);
        res.render("status", {
         message: "Server Error"
        });
      } else {
        console.log(result);

        let requestId = result.request_id;
        if (result.status === "0") {
          //res.render("verify", {
           // requestId: requestId
          //});
          res.json(result);
        } else {
          //res.status(401).send(result.error_text);
          // res.render("status", {
          //   message: result.error_text,
          //   requestId: requestId
          // });

          res.json({request_id: '', status: result.status});
        }
      }
    }
  );
});

app.post("/verify", (req, res) => {
  // Checking to see if the code matches
  let pin = req.body.pin;
  let requestId = req.body.requestId;

  nexmo.verify.check(
    {
      request_id: requestId,
      code: pin
    },
    (err, result) => {
      if (err) {
        //res.status(500).send(err);
        res.render("status", {
          message: "Server Error"
        });

      } else {
        console.log(result);
        // Error status code: https://developer.nexmo.com/api/verify#verify-check
        if (result && result.status == "0") {
          // res.status(200).send('Account verified!');
          // res.render("status", {
          //   message: "Account verified! 🎉"
          // })
          console.log(result);
          res.json(result);
        } else {
          // res.status(401).send(result.error_text);
          // res.render("status", {
          //   message: result.error_text,
          //   requestId: requestId
          // });
          console.log(result);
          res.json(result);
          // res.json({request_id: '', status: result.status});
        }
      }
    }
  );
});
