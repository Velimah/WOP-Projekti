"use strict";
const url = "https://10.114.34.66/app"; // change url when uploading to server

// select existing html elements
const loginForm = document.querySelector("#login-form");
const addUserForm = document.querySelector("#add-user-form");
const dialog = document.getElementById("modal");

// login
loginForm.addEventListener("submit", async (evt) => {
  evt.preventDefault();
  const data = serializeJson(loginForm);
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url + "/auth/login", fetchOptions);
  const json = await response.json();
  console.log("login response", json);
  if (!json.user) {
    dialog.addEventListener("click", () => {
      dialog.close();
    });
    dialog.innerHTML = "<p>" + json.message + "</p>";
    dialog.showModal();
  } else {
    // save token
    sessionStorage.setItem("token", json.token);
    sessionStorage.setItem("user", JSON.stringify(json.user));
    location.href = "index.html";
  }
});

// submit register form
addUserForm.addEventListener("submit", async (evt) => {
  evt.preventDefault();
  const data = serializeJson(addUserForm);
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch(url + "/auth/register", fetchOptions);
  const json = await response.json();
  dialog.addEventListener("click", () => {
    dialog.close();
  });
  dialog.innerHTML = "<p>" + json.message + "</p>";
  dialog.showModal();
});
