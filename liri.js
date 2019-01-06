require("dotenv").config();

var keys = require("./keys");
var axios = require("axios");
var moment = require("moment");
var fs = require("fs");
var Spotify = require("node-spotify-api");
var spotify = new Spotify(keys.spotify);
var omdbKey = keys.omdb.key;

// testing argv commands to format user input
// console.log("0: " + process.argv[0]);
// console.log("1: " + process.argv[1]);
// console.log("2: " + process.argv[2]);
// console.log("3: " + process.argv[3]);
// console.log("4: " + process.argv.slice(3).join('-'));

var inputOne = process.argv[2];
var inputTwo = process.argv.slice(3).join(' ');

function actionSelector(action, search) {
    switch (action) {
        case "spotify-this-song":
            querySong(search);
            break;
        case "concert-this":
            queryConcert(search);
            break;
        case "movie-this":
            queryMovie(search);
            break;
        case "do-what-it-says":
            random();
            break;
        default:
            console.log("Command not recognised...");
    }
}
actionSelector(inputOne, inputTwo);



// searches spotify api for song info
function querySong(search) {
    // console.log("switch test querySong function + data: " + search);
    if (search === undefined) {
        search = "The Sign";
    }
    console.log("search var == " + search);
    spotify.search({ type: 'track', query: search }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        //    figuring out object
        //   console.log(data.tracks.items[3].artists.name); When I use this version I get the name + undefined.
        // console.log(data.tracks.items[3].artists.map(artist => artist.name)[0]);
        var results = data.tracks.items;
        // loop trough songs returned
        for (var i = 0; i < data.tracks.items.length; i++) {
            console.log(`
${i}
Artist: ${results[i].artists.map(artist => artist.name)[0]}
Song name: ${results[i].name}
Preview Link: ${results[i].preview_url}
Album: ${results[i].album.name}\n`);

        }
    });
};
// searches for concerts by band name using axios in the bands in town api
function queryConcert(search) {
    console.log(`Search var = ${search}`);
    // console.log("switch test queryConcert function + data: " + search);
    var concertQueryURL = "https://rest.bandsintown.com/artists/" + search + "/events?app_id=codingbootcamp";
    axios.get(concertQueryURL).then(function (response) {
        // console.log(response.data);

        if (response.data.length === 0) {
            return console.log(`no upcomming events found for ${search}`);
        }
        for (var i = 0; i < response.data.length; i++) {
            console.log(`
            EVENTS
             (${i + 1})
Artist: ${response.data[i].lineup[0]}
Venue: ${response.data[i].venue.name}
City: ${response.data[i].venue.city}, ${response.data[i].venue.region}${response.data[i].venue.country}
Date: ${moment(response.data[i].datetime).format("MM/DD/YYYY")}`)
        }
    })
};
// searches movie info using axios in the OMBD database
function queryMovie(search) {
    // console.log("switch test queryMovie function + data: " + search);
    if (search === undefined) {
        search = "Mr. Nobody";
    }
    var movieQueryURL = "http://www.omdbapi.com/?t=" + search + "&y=&plot=full&tomatoes=true&apikey=" + omdbKey;

    axios.get(movieQueryURL).then(function(response){
        // console.log(response.data);
        var movie = response.data;
        console.log(`
Title: ${movie.Title}
Rating: ${movie.Rated}
Release Year: ${movie.Year}
IMDB Rating: ${movie.imdbRating}
Rotton Tomatoes Rating: ${movie.tomatoRating}
Origin Country: ${movie.Country}
Language: ${movie.Language}
Cast: ${movie.Actors}
PLOT:
        ${movie.Plot}`);

    })
};
// executes command in the random.txt file
function random() {
    // console.log("switch test random function");
    fs.readFile("random.txt", "utf8", function(error, data) {
        
        var fsData = data.split(",");

        if (fsData.length === 1) {
            actionSelector(fsData[0]);
        } else if (fsData.length === 2) {
            actionSelector(fsData[0], fsData[1]);
        }
    
    });
    
};