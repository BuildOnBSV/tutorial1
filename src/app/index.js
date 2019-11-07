var MongoClient = require('mongodb').MongoClient;
const express = require('express')
const path = require('path')
const app = express()
const port = 4000
var url = "mongodb://mongo:27017/";

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/db', function(req, res) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("demo");

      dbo.collection('a').find().toArray(function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        db.close();
        res.send(result);
      })

    });
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
