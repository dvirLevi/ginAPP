// שימוש בספריית אקספרס
const express = require('express');
// יצירת אינסטנס לספרייה
const app = express();
// ספרייה שקוראת קבצים
const fs = require('fs').promises;
// ספרייה שנותנת גישה לשרת גם מחוצה לו
var cors = require('cors');
// ספרייה שקוראת json שמגיע מ body הקליינט
const bodyParser = require('body-parser');
// ספרייה שיוצרת id
const uuidv1 = require('uuid/v1');

var nodemailer = require('nodemailer');

const mongo = require('mongodb')
// מגדיר זמנים של משימות אוטומטיות
const cron = require("node-cron");

// הגדרת השימוש בספריות
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.use('/', express.static('client'))

// const fileName = 'db.json';


let collection;
async function connectDB() {
const url = process.env.NONGO_URI || 'mongodb://localhost:27017';
const connection = await mongo.connect(url);
const db = connection.db('ginAppDB');
collection = db.collection('ginAppCOL');
};
connectDB()

app.post('/app/conect', async (req, res) => {
    const {userName, password} = req.body;
    const ifUserName = await collection.findOne({userName: userName});
    // console.log(ifUserName.password);
 
    if(ifUserName){ 
        const obj = {
            userName: ifUserName.userName,
            userId: ifUserName.userId,
    }  
    if(password == ifUserName.password){
            res.status(200).json(obj)
        }else{
            res.status(200).json(400)
        }
    } else{
        res.status(200).json(400)
    }
})


cron.schedule("13 22 * * *", function() {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'dlibi312@gmail.com',
          pass: process.env.PASS
        }
      });
      
      var mailOptions = {
        from: 'dlibi312@gmail.com',
        to: 'dvirlevi2@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  });

//   function dendmail(){
//   setInterval(()=>{
//     var transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: 'dlibi312@gmail.com',
//           pass: 'dlibi312312'
//         }
//       });
      
//       var mailOptions = {
//         from: 'dlibi312@gmail.com',
//         to: 'dvirlevi2@gmail.com',
//         subject: 'Sending Email using Node.js',
//         text: 'That was easy!'
//       };
      
//       transporter.sendMail(mailOptions, function(error, info){
//         if (error) {
//           console.log(error);
//         } else {
//           console.log('Email sent: ' + info.response);
//         }
//       });

//   }, 60000 * 1);
// }
// dendmail()

app.get('/app/:id', async (req, res) => {
    res.send(await collection.findOne({userId: req.params.id}))
})

// מקבל מידע מהקליינט
app.post('/app', async (req, res) => {
    const {userName, password} = req.body;
    const userId = uuidv1();
    const arrPlant = [];
    const ifAlreadyName = await collection.findOne({userName: userName});
    if (ifAlreadyName){
        res.status(200).json(400)
    }else{
        await collection.insertOne({userName, password, userId, arrPlant});
        const obj = {
            userName: userName,
            userId: userId,
    }
            res.status(200).json(obj)
    }
})

// מעדכן מידע ספציפי
app.put('/app/:id', async (req, res) => {
    const arr = req.body;
    await collection.updateOne({userId: req.params.id}, {$set: {arrPlant: arr}});
    res.status(200).json('okput')
})

app.delete('/app/:id', async (req, res) => {
    await collection.deleteOne({name: req.params.id});
    res.status(200).json('okput')
})

app.listen(process.env.PORT || 8000, () => {
    console.log('listen...')
})

