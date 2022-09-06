const showc = document.getElementById("show");
const passe = document.getElementById("password");
const usere = document.getElementById("username");

showc.addEventListener("change", (ev) => {
    if (ev.target.checked) passe.type = "text";
    else passe.type = "password";
})

async function submit() {
    if (usere.value === "" || passe.value === "") return alert("missing username and/or password");
    let signup = await fetch(`/login?username=${encodeURIComponent(usere.value)}&password=${encodeURIComponent(passe.value)}`, {
        method: "POST",
        credentials: "include",
    });
    let rettext = await signup.text();
    if (!signup.ok) {
        if (rettext === "invalid username or password") return alert("invalid username or password");
        return alert("failed to fetch");
    }
    location.href = "/main.html";
}

if (document.cookie.includes("id")) location.href = "/main.html";