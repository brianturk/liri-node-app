var fs = require('fs');
var moment = require('moment');
var line = '---------------------------\r\n'

var command = "";
if (process.argv.length > 2) {
    command = process.argv[2];
};

var name = "";
//Handle multi-word names
for (var x = 3; x < process.argv.length; x++) {
    name = name + ' ' + process.argv[x];
}
name = name.trim();


//Add to log file what they typed in
var logTime = moment().format("MM/DD/YY hh:mm:ss A")
fs.appendFile('log.txt', line + logTime + '==> ' + command + ' ' + name + '\r\n' + line, function (err) {
    if (err) {
        console.log("Log file write error: " + err);
    }
    takeAction(command, name);
});


/*
 * Records the console message to the log.txt file and writes to the screen.  
 * @param {message}     Message to record
 * @param {fn}          Optional callback
 */
function logMessage(message, fn) {

    fs.appendFile('log.txt', message + '\r\n', function (err) {
        if (err) {
            console.log("Log file write error: " + err);
        }
        console.log(message);

        if (fn) {
            fn();
        }
    });

}


/*
 * Goes to the specific action based on the user input  
 * @param {command}     Command to perform
 * @param {name}        Paramter to the command
 */
function takeAction(command, name) {
    switch (command) {
        case 'concert-this':
            getConcerts(name);
            break;
        case 'spotify-this-song':
            getSongs(name);
            break;
        case 'movie-this':
            getMovies(name);
            break;
        case 'do-what-it-says':
            doFile()
            break;
        default:
            logMessage("Invalid command.  Valid commands are 'concert-this <artist/band name here>', 'spotify-this-song <song name here>', 'movie-this <movie name here>', and 'do-what-it-says'")
    }
}


/*
 * Run command in file random.txt  
 */
function doFile() {
    fs.readFile('random.txt', 'utf8', function (error, data) {

        if (error) {
            logMessage(error);
        } else {

            var commaLoc = data.indexOf(',');

            if (commaLoc != -1) {
                data = data.trim();
                var command = data.substring(0, commaLoc).trim();
                var name = data.substring(commaLoc + 1, data.length).trim();
                var finalMessage = "";

                finalMessage = '\r\nCommand ==> ' + command + '\r\n';
                finalMessage += 'Parameter ==> ' + name + '\r\n';
                logMessage(finalMessage, function () {  //callback here so first log message will finish before takeAction logs a message

                    takeAction(command, name);

                });

            } else {
                logMessage('Invalid command in "random.txt" file.');
            }
        }

    });

}


/*
 * Get movie information from OMDB API  
 * @param {name}        Name of movie
 */
function getMovies(name) {
    var axios = require('axios');

    if (name === '') {      //if no movie name specified then return this one
        name = 'Mr. Nobody';   
    }

    axios
        .get("http://www.omdbapi.com/?t=" + name + "&y=&plot=short&apikey=trilogy")
        .then(function (response) {

            var item = response.data;

            if (item.Response === 'False') {
                logMessage('Error message from OMDBAPI: ' + item.Error)
            } else {
                var finalMessage = "";

                finalMessage = 'Movie Information\r\n';
                finalMessage += line;
                finalMessage += 'Title: ' + item.Title + '\r\n'
                finalMessage += 'Year: ' + item.Year + '\r\n'
                finalMessage += 'IMDB Rating: ' + item.imdbRating + '\r\n'

                item.Ratings.forEach(function (rating) {
                    if (rating.Source === 'Rotten Tomatoes') {
                        finalMessage += 'Rotten Tomatoes Rating: ' + rating.Value +
                            '\r\n'
                    }
                })

                finalMessage += 'Country Where Produced: ' + item.Country + '\r\n';
                finalMessage += 'Language: ' + item.Language + '\r\n';
                finalMessage += 'Plot: ' + item.Plot + '\r\n';
                finalMessage += 'Actors: ' + item.Actors + '\r\n'
                finalMessage += line;

                logMessage(finalMessage);
            }
        })
        .catch(function (error) {
            if (error.response) {
                logMessage(error.response.data);
                logMessage(error.response.status);
                logMessage(error.response.headers);
            } else if (error.request) {
                logMessage(error.request);
            } else {
                logMessage("Error", error.message);
            }
            logMessage(error.config);
        });
}


