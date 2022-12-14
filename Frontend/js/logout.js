'use strict';
const url = 'https://10.114.34.66/app'; // change url when uploading to server

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
    dialog.innerHTML = '<p>' + 'Olet kirjautunut ulos' + '</p>';
    dialog.showModal();
  } catch (e) {
    console.log(e.message);
  }
})();
