### Spotify Overlay for Rocket League

The spotify overlay for rocket league uses the rocket league themed music gui to display music over twitch streams. This overlay uses the song duration to automatically refresh after each song completes so it constantly updates to your current song accurately. 

![image](https://github.com/chrisrca/Spotify-Overlay-for-Rocket-League/assets/104008364/2be26c43-f531-4127-aa50-ef19ab60d14e)

![image](https://github.com/chrisrca/Spotify-Overlay-for-Rocket-League/assets/104008364/578496f3-7ad2-440a-9d09-7b6ccea82701)

### Install

```bash
$ npm install
```
### Run

Create spotify app on the [spotify dashboard](https://developer.spotify.com/dashboard) and add client id and secret into index.js. Add the redirect uri ```http://localhost:8888/callback``` and your spotify account to the app in the dashboard. 

```bash
$ npm start
```

Approve the OAuth request and the overlay will host on http://localhost:8888
