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
app.get('/submit', function(req, res) {
  res.sendFile(__dirname + '/public/submit.html');
});
app.get('/comments', function(req, res) {
  res.sendFile(__dirname + '/public/comments.html');
});
app.get('/jobs', function(req, res) {
  res.sendFile(__dirname + '/public/jobs.html');
});
app.get('/newjob', function(req, res) {
  res.sendFile(__dirname + '/public/newjob.html');
});


app.post('/db/:db/count/:count', function(req, res) {
  if (!isNaN(req.params.count)) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("demo");
      var count = req.params.count;
      var limit = 30;
      var skip = parseInt(count) * limit;
      var now = Date.now();
      console.log(now);

      dbo.collection('a').aggregate([{
          $unwind: "$out"
        },
        {
          $group: {
            '_id': "$tx.h",
            'blk': {
              $first: "$blk"
            },
            'out': {
              $first: "$out"
            }
          }
        },
        {
          $sort: {
            'out.s5': -1
          }

        },
        {
          $match: {
            $and: [{
              'out.s3': "entry"
            }, {
              "$expr": {
                "$lt": [{
                  "$toLong": "$out.s5"
                }, now]
              }
            }]
          }
        },
        {
          "$limit": skip + limit
        },
        {
          "$skip": skip
        },
        {
          $lookup: {
            from: "a",
            let: {
              o: "$_id"
            },
            pipeline: [{
                $unwind: '$out'
              },
              {
                $match: {
                  $expr: {
                    $and: [{
                        $eq: ["$out.s6", "$$o"]
                      }, {
                        $eq: ["$out.s3", "upvote"]
                      }

                    ]
                  }
                }
              },
              {
                $group: {
                  '_id': "$tx.h",
                  'blk': {
                    $first: "$blk"
                  },
                  'out': {
                    $first: "$out"
                  },
                  'count': {
                    $sum: 1
                  }
                }
              },
              {
                $group: {
                  '_id': "$out.s6",
                  'count': {
                    $sum: 1
                  },
                }
              },
              {
                $project: {
                  _id: 0,
                  count: 1
                }
              }

            ],
            as: "upvotes"
          }
        },
        {
          $project: {
            _id: 1,
            blk: 1,
            out: 1,
            upvotes: {
              $arrayElemAt: ["$upvotes", 0]
            }
          }
        }

      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        db.close();
        res.send(result);
      })

    });
  } else {
    res.send("Not a number");
  }
});

app.post('/jobs/:jobs/count/:count', function(req, res) {
  if (!isNaN(req.params.count)) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("demo");
      var count = req.params.count;
      var limit = 30;
      var skip = parseInt(count) * limit;
      var now = Date.now();
      console.log(now);

      dbo.collection('a').aggregate([{
          $unwind: "$out"
        },
        {
          $group: {
            '_id': "$tx.h",
            'blk': {
              $first: "$blk"
            },
            'out': {
              $first: "$out"
            }
          }
        },
        {
          $sort: {
            'out.s5': -1
          }

        },
        {
          $match: {
            $and: [{
              'out.s3': "job"
            }, {
              "$expr": {
                "$lt": [{
                  "$toLong": "$out.s5"
                }, now]
              }
            }]
          }
        },
        {
          "$limit": skip + limit
        },
        {
          "$skip": skip
        }

      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        db.close();
        res.send(result);
      })

    });
  } else {
    res.send("Not a number");
  }
});

app.post('/tx/:tx', function(req, res) {
  if (req.params.tx !== undefined) {
    var tx = req.params.tx;
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("demo");

      dbo.collection('a').aggregate([{
          $unwind: "$out"
        },
        {
          $group: {
            '_id': "$tx.h",

            'blk': {
              $first: "$blk"
            },
            'out': {
              $first: "$out"
            }
          }
        },
        {
          $sort: {
            'out.s5': 1
          }
        },
        {
          $match: {
            $or: [{
              $and: [{
                '_id': tx
              }, {
                'out.s3': "entry"
              }]
            }, {
              $and: [{
                'out.s6': tx
              }, {
                'out.s3': "comment"
              }]
            }]
          }
        }

      ]).toArray(function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        db.close();
        res.send(result);
      })

    });
  } else {
    res.send("Not a number");
  }
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
