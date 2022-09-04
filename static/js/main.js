const userdatae = document.getElementById("userdata");
const createdia = document.getElementById("createdia");
const editor = document.getElementById("editor");
const title = document.getElementById("title");
const createbtn = document.getElementById("createbtn");
const cancelbtn = document.getElementById("cancel");
const questions = document.getElementById("questions");
const searche = document.getElementById("search");

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
    let res = await fetch("/createpost", {
        method: "POST",
        credentials: "include",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title.value,
            body: editor.content.innerHTML,
        })
    });
    if (!res.ok) return alert("cannot create post");
    location.reload();
})

cancelbtn.addEventListener("click", () => {
    createdia.close();
})

createdia.addEventListener("close", () => {
    title.value = "";
    editor.remove();
    editor = document.createElement("div");
    editor.id = "editor";
    title.parentNode.insertBefore(editor, title.nextSibling);
})

async function getposts() {
    let res = await (await fetch("/getposts", {
        method: "GET",
        credentials: "include"
    })).json();
    for (let [key, value] of Object.entries(res)) {
        questions.innerHTML += `<div class="question" onclick='view("${key}");'>
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
}

function view(id) {
    localStorage.setItem("viewid", id);
    location.href = "/view.html";
}

function search() {
    localStorage.setItem("searchquery", searche.value);
    location.href = "/search.html";
}

searche.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") search();
});

setuser();
getposts();