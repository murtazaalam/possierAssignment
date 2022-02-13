var express = require('express');
var app = express();
var mongoose = require('mongoose');
var dotenv = require('dotenv');
dotenv.config();
var bodyParser = require('body-parser');
var cors = require('cors');
var db;

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var mongoUrl = process.env.MongoLiveUrl;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
var port = process.env.PORT || 2000;

app.get('/', (req, res) => {
    res.send("default routing");
})

app.get('/allcourses', (req, res) => {
    var limitValue = parseInt(req.query.limit_value);
    var skipValue = parseInt(req.query.skip_value);
    var cost = req.query.cost;
    var level = req.query.level;
    var courseName = req.query.course_name;
    var status = req.query.status;
    if(limitValue && skipValue){
        db.collection('courses').find({status:'active'}).skip(skipValue).limit(limitValue).toArray((err, result) => {
            if(err) throw err;
            res.send(result);
        })
    }
    else if(limitValue){
        db.collection('courses').find({status:'active'}).limit(limitValue).toArray((err, result) => {
            if(err) throw err;
            res.send(result);
        })
    }
    else{
        if(cost){
            if(cost == "0"){
                db.collection('courses').find({$and: [{status:'active'},{price:cost}]}).toArray((err, result) => {
                    if(err) throw err;
                    res.send(result);
                })
            }
        }
        else if(level){
            db.collection('courses').find({$and:[{status:'active'},{level:level}]}).toArray((err, result) => {
                if(err) throw err;
                res.send(result);
            })
        }
        else if(courseName){
            db.collection('courses').find({$and:[{status:'active'},{sub_category_name:courseName}]}).toArray((err, result) => {
                if(err) throw err;
                res.send(result);
            })
        }
        else{
            if(status){
                db.collection('courses').find({status:'active'}).toArray((err, result) => {
                    if(err) throw err;
                    res.send(result);
                })
            }
            else{
                db.collection('courses').find().toArray((err, result) => {
                    if(err) throw err;
                    res.send(result);
                })
            }
            
        } 
    }
})

//all products
app.get('/products', (req, res) => {
    db.collection('products').find().toArray((err, result) =>{
        if(err) throw err;
        res.send(result);
    })
})
//product with respect to id
app.get('/products/:id', (req, res) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    db.collection('products').find({_id: id}).toArray((err, result) =>{
        if(err) throw err;
        res.send(result[0]);
    })
})

//add new product api
app.post('/newproduct', (req, res) => {
    //console.log(req.body);
    db.collection('products').insertOne(req.body, (err, result) => {
        if(err) throw err;
        res.send("Product Added Successfully.");
    })
})

//update api
app.put('/edit/:id', (req, res) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    db.collection('products').updateOne({_id: id}, {
        $set:{ 
            "category_id": req.body.category_id,
            "sub_category_name": req.body.sub_category_name,
            "price": req.body.price,
            "duration": req.body.duration,
            "image": req.body.image,
            "rating": req.body.rating,
            "trainer_name": req.body.trainer_name,
            "level": req.body.level,
            "status": req.body.status
        }
    })
    res.send("Course Updated Successfully.")
})

//mongodb connection
MongoClient.connect(mongoUrl, (err, client) => {
    if(err) console.log("Error while connecting to MongoDB.");
    db = client.db('possier');
    app.listen(port, () =>{
        console.log("listening to port: " + port);
    })
})
