const express = require("express");
const app = express();
const http = require("http").createServer(app);
const fs = require("fs");
const {fromFS} = require("./FS-endpoints");
const bodyParser = require("body-parser")
const cors = require('cors');
const privateKey  = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.crt', 'utf8');

const credentials = {key: privateKey, cert: certificate};

const https = require('https').createServer(credentials, app);

app.use(bodyParser.raw({type:"application/octet-stream", limit: "200mb"}));
const port = 3000;

app.use(cors({origin: 'https://daqy.dev/'}));

app.post("/folder", async function(req, res) {
  const name = req.query.name;
  const path = req.query.path;

  const response = await fromFS().requestUploadFolder(name, path);
  res.send(response);
});

app.post("/file", async function(req, res) {
  const name = req.query.name;
  const path = req.query.path;

  const response = await fromFS().requestUploadFile(name, path, req.body);
  res.send(response);
});

app.get("/api/file", async function(req, res) {
  const filename = req.query.name;
  let path = req.query.path;

  if (path == undefined || path == '/') {
    path = 'root';
  };

  const extension = filename.split(".")[1];

  const file = await fromFS().getFile(filename, path);
  const headerContent = getHeader(extension, file.length);
  res.writeHead(200, headerContent);
  res.end(file);
});
  

app.get("/api/folder", async function(req, res) {
  let foldername = req.query.name;
  console.log(foldername);
  if (foldername === undefined || foldername === '') {
    foldername = "root"
  }
  const folderStructure = await fromFS().getFolder(foldername);
  
  res.send(folderStructure);
});

app.delete("/file/:filename", async function(req, res) {
  const filename = req.params.filename;
  let path = req.query.path;

  if (path == undefined || path == '/') {
    path = 'root';
  };

  const response = await fromFS().deleteFile(filename, path);
  res.send(response)
})

app.delete("/folder/:foldername", async function(req, res) {
  const foldername = req.params.foldername;

  const response = await fromFS().deleteFolder(foldername);
  res.send(response)
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

https.listen(8443, () => {
  console.log(`listening on *:${8443}`);
});

function getHeader(extension, length) {
  if (extension=="png") {
    return {
      "Content-Type": "image/png",
      "Content-Length": length
    }
  }
  if (extension=="mp4") {
    return {
      "Content-Type": "video/mp4",
      "Content-Length": length
    }
  }
  return {
    "Content-Type": "text/plain",
    "Content-Length": length
  }
}