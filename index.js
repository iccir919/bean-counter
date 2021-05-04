
require('dotenv').config();
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const plaid = require('plaid');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

const PORT = process.env.PORT || 8000;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://beam-fdfaa-default-rtdb.firebaseio.com"
});

const databseRef = firebaseAdmin.database();


const app = express();
app.use(express.static('public'));
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());



app.get('/', function (req, res, next) {
    res.sendFile('./views/index.html', { root: __dirname });
});

app.get('/user/:uid', function(req, res) {
    const userRef = databseRef.ref(`users/${req.params.uid}`)
    userRef.once("value")
        .then(function(snapshot) {
            if (snapshot.exists()) {
                res.sendFile('./views/profile.html', { root: __dirname });
            } else {
                firebaseAdmin
                    .auth()
                    .getUser(req.params.uid)
                    .then((userRecord) => {
                        const usersRef = databseRef.ref("users");
                        usersRef.child(req.params.uid).set({
                            email: userRecord.email,
                            createdAt: Date.now(),
                            displayName: userRecord.displayName
                        }, function() {
                            res.sendFile('./views/profile.html', { root: __dirname });
                        })
                    })
                    .catch((error) => {
                        console.log('Error fetching user data:', error);
                    });
            }
        })
});

app.post('/api/accounts/get', function(req, res) {
    console.log("POST request made to /api/accounts/get")
    console.log("  Body: ", req.body);

    res.json({ accounts: [] })
})

const server = app.listen (PORT, function () {
    console.log('Beam server listening on port ' + PORT);
});

const prettyPrintResponse = response => {
    console.log(util.inspect(response, { colors: true, depth: 4 }))
};
