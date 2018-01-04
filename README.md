## This is the ui version of [youtube-schedule](https://github.com/AUTplayed/youtube-schedule)

### Prerequisites

- nodejs
- npm
- ffmpeg

#### Youtube v3 api key
put your api key in a file called .env in the root of this project like this:

```
apiKey=<yourkey>
```
if you don't have one yet, you can get one for free at https://console.developers.google.com
or
[here](https://developers.google.com/youtube/v3/getting-started) is step by step tutorial to get your own youtube v3 api key by google itself.  

### How to start

Inside the project folder, run

```
npm install
```

To start the program, run 
```
node index.js
```

The browser should open the webpage automatically. If it doesn't, open "http://127.0.0.1:8080" manually.
