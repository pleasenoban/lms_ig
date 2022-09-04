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

const comments = new JSONdb("./db/comments.json", {
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
        if (title && body) {
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
            res.status(400).send("missing title or body");
        }
    } else {
        res.status(401).send("unauthorized");
    }
})

app.get("/search", (req, res) => {
    let query = req.query.searchquery;
    if (query) {
        res.status(200).json(find(posts.JSON(), query));
    } else {
        res.status(400).send("invalid request");
    }
})

app.post("/createcomment", (req, res) => {
    let userid = req.cookies.id;
    let comment = req.body.comment;
    let postid = req.query.post;
    // if chain go brr
    if (sessionids.has(userid)) {
        if (posts.has(postid)) {
            if (comment) {
                if (comments.get(postid)) {
                    comments.set(postid, {
                        comments: [{
                            creator: sessionids.get(userid),
                            comment: comment
                        }, ...comments.get(postid).comments]
                    })
                } else {
                    comments.set(postid, {
                        comments: [{
                            creator: sessionids.get(userid),
                            comment: comment
                        }]
                    })
                }
                res.status(200).send("successful")
            } else {
                res.status(400).send("no comment"); // lmao finnally i get to use that unfunny joke
            }
        } else {
            res.status(400).send("invalid post id");
        }
    } else {
        res.status(401).send("unauthorized");
    }
})

app.get("/getcomments", (req, res) => {
    let postid = req.query.post;
    res.status(200).json(comments.get(postid) || {
        comments: []
    });
})

export default app;