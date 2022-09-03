import cookieParser from "cookie-parser";
import express from "express";
import { nanoid } from "nanoid/async";
import * as nanonsec from "nanoid/non-secure";
import JSONdb from "simple-json-db";
const app = express.Router();

const users = new JSONdb("./db/users.json", {
    asyncWrite: true
});

const sessionids = new JSONdb("./db/sessionids.json", {
    asyncWrite: true
});

const posts = new JSONdb("./db/posts.json", {
    asyncWrite: true
});

function reverseObj(obj) {
    let retobj = {};
    Object.keys(obj)
        .reverse()
        .forEach(key => {
            retobj[key] = obj[key];
        })
    return retobj;
}

function find(db, query) {
    let retobj = {};
    let lowerquery = query.toLowerCase();
    for (const [key, value] of Object.entries(db)) {
        if (value.title.toLowerCase().includes(lowerquery)) {
            retobj[key] = value;
        }
    }
    return retobj;
}

app.use(cookieParser());

app.use(express.urlencoded({ extended: false }))
app.use(express.json());

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

app.post("/logout", async (req, res) => {
    let id = req.cookies.id;
    if (sessionids.has(id)) {
        sessionids.delete(id);
        res.status(200).clearCookie("id").send("done");
    } else {
        res.status(400).send("not logged in");
    }
})

app.get("/getposts", async (req, res) => {
    res.status(200).json(reverseObj(posts.JSON()));
})

app.post("/createpost", async (req, res) => {
    let id = req.cookies.id;
    let title = req.body.title;
    let body = req.body.body;
    if (sessionids.has(id)) {
        let pid = nanonsec.nanoid(36);
        while (posts.has(pid)) {
            pid = nanonsec.nanoid(36);
        }
        posts.set(pid, {
            creator: sessionids.get(id),
            title: title,
            body: body,
        });
        res.status(200).send("successful");
    } else {
        res.status(401).send("unauthorized");
    }
})

app.get("/search", (req, res) => {
    let query = req.query.searchquery;
    if (query === undefined || query.trim().length === 0) {
        res.status(400).send("invalid request");
    } else {
        res.status(200).json(find(posts.JSON(), query));
    }
})

export default app;