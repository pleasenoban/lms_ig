let userdatae = document.getElementById("userdata");
let searche = document.getElementById("search");
let qcont = document.getElementById("question");
let commentse = document.getElementById("comments");
let createbtn = document.getElementById("createbtn");
let cancelbtn = document.getElementById("cancel");
let createdia = document.getElementById("createdia");
let editor = document.getElementById("editor");

function sanitizeHTML(text) {
    let element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
}

async function setuser() {
    let username = await userdata();
    if (username === null) {
        userdatae.innerHTML = `<button id="login" onclick="location.href = '/login.html'">login</button>
                               <button id="signup" onclick="location.href = '/signup.html'">signup</button>`;
    } else {
        userdatae.innerHTML = `<p id="welcomemsg">welcome,&nbsp;</p>
                               <p id="username">${sanitizeHTML(username)}</p>
                               <button id="logout" onclick="logout();">logout</button>`;
    }
}

async function userdata() {
    if (document.cookie !== "") {
        let res = await fetch("/userinfo", {
            method: "GET",
            credentials: "include",
        });
        if (!res.ok) return null;
        return (await res.json()).username;
    }
    return null;
}

async function logout() {
    let res = await fetch("/logout", {
        method: "POST",
        credentials: "include"
    });
    if (!res.ok) {
        return alert("cannot logout");
    }
    location.href = "/login.html";
}

async function getquestion() {
    let id = localStorage.getItem("viewid");
    let res = await (await fetch("/getposts", {
        method: "GET",
        credentials: "include"
    })).json();
    let value = res[id];
    qcont.innerHTML = `<div class="question">
                                <div class="qa">
                                    <img class="qat" src="/imgs/avatar.png"></img>
                                    <h4 class="qaname">${value.creator}</h3>
                                </div>
                                <div class="qt">
                                    <h2 class="qtt">${value.title}</h2>
                                    <div class="qtc">${value.body}</div>
                                </div>
                            </div>`;
}

async function getcomments() {
    let postid = localStorage.getItem("viewid");
    let res = await fetch(`/getcomments?post=${encodeURIComponent(postid)}`, {
        method: "GET"
    })
    if (!res.ok) alert("failed getting comments");
    let json = await res.json();

    json.comments.forEach((comment) => {
        commentse.innerHTML += `<div class="comment">
                                    <div class="ca">
                                        <img class="cat" src="/imgs/avatar.png"></img>
                                        <h4 class="caname">${comment.creator}</h3>
                                    </div>
                                    <div class="ct">
                                        <p class="ctc">${comment.comment}</p>
                                    </div>
                                </div>`;
    })
}

function create() {
    pell.init({
        element: editor,
        actions: ["bold",
            "italic",
            "underline",
            "strikethrough",
            "heading1",
            "heading2",
            "paragraph",
            "quote",
            "olist",
            "ulist",
            "code",
            "line",
            "link",
            "image"],
        onChange: () => {}
    })
    createdia.showModal();
}

createbtn.addEventListener("click", async () => {
    createdia.close();
    let res = await fetch(`/createcomment?post=${encodeURIComponent(localStorage.getItem("viewid"))}`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            comment: editor.content.innerHTML,
        })
    });
    if (!res.ok) return alert("cannot create comment");
    location.reload();
})

cancelbtn.addEventListener("click", () => {
    createdia.close();
})

createdia.addEventListener("close", () => {
    let editorp = editor.parentNode;
    editor.remove();
    editor = document.createElement("div");
    editor.id = "editor";
    editorp.insertBefore(editor, editorp.children[0]);
})

function search() {
    localStorage.setItem("searchquery", searche.value);
    location.href = "/search.html";
}

searche.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") search();
});

getquestion();
getcomments();
setuser();