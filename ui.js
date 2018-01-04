var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var fs = require("fs");
var pj = require("path").join;
var ytdl = require("ytdl-core");
require('express-ws')(app);
var clients = [];
var prevdownloaded = [];
var curdownload = [];
var path = require("path");
var pj = path.join;

app.use(express.static(path.join(__dirname,"public")));

__dirname = process.cwd();
const downloadpath = pj(pj(__dirname), "dl");
const temppath = pj(pj(__dirname), "temp");
var san = require("sanitize-filename");
var exec = require("child_process").exec;
var opn = require("opn");
var path = require("path");

var yt = require("./yt.js");

if (!fs.existsSync(downloadpath)) {
    fs.mkdirSync(downloadpath);
}
if (!fs.existsSync(temppath)) {
    fs.mkdirSync(temppath);
}

//app.use(express.static(path.join(__dirname,"public")));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

app.ws("/", (ws, req) => {
    clients.push(ws);
    ws.on("close", () => {
        var index = clients.indexOf(ws);
        clients.splice(index, 1);
    });
});

app.post("/check", (req, res) => {
    res.send("ok");
    if (fs.existsSync("downloads")) {
        var file = fs.readFileSync("downloads");
        prevdownloaded = JSON.parse(file);
    }

    yt.checkPlaylist(req.body.url, undefined, (item) => {
        if (prevdownloaded.indexOf(item.id) > -1) {
            item.checked = "";
        } else {
            item.checked = "checked";
        }
        item.status = "Ready";
        item.progresstype = "determinate";
        item.progress = 0;
        curdownload[item.id] = item;
        update(item);
    }, () => {
        update({ alert: "Finished Checking" });
    });
});

app.post("/download", (req, res) => {
    download(req.body.videos);
    res.send("ok");
});

function update(item) {
    clients.forEach((c) => {
        c.send(JSON.stringify(item));
    });
}

app.listen(8080,()=>{
    opn("http://localhost:8080");
});

const videourl = "https://www.youtube.com/watch?v=";
var dlstack;
function download(videos) {
    dlstack = videos;
    multDownload(5);
}

function multDownload(count){
    for(var i = 0; i < count; i++){
        downloadWrap();
    }
}

function downloadWrap(){
    var id = dlstack.shift();
    singleDownload(id,downloadWrap);
}

function singleDownload(id,done) {
    var name = san(curdownload[id].title);
    var event = ytdl(videourl + id);
    var lastpercentage = 0;
    event.on("progress", (chunklen, downlen, totallen) => {
        var percentage = downlen / totallen;
        if (percentage - lastpercentage > 0.05 || percentage == 1) {
            update({ id: id, progress: percentage });
            lastpercentage = percentage;
        }
    });
    event.on("info", (info, format) => {
        event.pipe(fs.createWriteStream(pj(temppath, name + ".mp4")));
        update({ id: id, status: "Downloading" });
    });
    event.on("finish", () => {
        console.log("downloaded",name+".mp4");
        update({ id: id, status: "Converting", progresstype: "indeterminate" });
        extractMp3(id, name, done);
    });
    event.on("error", (err) => {
        console.error(err);
    });
}
function extractMp3(id, name, done) {
    execffmpeg(`ffmpeg -i "${pj(temppath, name)}.mp4" -vn -ar 44100 -ac 2 -ab 192k -f mp3 "${pj(temppath,name)}.mp3"`,()=>{
        console.log("converted", name+".mp3");
        fs.unlink(pj(temppath,name)+".mp4",()=>{
            console.log("deleted", name+".mp4");
        });
        fs.rename(pj(temppath,name)+".mp3",pj(downloadpath,name)+".mp3",(err)=>{
            if(err)console.log(err);
            update({ id: id, status: "Done", progresstype: "determinate" });
            prevdownloaded.push(id);
            savePrev();
            done();
        });
    });
}

function execffmpeg(command,done){
    exec(command,(error,stdout,stderr)=>{
        if(error){
            console.log(error,stderr);
        }
        done();
    });
}

function savePrev(){
    fs.writeFileSync("downloads",JSON.stringify(prevdownloaded,null,2));
}
