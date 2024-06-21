// load required modules
var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
const md5 = require('spark-md5');
const { Firestore } = require('@google-cloud/firestore');
const { json } = require('body-parser');
// load local .env if present
require("dotenv").config();

// enable parsing of http request body
app.use(bodyParser.urlencoded({ extended: false }));
// load required modules
var app = express();
// load local .env if present
require("dotenv").config();
// enable parsing of http request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
// set the database name
const collectionName = 'guestbook';
let firestore;

// initialize Firestore
async function initializeFirestore() {
  const firestoreOptions = {
    // projectId: process.env.GCP_PROJECT_ID,
    // keyFilename: process.env.GCP_KEYFILE_PATH,
  };
  firestore = new Firestore(firestoreOptions);
  console.log('Firestore initialized');
}

// create mydb collection if it does not already exist
async function createCollectionIfNotExists() {
  const collectionRef = firestore.collection(collectionName);
  const collectionSnapshot = await collectionRef.get();
  if (collectionSnapshot.empty) {
    await collectionRef.doc(); // create a dummy document to create the collection
    console.log(collectionName + ' collection created');
  } else {
    console.log(collectionName + ' collection already exists');
  }
}

// add a new entry with timestamp info for sorting
app.post("/commenter/entries", cors(), async function (req, res, next) {
  console.log('In route - add entry');
  let entry = {
    createdAt: new Date().toISOString(),
    name: req.body.name,
    email: req.body.email,
    comment: req.body.comment
  };
  try {
    const docRef = await firestore.collection(collectionName).add(entry);
    const addedEntry = await docRef.get();
    console.log('Add entry successful');
    return res.status(201).json({
      _id: addedEntry.id,
      name: addedEntry.data().name,
      email: addedEntry.data().email,
      comment: addedEntry.data().comment,
      createdAt: addedEntry.data().createdAt
    });
  } catch (error) {
    console.log('Add entry failed');
    return res.status(500).json({
      message: 'Add entry failed.',
      error: error,
    });
  }
});

app.get('/', (req, res) => {
  res.send('healthy');
});

// serve static file (index.html, js, css)
// app.use(express.static(__dirname + '/views'));

var port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log("To view your app, open this link in your browser: http://localhost:" + port);
});

// initialize Firestore and create collection
initializeFirestore().then(() => {
  createCollectionIfNotExists();
});
