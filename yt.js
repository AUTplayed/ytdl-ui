require('dotenv').config();

var baseurl = "https://www.googleapis.com/youtube/v3/";
var key = process.env.apiKey;

var https = require("https");

module.exports.checkPlaylist = checkPlaylist;

function checkPlaylist(url, pagetoken, callback, finished){
    var id = filterId(url, "list");
    var buildurl = baseurl + "playlistItems?part=snippet&maxResults=50&playlistId=" + id + "&key=" + key;
    if(pagetoken) {
        buildurl += "&pageToken="+pagetoken;
    }
    getBody(buildurl, function (res) {
        for(var i = 0; i < res.items.length; i++){
            var item = {};
            item.title = res.items[i].snippet.title;
            item.id = res.items[i].snippet.resourceId.videoId;
            item.thumbnail = res.items[i].snippet.thumbnails.default.url;
            callback(item);
        }
        if(res.nextPageToken) {
            checkPlaylist(url, res.nextPageToken, callback, finished);
        }else {
            finished();
        }
    });
}

function filterId(q, filter) {
    q = q.split("?" + filter + "=")[1];
    q = q.split("&")[0];
    return q;
}

function getBody(url, callback) {
    https.get(url, function (res) {
        var html = '';
        res.on('data', function (data) {
            html += data;
        });
        res.once('end', function () {
            callback(JSON.parse(html));
        })
    }).end();
}
