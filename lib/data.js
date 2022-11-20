var helpers = require("./helpers")
const { MongoClient } = require('mongodb');
const config = require("./config")

const url = config.dbUrl
const dbName = config.dbName

var lib = {}

lib.delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
  }


lib.tests = [
    {
        deactive:true
    }
]


lib.create = async function(dir,data,callback){
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:data.fileName,
        type:'name',
        action:'create',
        data:data,
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
};


lib.read = function(dir,fileName,callback){
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:fileName,
        type:'name',
        action:'read',
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}

lib.readId = function(dir,id,callback){
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:id,
        type:'id',
        action:'read',
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}

lib.readWithPass = function(dir,fileName,callback){
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:id,
        type:'name',
        action:'readWithPass',
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}

lib.readIdWithPass = function(dir,id,callback){
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:id,
        type:'id',
        action:'readWithPass',
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}

lib.update = (dir, fileName ,data,callback)=>{
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:fileName,
        type:'name',
        action:'update',
        data:data,
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}

lib.updateId = (dir, id ,data,callback)=>{
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:id,
        type:'id',
        action:'update',
        data:data,
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}


lib.delete = (dir,fileName,callback)=>{
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:fileName,
        type:'name',
        action:'delete',
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}

lib.deleteId = (dir,id,callback)=>{
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:id,
        type:'id',
        action:'delete',
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}

lib.list = (dir,callback)=>{
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:1,
        type:'id',
        action:'list',
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}
lib.search = function(dir,keyword,callback){
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        key:keyword,
        type:'name',
        action:'search',
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}


lib.listById = function(dir,keys,callback){
    lib.tests.splice(lib.tests.length-1, 0,{
        dir:dir,
        keys:keys,
        type:'id',
        action:'listById',
        callback:(err,res)=>{
            callback(err,res)
        },
        indexed:false
    });
}




