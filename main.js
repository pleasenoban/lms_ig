import express from "express";
const port = process.env.PORT || 8080;
const app = express();

import user from "./routes/user.js";

app.use("/", express.static("./static/html"));
app.use("/css", express.static("./static/css"));
app.use("/js", express.static("./static/js"));
app.use("/imgs", express.static("./static/imgs"));

app.use("/", user);

app.get("/", (req, res) => {
    res.redirect("/main.html");
})

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})