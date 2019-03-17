# liri-node-app
LIRI Bot  
Author: Brian Turk  
Date: 3/17/19

## [Video Demonstration](https://photos.app.goo.gl/R9jeWfqguMo3akGn7)


## What this project does
This "Liri Bot" is a Node JS application that receives commands and returns results from APIs.  The following commands are accepted:
1. concert-this
2. movie-this
3. spotify-this-song
4. do-what-it-says


### (1) - concert-this
This command will return all the concerts found through the bandsintown.com API for the artist requested.  So 'concert-this beck' will give all the concerts for Beck.

### (2) - movie-this
This command will return the most recent movie with name requested found in the OMDBAPI.com API.  For example 'movie-this happy gilmore' returns the 1996 movie Happy Gilmore.  If no movie is specified, the program returns the movie 'Mr. Nobody'.

### (3) - spotify-this-song
This command will return all songs containing the name specified from the Spotify API.  For example 'spotify-this-song sure shot' will return all songs containging the words 'sure shot' in the track name.  If no song is provided, the program returns the song 'The Sign' by Ace of Base.

### (4) - do-what-it-says
This command will read a command from the file 'random.txt'.  The format for this is the command and then a comma and then the parameter to the command.  For example 'spotify-this-song,hello' put in the file will call the command 'spotify-this-song' with the song name 'hello'.  To run this command just type 'do-what-it-says'
 
## Additional Notes
* All results get logged to log.txt in addition to being output to the console.
* All commands support quotes around the parameter, or no quotes and multiple word parameter.
* To make the Spotify interface work, you will need your own Spotify ID and Spotify Secret.  These can be obtained at spotity.com.  These go in the '.env' file.  This file has two lines:  
SPOTIFY_ID=[your id]  
SPOTIFY_SECRET=[your secret]








