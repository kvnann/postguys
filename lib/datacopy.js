var helpers = require("./helpers")
const { MongoClient } = require('mongodb');
const config = require("./config")

const url = config.dbUrl
const dbName = config.dbName

const client = new MongoClient(url);


var lib = {}






lib.create = function(dir,data,callback){
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err})
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var findResult = false;
                findResult = await collection.find({fileName:data.fileName}).toArray();
                if(findResult && findResult.length > 0){
                    callback({"Error":"This user is already registered"})
                }
                else{
                    var insertResult = false;
                    insertResult = await collection.insertOne(data);
                    if(insertResult){
                        callback(false)
                    }
                    else{
                        callback({"Error" : "Couldn't create new user"})
                    }
                }

            }
        });
      }
      
      main()
        .catch((err)=>{
            callback({"Error":err});
        })
        .finally(() => client.close());
};

lib.read = function(dir,fileName,callback){
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err});
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var findResult = false;
                findResult = await collection.find({fileName:fileName}).toArray();
                if(findResult && findResult.length > 0){
                    findResult[0].password = typeof(findResult[0].password) == 'string' ? findResult[0].password : false;
                    if(findResult[0].password){
                        delete findResult[0].password;
                    }
                    callback(false,findResult[0]);
                }
                else{
                    callback({"Error" : "Couldn't read user, it may not exist"})
                }
            }
        });
      }
      
      main()
        .catch((err)=>{
            callback({"Error":err});
        })
        .finally(() => client.close());

}

lib.readId = function(dir,id,callback){
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err});
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var findResult = false;
                findResult = await collection.find({_id:id}).toArray();
                if(findResult && findResult.length > 0){
                    findResult[0].password = typeof(findResult[0].password) == 'string' ? findResult[0].password : false;
                    if(findResult[0].password){
                        delete findResult[0].password;
                    }
                    callback(false,findResult[0]);
                }
                else{
                    callback({"Error" : "Couldn't read user, it may not exist"})
                }
            }
        });
      }
      
      main()
        .catch((err)=>{
            callback({"Error":err});
        })
        .finally(() => client.close());

}

lib.readIdWithPass = function(dir,user_id,callback){
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err});
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var findResult = false;
                findResult = await collection.find({_id:user_id}).toArray();
                if(findResult && findResult.length > 0){
                    callback(false,findResult[0]);
                }
                else{
                    callback({"Error" : "Couldn't read user, it may not exist"})
                }
            }
        });
      }
      
      main()
        .catch((err)=>{
            callback({"Error":err});
        })
        .finally(() => client.close());

}

lib.update = (dir, fileName ,data,callback)=>{
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err})
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var findResult = false;
                findResult = await collection.find({fileName:fileName}).toArray();
                if(findResult && findResult.length > 0){
                    const deleteResult = await collection.deleteMany({ fileName: fileName });
                    if(deleteResult){
                        var insertResult = false;
                        insertResult = await collection.insertOne(data);
                        if(insertResult){
                            callback(false,data);
                        }
                        else{
                            callback({"Error" : "Couldn't create data"})
                        }
                    }
                    else{
                        callback({"Error":"Couldn't delete old item"})
                    }
                }
                else{
                    callback({"Error" : "Couldn't find data, it may not exist"})
                }
            }
        });
      }
      
      main()
        .catch((err)=>{
            callback({"Error":err});
        })
        .finally(() => client.close());
}

lib.updateId = (dir, user_id ,data,callback)=>{
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err})
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var findResult = false;
                findResult = await collection.find({_id:user_id}).toArray();
                if(findResult && findResult.length > 0){
                    const deleteResult = await collection.deleteMany({ _id: user_id });
                    if(deleteResult){
                        var insertResult = false;
                        insertResult = await collection.insertOne(data);
                        if(insertResult){
                            callback(false,data);
                        }
                        else{
                            callback({"Error" : "Couldn't create data"})
                        }
                    }
                    else{
                        callback({"Error":"Couldn't delete old item"})
                    }
                }
                else{
                    callback({"Error" : "Couldn't find data, it may not exist"})
                }
            }
        });
      }
      
      main()
        .catch((err)=>{
            callback({"Error":err});
        })
        .finally(() => client.close());
}


lib.delete = (dir,fileName,callback)=>{
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err})
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var deleteResult = false;
                deleteResult = await collection.deleteMany({ fileName: fileName });
                if(deleteResult){
                    callback(false)
                }
                else{
                    callback({"Error" : "Couldn't delete data"})
                }
            }
        });
      }
      
      main()
      .catch((err)=>{
        callback({"Error":err});
      })
      .finally(() => client.close());
}

lib.deleteId = (dir,id,callback)=>{
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err})
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var deleteResult = false;
                deleteResult = await collection.deleteMany({ _id: id });
                if(deleteResult){
                    callback(false)
                }
                else{
                    callback({"Error" : "Couldn't delete data"});
                }
            }
        });
      }
      
      main()
      .catch((err)=>{
        callback({"Error":err});
      })
      .finally(() => client.close());
}


lib.list = (dir,callback)=>{
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err})
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var result = await collection.find({}).toArray();
                callback(false,result)
            }
        });
      }
      
      main()
      .catch((err)=>{
        callback({"Error":err});
      })
      .finally(() => client.close());
}
lib.search = function(dir,keyword,callback){
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err})
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var findResult = false;
                findResult = await collection.find({fileName:keyword}).toArray();
                if(findResult && findResult.length > 0){
                    callback(false,findResult)
                }
                else{
                    callback({"Error" : "Couldn't read data, it may not exist"})
                }
            }
        });
      }
      
      main()
        .catch((err)=>{
            callback({"Error":err});
        })
        .finally(() => client.close());

}


lib.listById = function(dir,keys,callback){
    async function main() {
        const client = new MongoClient(url);
        client.connect(async function(err){
            if(err){
                callback({"Error":err})
            }else{
                const db = client.db(dbName);
                const collection = db.collection(dir);
                var findResult = [];
                for( const key of keys){
                    let res = await collection.find({_id:key}).toArray()
                    findResult.push(res[0]);
                };
                if(findResult && findResult.length > 0){
                    callback(false,findResult)
                }
                else{
                    callback({"Error" : "Couldn't read data, it may not exist"})
                }
            }
        });
      }
      
      main()
        .catch((err)=>{
            callback({"Error":err});
        })
        .finally(() => client.close());

}


module.exports = lib