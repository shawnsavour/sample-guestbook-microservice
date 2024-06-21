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

// retrieve the existing entries
app.get("/reader/entries", cors(), async function (req, res, next) {
  console.log('In route - get entries');
  try {
    const snapshot = await firestore.collection(collectionName).get();
    let fetchedEntries = snapshot.docs.map(doc => doc.data());
    let entries = {
      entries: fetchedEntries.map(entry => {
        return {
          name: entry.name,
          email: entry.email,
          comment: entry.comment,
          createdAt: entry.createdAt,
          icon: (entry.email ? `https://secure.gravatar.com/avatar/${md5.hash(entry.email.trim().toLowerCase())}?s=64` : null)
        };
      })
    };
    console.log('Get entries successful');
    return res.json(entries);
  } catch (error) {
    console.log('Get entries failed');
    return res.status(500).json({
      message: 'Get entries failed.',
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