/*
 * Get all the songs with a specified word(s) in the track name  
 * @param {name}        Song name
 */
function getSongs(name) {
    require("dotenv").config();
    var keys = require("./keys.js");
    var Spotify = require('node-spotify-api');

    var spotify = new Spotify(keys.spotify);

    if (name === '') {
        name = 'track:The Sign artist:Ace of Base';   //can restrict to the one artist this way
    } else {
        name = 'track: ' + name;
    }

    spotify
        .search({ type: 'track', query: name })
        .then(function (response) {

            if (response.tracks.items.length === 0) {
                logMessage('Song not found!')
            } else {
                var itemNum = 1;
                var artistNum = 1;
                var previewURLLabel = "";
                var previewURLValue = "";
                var finalMessage = "";

                response.tracks.items.forEach(function (item) {

                    finalMessage += 'Song #' + itemNum + '\r\n';
                    finalMessage += line;

                    if (item.artists.length === 1) {
                        finalMessage += 'Artist: ' + item.artists[0].name + '\r\n'
                    } else {
                        item.artists.forEach(function (artistItem) {
                            finalMessage += 'Artist #' + artistNum + ': ' + artistItem.name + '\r\n'
                            artistNum++
                        })
                        artistNum = 1;
                    }

                    finalMessage += 'Song Name: ' + item.name + '\r\n'

                    if (item.preview_url === null) {   //no preview available, provide Spotify URL instead
                        previewURLLabel = 'Spotify URL: '
                        previewURLValue = item.external_urls.spotify;
                    } else {
                        previewURLLabel = 'Preview URL: '
                        previewURLValue = item.preview_url;
                    }
                    finalMessage += previewURLLabel + previewURLValue + '\r\n'
                    finalMessage += 'Album Name: ' + item.album.name + '\r\n'
                    finalMessage += line;
                    finalMessage += '\r\n'

                    itemNum++
                })

                logMessage(finalMessage);
            }
        })
        .catch(function (err) {
            logMessage(err);
        });
}


/*
 * Get all the concerts for a specified artist/band 
 * @param {name}        Artist/band
 */
function getConcerts(name) {
    var axios = require('axios');

    if (name === '') {
        logMessage('No artist specified.  Proper syntax is "concert-this <artist/band name here>".')
    } else {
        axios
            .get("https://rest.bandsintown.com/artists/" + name + "/events?app_id=codingbootcamp")
            .then(function (response) {

                if (response.data.length === 0) {
                    logMessage('No concerts found!')
                } else {
                    var itemNum = 1;
                    var finalMessage = "";

                    response.data.forEach(function (item) {

                        finalMessage += 'Concert #' + itemNum + '\r\n';
                        finalMessage += line;
                        finalMessage += 'Venue Name: ' + item.venue.name + '\r\n';
                        finalMessage += 'Venue Location: ' + item.venue.city + ', ' + item.venue.country + '\r\n';
                        finalMessage += 'Date: ' + moment(item.datetime).format('MM/DD/YYYY') + '\r\n';
                        finalMessage += line;
                        finalMessage += '\r\n';

                        itemNum++
                    })

                    logMessage(finalMessage);
                }
            })
            .catch(function (error) {
                if (error.response) {
                    logMessage(error.response.data);
                    logMessage(error.response.status);
                    logMessage(error.response.headers);
                } else if (error.request) {
                    logMessage(error.request);
                } else {
                    logMessage("Error", error.message);
                }
                logMessage(error.config);
            });
    }
}
