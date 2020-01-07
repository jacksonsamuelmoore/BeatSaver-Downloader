const axios = require('axios');
var unzip = require('unzip-stream');
var rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000, maxRPS: 2 })
async function getList(ammount) {
    console.log("Getting URLs list")
    var urls = [];
    for (i = 0; i < ammount; i++) {
        console.log('\nGetting page ' + i)
        await http.get("https://beatsaver.com/api/maps/downloads/" + i).then(resp => {
            resp.data.docs.forEach((i) => {
                urls.push([i.directDownload, i.key + " (" + i.metadata.songName.replace(/[&\/\\#,+()$~%.'"|:*?<>{}]/g, '') + " - " + i.metadata.songAuthorName.replace(/[&\/\\#,+()$~%.'"|:*?<>{}]/g, '') + ")"])
            });
        })
    }
    return urls
}
function downloader(path, pages) {
    getList(pages, logs).then(res => {
        console.log("\nDone")
        res.forEach((i) => {
            console.log("\nGetting " + i[1])
            http({
                method: "get",
                url: "https://beatsaver.com" + i[0],
                responseType: "stream"
            }).then(function (response) {
                console.log("\nWriting " + i[1])
                response.data.pipe(unzip.Extract({ path: path + i[1] }))
            })

        })
    }, err => console.log('\n' + err))
}
// downloader('./done/',1)