let userdatae = document.getElementById("userdata");

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

setuser();