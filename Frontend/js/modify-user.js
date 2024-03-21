"use strict";
const url = "https://10.114.34.66/app"; // change url when uploading to server

// select existing html elements
const modUserForm = document.querySelector("#modUserForm");
const dialog = document.getElementById("modal");

// submit add user form
modUserForm.addEventListener("submit", async (evt) => {
  evt.preventDefault();
  const data = serializeJson(modUserForm);
  // remove empty properties
  for (const [prop, value] of Object.entries(data)) {
    if (value === "") {
      delete data[prop];
    }
  }
  const fetchOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  };

  const response = await fetch(url + "/user", fetchOptions);
  const json = await response.json();
  if (json.error) {
    dialog.addEventListener("click", () => {
      dialog.close();
      location.href = "index.html";
    });
    dialog.innerHTML = "<p>" + json.error.message + "</p>";
    dialog.showModal();
  } else {
    dialog.addEventListener("click", () => {
      dialog.close();
      location.href = "index.html";
    });
    dialog.innerHTML = "<p>" + json.message + "</p>";
    dialog.showModal();
  }
});

//form to add profile picture
const addPictureForm = document.querySelector("#addPictureForm");

addPictureForm.addEventListener("submit", async (evt) => {
  evt.preventDefault();
  const fd = new FormData(addPictureForm);
  const fetchOptions = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
    },
    body: fd,
  };
  const response = await fetch(url + "/user/picture", fetchOptions);
  const json = await response.json();
  dialog.addEventListener("click", () => {
    dialog.close();
    location.href = "index.html";
  });
  dialog.innerHTML = "<p>" + json.message + "</p>";
  dialog.showModal();
});
