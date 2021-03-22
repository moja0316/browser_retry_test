
const express = require("express");
const app = express();
const port = 3000;

app.use(express.json()); // for parsing application/json

app.get("/", (req, res) => {
    res.status(200).sendFile(__dirname + "/index.html");
});

//こいつは普通に返す
app.post("/hi", (req, res) => {
    console.log("[" + new Date() + "] /hi requrst recieved!! ");
    console.log(req.body);
    res.status(200).json(req.body);
})

// こいつにPOSTするとブラウザは再送を続けるはず
app.post("/sleep", (req, res) => {
    console.log("[" + new Date() + "] /sleep requrst recieved!! ");
    console.log(req.body);
});

app.listen(port, () => {
    console.log("listening on " + port);
});
