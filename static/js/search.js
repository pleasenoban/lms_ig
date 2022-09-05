const userdatae = document.getElementById("userdata");
const searche = document.getElementById("search");
const answerse = document.getElementById("answers");

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
    location.href = "/main.html";
}

function search() {
    localStorage.setItem("searchquery", searche.value);
    location.reload();
}

searche.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") search();
});

async function runsearch() {
    let query = localStorage.getItem("searchquery");
    searche.value = query;

    let res = await fetch(`/search?searchquery=${encodeURIComponent(query)}`, {
        method: "GET",
        credentials: "include"
    });

    if (!res.ok)
        return alert("invalid request");

    let json = await res.json();

    for (let [key, value] of Object.entries(json)) {
        answerse.innerHTML += `<div class="question" onclick='view("${key}");'>
                                    <div class="qa">
                                        <img class="qat" src="/imgs/avatar.png"></img>
                                        <h4 class="qaname">${sanitizeHTML(value.creator)}</h3>
                                    </div>
                                    <div class="qt">
                                        <h2 class="qtt">${sanitizeHTML(value.title)}</h2>
                                        <div class="qtc">${value.body}</div>
                                    </div>
                                </div>`;
    }
}

function view(id) {
    localStorage.setItem("viewid", id);
    location.href = "/view.html";
}

setuser();
runsearch();