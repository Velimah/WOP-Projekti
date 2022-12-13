'use strict';
const url = 'http://localhost:3000'; // change url when uploading to server

const dialog = document.getElementById("modal");

(async () => {
  try {
    const response = await fetch(url + '/auth/logout');
    const json = await response.json();
    console.log(json);
    // remove token
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    dialog.addEventListener("click", () => {
      dialog.close();
      location.href = 'login.html';
    });
    dialog.innerHTML = '<p>'+'You have logged out'+'</p>';
    dialog.showModal();
  } catch (e) {
    console.log(e.message);
  }
})();
