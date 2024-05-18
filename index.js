const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const app = express();

let currentTrackInfo = {};

const spotifyApi = new SpotifyWebApi({
  clientId: '********************************',
  clientSecret: '********************************',
  redirectUri: 'http://localhost:8888/callback'
});

// Redirect to Spotify login page
app.get('/login', (req, res) => {
  var authorizeURL = spotifyApi.createAuthorizeURL(['user-read-currently-playing', 'user-read-playback-state'], 'state');
  res.redirect(authorizeURL);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi.authorizationCodeGrant(code).then(data => {
    const access_token = data.body['access_token'];
    const refresh_token = data.body['refresh_token'];
    const expires_in = data.body['expires_in'];

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    console.log('access_token:', access_token);
    console.log('refresh_token:', refresh_token);

    console.log(`Sucessfully retreived access token. Expires in ${expires_in} s.`);
    res.send(`
    <html>
      <head>
        <title>Authentication Successful</title>
        <script type="text/javascript">
          // Attempt to close this window automatically after a short delay
          window.onload = function() {
            // Use setTimeout to give the browser time to fully process the JavaScript
            setTimeout(function() {
              window.open('', '_self').close();
            }, 0); // Adjust the delay as needed
          };
        </script>
      </head>
      <body>
        Success! This window will close automatically.
      </body>
    </html>
  `);
  

    setInterval(async () => {
      const data = await spotifyApi.refreshAccessToken();
      const access_token = data.body['access_token'];

      console.log('The access token has been refreshed!');
      console.log('access_token:', access_token);
      spotifyApi.setAccessToken(access_token);
    }, 1800000);
  }).catch(error => {
    console.error('Error getting Tokens:', error);
    res.send(`Error getting Tokens: ${error}`);
  });
});

let currentTrack = { title: 'Not playing', artist: 'N/A', icon: "" };

function fetchCurrentPlayingTrack() {
    spotifyApi.getMyCurrentPlayingTrack()
      .then(data => {
        if (data.body && data.body.is_playing) {
          const trackName = data.body.item.name.length > 20 ? data.body.item.name.substring(0, 20) + '...' : data.body.item.name;
          const artistName = data.body.item.artists.map(artist => artist.name).join(", ");
          const albumImageUrl = data.body.item.album.images[0].url;

          // Update the currentTrack variable
          currentTrack = { title: trackName, artist: artistName, icon: albumImageUrl };
  
          const durationMs = data.body.item.duration_ms;
          const progressMs = data.body.progress_ms;
          const timeLeftMs = durationMs - progressMs;
  
          setTimeout(fetchCurrentPlayingTrack, timeLeftMs + 3000); // Adding a 3 second buffer
        } else {
          console.log("No song is currently playing.");
          setTimeout(fetchCurrentPlayingTrack, 30000); // Check again after 30 seconds if no song is playing
        }
      })
      .catch(error => {
        console.error('Error fetching the currently playing track:', error);
        setTimeout(fetchCurrentPlayingTrack, 30000); // In case of error, retry after 30 seconds
      });
  }

let open
import('open').then(pkg => {
  open = pkg.default;

  app.use(express.static('public'));

  app.listen(8888, () => {
    console.log('HTTP Server up. Now go to http://localhost:8888/login in your browser.');
    open('http://localhost:8888/login');

    fetchCurrentPlayingTrack();
  });

  app.get('/current-track', (req, res) => {
    res.json(currentTrack);
  });

  app.get('/', (req, res) => {
    res.send(`
    <html><head>
    <title>Currently Playing</title>
    <script>
      function fetchCurrentTrack() {
        fetch('/current-track')
          .then(response => response.json())
          .then(data => {
            document.getElementById('track').textContent = data.title;
            document.getElementById('artist').textContent = data.artist;
            document.getElementById('icon').src = data.icon;
          })
          .catch(console.error);

        setTimeout(fetchCurrentTrack, 1000);
      }

      window.onload = fetchCurrentTrack;
    </script>
    <style>
        @font-face {
            font-family: "Bourgeois W00 Medium";
            src: url("https://db.onlinewebfonts.com/t/6dbb2ef49faa5474e0d891864e3a6c2b.eot");
            src: url("https://db.onlinewebfonts.com/t/6dbb2ef49faa5474e0d891864e3a6c2b.eot?#iefix")format("embedded-opentype"),
            url("https://db.onlinewebfonts.com/t/6dbb2ef49faa5474e0d891864e3a6c2b.woff2")format("woff2"),
            url("https://db.onlinewebfonts.com/t/6dbb2ef49faa5474e0d891864e3a6c2b.woff")format("woff"),
            url("https://db.onlinewebfonts.com/t/6dbb2ef49faa5474e0d891864e3a6c2b.ttf")format("truetype"),
            url("https://db.onlinewebfonts.com/t/6dbb2ef49faa5474e0d891864e3a6c2b.svg#Bourgeois W00 Medium")format("svg");
        }
        #track {
            font-family: 'Bourgeois W00 Medium', sans-serif;
            position: absolute; 
            top: -4px; 
            left: 121px;
            color: white;
            font-size: 36;
        }
        #artist {
            font-family: 'Bourgeois W00 Medium', sans-serif;
            position: absolute; 
            top: 36px; 
            left: 121px;
            color: #43afff;
            font-size: 28;
        }
    </style>
  </head>
  <body>
    <img id="icon" src="" width="83" height="83" style="position: absolute; top: 21px; left: 21px;">
    <img id="bar" src="background.png" style="position: absolute; top: 10px; left: 10px;">
    <img id="spotify" src="spotify.png" width="53" height="53" style="position: absolute; top: 36px; left: 490px; ">
    <p id="track">Juliet</p>
    <p id="artist">Cavetown</p>

</body></html>
    `);
  });
});
