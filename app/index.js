const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const router = require("./router");
const sanitizeBody = require("./middlewares/sanitize");
var cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();


app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    cors({
        origin: "https://main.d3de9xm2m3lkmk.amplifyapp.com",
    })
);

app.use(sanitizeBody);
app.use(router);

// custom invalid token middleware
app.use(function (err, _, res, next) {
    if (err.name === "UnauthorizedError") {
        return res.status(401).send("Invalid token");
    }

    next();
});

app.use((_, res) => {
    res.send("This is an error");
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