const clientDb = new MongoClient(url);
clientDb.connect(async (err)=>{
    if(err){
        console.log(err)
    }else{
        const db = clientDb.db(dbName);
        let collection;
        setInterval(async ()=>{
            if(!lib.tests[0].deactive && !lib.tests[0].indexed){
                lib.tests[0].indexed = true;
                if(lib.tests[0].type == 'id'){
                    switch (lib.tests[0].action) {
                        case 'read':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = false;
                            findResult = await collection.find({_id:lib.tests[0].key}).toArray();
                            if(findResult && findResult.length > 0){
                                findResult[0].password = typeof(findResult[0].password) == 'string' ? findResult[0].password : false;
                                if(findResult[0].password){
                                    delete findResult[0].password;
                                }
                                lib.tests[0].callback(false,findResult[0]);
                                lib.tests.splice(0,1);
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't read user, it may not exist"});
                                lib.tests.splice(0,1);
                            }
                            break;
                        case 'readWithPass':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = false;
                            findResult = await collection.find({_id:lib.tests[0].key}).toArray();
                            if(findResult && findResult.length > 0){
                                findResult[0].password = typeof(findResult[0].password) == 'string' ? findResult[0].password : false;
                                lib.tests[0].callback(false,findResult[0]);
                                lib.tests.splice(0,1);
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't read user, it may not exist"});
                                lib.tests.splice(0,1);
                            }
                            break;

                        case 'create':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = false;
                            findResult = await collection.find({_id:lib.tests[0].key}).toArray();
                            if(findResult && findResult.length > 0){
                                lib.tests[0].callback({"Error":"This user is already registered"});
                                lib.tests.splice(0,1);
                            }
                            else{
                                var insertResult = false;
                                insertResult = await collection.insertOne(lib.tests[0].data);
                                if(insertResult){
                                    lib.tests[0].callback(false)
                                    lib.tests.splice(0,1);
                                }
                                else{
                                    lib.tests[0].callback({"Error" : "Couldn't create new user"})
                                    lib.tests.splice(0,1);
                                }
                            }
                            break;
                        case 'update':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = false;
                            findResult = await collection.find({_id:lib.tests[0].key}).toArray();
                            if(findResult && findResult.length > 0){
                                const deleteResult = await collection.deleteMany({ _id: lib.tests[0].key });
                                if(deleteResult){
                                    var insertResult = false;
                                    insertResult = await collection.insertOne(lib.tests[0].data);
                                    if(insertResult){
                                        lib.tests[0].callback(false,lib.tests[0].data);
                                        lib.tests.splice(0,1);
                                    }
                                    else{
                                        lib.tests[0].callback({"Error" : "Couldn't create data"});
                                        lib.tests.splice(0,1);
                                    }
                                }
                                else{
                                    lib.tests[0].callback({"Error":"Couldn't delete old item"});
                                    lib.tests.splice(0,1);
                                }
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't find data, it may not exist"});
                                lib.tests.splice(0,1);
                            }
                            break;
                        case 'delete':
                            collection = db.collection(lib.tests[0].dir);
                            var deleteResult = false;
                            deleteResult = await collection.deleteMany({ _id: lib.tests[0].key });
                            if(deleteResult){
                                lib.tests[0].callback(false);
                                lib.tests.splice(0,1);
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't delete data"});
                                lib.tests.splice(0,1);
                            }
                            break;
                        case 'list':

                            collection = db.collection(lib.tests[0].dir);
                            var result = await collection.find({}).toArray();
                            lib.tests[0].callback(false,result);
                            lib.tests.splice(0,1);
                            break;

                        case 'listById':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = [];
                            for( const key of lib.tests[0].keys){
                                let res = await collection.find({_id:key}).toArray()
                                findResult.push(res[0]);
                            };
                            if(findResult && findResult.length > 0){
                                lib.tests[0].callback(false,findResult)
                                lib.tests.splice(0,1);
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't read data, it may not exist"})
                                lib.tests.splice(0,1);
                            }
                            break;
                        
                        default:
                            break;
                    }
                }
                else{
                    switch (lib.tests[0].action) {
                        case 'read':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = false;
                            findResult = await collection.find({fileName:lib.tests[0].key}).toArray();
                            if(findResult && findResult.length > 0){
                                lib.tests[0].callback(false,findResult[0]);
                                lib.tests.splice(0,1);
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't read user, it may not exist"});
                                lib.tests.splice(0,1);
                            }
                            
                            break;
                        case 'readWithPass':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = false;
                            findResult = await collection.find({fileName:lib.tests[0].key}).toArray();
                            if(findResult && findResult.length > 0){
                                lib.tests[0].callback(false,findResult[0]);
                                lib.tests.splice(0,1);
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't read user, it may not exist"});
                                lib.tests.splice(0,1);
                            }
                            
                            break;

                        case 'create':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = false;
                            findResult = await collection.find({fileName:lib.tests[0].key}).toArray();
                            if(findResult && findResult.length > 0){
                                lib.tests[0].callback({"Error":"This user is already registered"});
                                lib.tests.splice(0,1);
                            }
                            else{
                                var insertResult = false;
                                insertResult = await collection.insertOne(lib.tests[0].data);
                                if(insertResult){
                                    lib.tests[0].callback(false)
                                    lib.tests.splice(0,1);
                                }
                                else{
                                    lib.tests[0].callback({"Error" : "Couldn't create new user"});
                                    lib.tests.splice(0,1);
                                }
                            }
                            break;

                        case 'update':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = false;
                            findResult = await collection.find({fileName:lib.tests[0].key}).toArray();
                            if(findResult && findResult.length > 0){
                                const deleteResult = await collection.deleteMany({ fileName: lib.tests[0].key });
                                if(deleteResult){
                                    var insertResult = false;
                                    insertResult = await collection.insertOne(lib.tests[0].data);
                                    if(insertResult){
                                        lib.tests[0].callback(false,lib.tests[0].data);
                                        lib.tests.splice(0,1);
                                    }
                                    else{
                                        lib.tests[0].callback({"Error" : "Couldn't create data"});
                                        lib.tests.splice(0,1);
                                    }
                                }
                                else{
                                    lib.tests[0].callback({"Error":"Couldn't delete old item"});
                                    lib.tests.splice(0,1);
                                }
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't find data, it may not exist"});
                                lib.tests.splice(0,1);
                            }
                            
                            break;
                        case 'search':
                            collection = db.collection(lib.tests[0].dir);
                            var findResult = false;
                            findResult = await collection.find({fileName:lib.tests[0].key}).toArray();
                            if(findResult && findResult.length > 0){
                                lib.tests[0].callback(false,findResult);
                                lib.tests.splice(0,1);
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't read data, it may not exist"})
                                lib.tests.splice(0,1);
                            }
                            break;

                        case 'delete':
                            collection = db.collection(lib.tests[0].dir);
                            var deleteResult = false;
                            deleteResult = await collection.deleteMany({ fileName: lib.tests[0].key });
                            if(deleteResult){
                                lib.tests[0].callback(false);
                                lib.tests.splice(0,1);
                            }
                            else{
                                lib.tests[0].callback({"Error" : "Couldn't delete data"});
                                lib.tests.splice(0,1);
                            }
                            break;
                    
                        default:
                            break;
                    }
                }
            }
        })
    }
});

module.exports = lib