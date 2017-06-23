/*  ----------------------------
		    Server Stuff 
	-----------------------------
*/
var express = require('express');
var app = express();
var path = require('path');
var mysql = require("mysql");
var _ = require('lodash');

// Connection to db
var con = mysql.createConnection({
	host: "localhost",
	user: "user", 
	password: "password", 
	database: "thehipsterthesaurus"
});

var userSynonymID;
var userLookUpID;

// Home path

app.use(express.static(__dirname + '/hipster/public'));

app.get('/hipster', function (req, res) {
  res.sendFile(path.join(__dirname + '/hipster/public/index.html'));
});

/*  ----------------------------
		    App Functionality 
	-----------------------------
*/

app.get('/hipster/search', function(req, res) {
  // input value from search
  var val = req.query.search;
  // Search promise chain, return data to client
	getLookupId(val)
    .then(getSynonyms) 
    .then(function(wordData){
		res.send(wordData);
	})
    .catch(function(err) {
        console.log(`catch() block - err = ${err}`);
        res.status(400).send('Not Found');
    });
});

// Get unique word ID from searched word
function getLookupId(word) {
    return new Promise(function(resolve, reject) {
        // Debugging log
         console.log(`getLookupId - word = ${word}`);
        // DB call for ID using the user's inputted word
        con.query(`select lookupID from lookup where wordname = ${mysql.escape(word)}`, function(err, resp) {
            if(err) throw err;
	        if (resp.length == 0) {
                reject(new Error ('No data returned for ' + word), null);
                return;
            }
            if(err) reject(err);
            // Get the ID
   	        var userLookUpID = resp[0].lookupID;
            resolve(userLookUpID);
        });
    });
}

// Get an array of synonym words + data using the original word ID
function getSynonyms(lookupID) {
    return new Promise(function(resolve, reject) {
        // Debugging log
        console.log(`getSynonyms - lookupId = ${lookupID}`);
        // Get the synonym words and usage data from the lookup table after getting their IDs from the index table
        con.query(`select wordname, usageData from lookup where lookupID in (select synonymnID from dict where lookupID = ${lookupID})`, function(err,rows) {
            // Debugging log
            console.log(`back from two: getSynonyms - lookupId = ${lookupID}`);
	  	    if(err) throw err;
            // Create array of words and data only
            var wordData = rows.map(function(item) {
		        return {word:item.wordname, usage:item.usageData};
	        }, this);
            // Debugging log
		    console.log(`wordData = ${JSON.stringify(wordData)}`);
            // Sort by usage
            const sorted = _.sortBy(wordData, 'usage');
            // Get 10 least common synonyms
            wordData = { 
                least: _.take(sorted, 10)
            };
            resolve(wordData);
        });
    });
}

app.listen(3000, function () {
  console.log('The Hipster Thesaurus listening on port 3000!');
}); 