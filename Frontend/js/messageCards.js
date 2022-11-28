'use strict';
const url = 'http://localhost:3000'; // change url when uploading to server

// select existing html elements
const div = document.querySelector('#keski');

// get user data for admin check
const user = JSON.parse(sessionStorage.getItem('user'));

// create cat cards
const createCatCards = (messages) => {
  // clear ul
  document.getElementById('keski').innerHTML = '';
  messages.forEach((message) => {
    // create li with DOM methods

    const img = document.createElement('img');
    img.src = url + '/thumbnails/' + message.picture;
    //img.alt = message.name;
    img.className = 'kuva';

    const figure = document.createElement('figure').appendChild(img);

    const h2 = document.createElement('h2');
    h2.innerHTML = message.name;

    const p1 = document.createElement('p');
    p1.innerHTML = message.email;

    const p2 = document.createElement('p');
    p2.innerHTML = message.message_body;

    const p3 = document.createElement('p');

    const time1 = new Date(message.send_time);
    const time2 = new Date();
    const elapsedTime = time2.getTime() - time1.getTime();
    const minutes = elapsedTime / (1000 * 60);
    const hours = elapsedTime / (1000 * 3600);

    if (minutes < 60) {
      p3.innerHTML = `Sent: ${Math.trunc(minutes)}m`;
    } else if (hours < 24) {
      p3.innerHTML = `Sent: ${Math.trunc(hours)}h`;
    } else {
      p3.innerHTML = `Sent: ${message.send_time.substring(0, 10)} ${message.send_time.substring(11, 19)}`;
    }

    const div2 = document.createElement('li');

    div2.appendChild(h2);
    div2.appendChild(p1);
    div2.appendChild(p3);
    div2.appendChild(p2);
    div2.appendChild(figure);
    div.appendChild(div2);

    if (user.role === 0 || user.user_id === message.sender) {
      // link to modify form
      const modButton = document.createElement('a');
      modButton.innerHTML = 'Modify';
      modButton.href = `modify-cat.html?id=${message.message_id}`;
      modButton.classList.add('button');

      // delete selected cat
      const delButton = document.createElement('button');
      delButton.innerHTML = 'Delete';
      delButton.classList.add('button');
      delButton.addEventListener('click', async () => {
        const fetchOptions = {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + sessionStorage.getItem('token'),
          },
        };
        try {
          const response = await fetch(
            url + '/message/' + message.message_id,
            fetchOptions
          );
          const json = await response.json();
          console.log('delete response', json);
          getCat();
        } catch (e) {
          console.log(e.message);
        }
      });

      div2.appendChild(modButton);
      div2.appendChild(delButton);
    }
  });
};

const getCat = async () => {
  try {
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
    };
    const response = await fetch(url + '/message', fetchOptions);
    const cats = await response.json();
    createCatCards(cats);
  } catch (e) {
    console.log(e.message);
  }
};
getCat();


// select existing html elements
const addForm = document.querySelector('#addCatForm');

// submit add cat form
addForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const fd = new FormData(addForm);
  const fetchOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: fd,
  };
  const response = await fetch(url + '/message', fetchOptions);
  const json = await response.json();
  alert(json.message);
});