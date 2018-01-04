## This is the ui version of [youtube-schedule](https://github.com/AUTplayed/youtube-schedule)

![img](https://i.imgur.com/2XznDD3.png)

### Prerequisites

- nodejs
- npm
- ffmpeg

#### Youtube v3 api key
put your api key in a file called .env in the root of this project like this:

```
apiKey=<yourkey>
```
If you don't have one yet, you can get one for free: 

[step by step tutorial to get your own youtube v3 api key](https://developers.google.com/youtube/v3/getting-started). 

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
