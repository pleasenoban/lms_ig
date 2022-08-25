import cookieParser from "cookie-parser";
import express from "express";
import { nanoid } from "nanoid/async";
import JSONdb from "simple-json-db";
const app = express.Router();

const users = new JSONdb("./db/users.json", {
    asyncWrite: true
});

const sessionids = new JSONdb("./db/sessionids.json", {
    asyncWrite: true
});

app.use(cookieParser());

app.post("/login", async (req, res) => {
    let username = req.query.username;
    let password = req.query.password;
    if (username === undefined || password === undefined) {
        res.status(400).send("no username or password query param");
        return;
    }
    if ((!users.has(username)) || (users.get(username) !== password)) {
        res.status(400).send("invalid username or password");
        return;
    }
    let id = await nanoid(36);
    while (sessionids.has(id)) {
        id = await nanoid(36);
    }
    sessionids.set(id, username);
    res.status(200).cookie("id", id, { maxAge: 2147483647 }).send("login successful");
})

app.post("/signup", async (req, res) => {
    let username = req.query.username;
    let password = req.query.password;
    if (username === undefined || password === undefined) {
        res.status(400).send("no username or password query param");
        return;
    }
    if (users.has(username)) {
        res.status(400).send("user already registered");
        return;
    }
    // too lazy to add hashing so deal with it lmao
    users.set(username, password);
})

app.get("/userinfo", async (req, res) => {
    let id = req.cookies.id;
    if (sessionids.has(id)) {
        res.status(200).json({
            username: sessionids.get(id)
        });
    } else {
        res.status(400).send("invalid user id");
    }
});

export default app;