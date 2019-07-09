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

app.get('/app/:id', async (req, res) => {
    res.send(await collection.findOne({userId: req.params.id}))
})

// מקבל מידע מהקליינט
app.post('/app', async (req, res) => {
    const {userName, password, email, ifMailNot} = req.body;
    const userId = uuidv1();
    const arrPlant = [];
    const ifAlreadyName = await collection.findOne({userName: userName});
    if (ifAlreadyName){
        res.status(200).json(400)
    }else{
        await collection.insertOne({userName, password, email, ifMailNot, userId, arrPlant});
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
    if(arr.to == "ifEmail"){
        await collection.updateOne({userId: req.params.id}, {$set: {ifMailNot: arr.ifMailNot}});
    }else{
        await collection.updateOne({userId: req.params.id}, {$set: {arrPlant: arr}});
    }
    res.status(200).json('okput')
})

app.delete('/app/:id', async (req, res) => {
    await collection.deleteOne({name: req.params.id});
    res.status(200).json('okput')
})

// שליחת מייל יומי
app.get('/', async (req, res) => {
    res.send('hello')
})

const sendMail = {
       listEmails: [],
   get formatDate(){
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    },
    get day() {
        return new Date().getDay() + 1;
    },
    async findUsersDalyMile(){
        let arrUsersSendMail = await collection.find({ifMailNot: true}).toArray();
        for(let x in arrUsersSendMail){
             for(let y in arrUsersSendMail[x].arrPlant){
                if(arrUsersSendMail[x].arrPlant[y].elk == this.formatDate || arrUsersSendMail[x].arrPlant[y].pruning == this.formatDate){
                   this.listEmails.push(arrUsersSendMail[x].email);
                   break;
                }
                for(let z in arrUsersSendMail[x].arrPlant[y].days){
                    if(arrUsersSendMail[x].arrPlant[y].days[z] == this.day){
                        this.listEmails.push(arrUsersSendMail[x].email);
                    }
                }
             }
        }
        this.sendMail();
    },
    sendMail(){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'dlibi312@gmail.com',
              pass: process.env.PASS
            }
          });
         for(let x in this.listEmails){ 
          var mailOptions = {
            from: 'dlibi312@gmail.com',
            to: this.listEmails[x],
            subject: 'תזכורת למשימה שיש לך לעשות בגינה!',
            text: 'לצפייה במשימה פתח את האפליקצייה - https://gin-apps.herokuapp.com/'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }

    }

}
cron.schedule("40 5 * * *", async ()=> {
    sendMail.findUsersDalyMile()
  });








app.listen(process.env.PORT || 8000, () => {
    console.log('listen...')
})

