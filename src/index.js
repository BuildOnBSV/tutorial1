const {
  planaria
} = require("neonplanaria")
const MongoClient = require('mongodb')
var db
const connect = (cb) => {
  MongoClient.connect("mongodb://localhost:27017", {
    useNewUrlParser: true
  }, (err, client) => {
    if (err) {
      console.log("retrying...")
      setTimeout(() => {
        connect(cb)
      }, 1000)
    } else {
      db = client.db("demo")
      cb()
    }
  })
}
planaria.start({
  filter: {
    "from": 604000,
    "q": {
      "find": {
        "out.s2": "building on bsv!"
      },
      "project": {
        "out.s3": 1,
        "out.s4": 1,
        "out.s5": 1,
        "out.s6": 1,
        "out.s7": 1
      }
    }
  },
  onmempool: async (e) => {
    await db.collection("a").insertMany([e.tx])
  },
  onblock: async (e) => {
    await db.collection("a").insertMany(e.tx)
  },
  onstart: (e) => {
    return new Promise(async (resolve, reject) => {
      if (!e.tape.self.start) {
        await planaria.exec("sudo", ["docker", "pull", "mongo:4.0.4"])
        await planaria.exec("sudo", ["docker", "run", "--restart=always", "-d", "-p", "27017-27019:27017-27019", "--name", "mongo", "-v", process.cwd() + "/db:/data/db", "mongo:4.0.4"])
        await planaria.exec("sudo", ["docker", "build", "-t", "app", "app/."])
        await planaria.exec("sudo", ["docker", "run", "--restart=always", "-d", "-p", "80:4000", "--link", "mongo:mongo", "--name", "app", "app"])
      }
      connect(() => {
        if (e.tape.self.start) db.collection("a").deleteMany({
          "blk.i": {
            "$gt": e.tape.self.end
          }
        }).then(resolve)
        else resolve()
      })
    })
  }
})
