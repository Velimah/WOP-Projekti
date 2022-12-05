'use strict';

const url = 'http://localhost:3000'; // change url when uploading to server


const getQParam = (param) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
};

const user = JSON.parse(sessionStorage.getItem('user'));

const message_id = parseInt(getQParam('id'));
const viestit = document.querySelector('#viestit');
const vastaukset = document.querySelector('#vastaukset');

const loadMessage = (message) => {

  document.getElementById('viestit').innerHTML = '';

  const img = document.createElement('img');

  if (message.picture !== "") {
    img.src = url + '/thumbnails/' + message.picture;
    img.alt = "kuva";
    img.className = 'viesti-kuva';

    img.addEventListener('click', () => {
      location.href = 'single.html?id=' + message.message_id;
    });

  }

  const Lahettaja = document.createElement('p');
  Lahettaja.innerHTML = message.name;

  const email = document.createElement('p');
  email.innerHTML = '<a href="mailto:' + message.email + '">' + message.email + '</a>';

  const viesti = document.createElement('p');
  viesti.setAttribute('class', 'viesti');
  viesti.innerHTML = message.message_body;

  const aika = document.createElement('p');

  const time1 = new Date(message.send_time);
  const time2 = new Date();
  const elapsedTime = time2.getTime() - time1.getTime();
  const minutes = elapsedTime / (1000 * 60);
  const hours = elapsedTime / (1000 * 3600);

  if (minutes < 60) {
    aika.innerHTML = `${Math.trunc(minutes)} minuuttia sitten`;
  } else if (hours < 24) {
    aika.innerHTML = ` ${Math.trunc(hours)} tuntia sitten`;
  } else {
    aika.innerHTML = `${message.send_time.substring(0, 10)}`;
  }

  const palsta = document.createElement('p');
  palsta.innerHTML = message.boardname;
  palsta.setAttribute('class', "viestikortti-palsta");

  const tykkaykset = document.createElement('p');
  tykkaykset.innerHTML = message.likecount + " <i class=\"fa-solid fa-heart\"></i>";

  let messageId = `viesti-${message.message_id}`;
  let boardId = `board-${message.board_id} viesti-container`;

  const viestiContainer = document.createElement('div');
  viestiContainer.setAttribute('id', messageId);
  viestiContainer.setAttribute('class', boardId);

  const lahettajaKortti = document.createElement('div');
  lahettajaKortti.setAttribute('class', 'lahettaja-kortti');

  const lK1 = document.createElement('div');
  lK1.setAttribute('class', 'lK1');
  const lK2 = document.createElement('div');
  lK2.setAttribute('class', 'lK2');

  const viestiKortti = document.createElement('div');
  viestiKortti.setAttribute('class', 'viesti-kortti');

  const napitKortti = document.createElement('div');
  napitKortti.setAttribute('class', 'napit-kortti');

  const kuva = document.createElement('img');
  kuva.setAttribute('class', 'profiilikuva');

  if (message.profile_picture !== "") {
    kuva.src = url + '/thumbnails/' + message.profile_picture;
    kuva.alt = "kuva";
  }

  const vastausKortti = document.createElement('div');
  vastausKortti.setAttribute('class', 'vastaus-kortti');

  lK1.appendChild(Lahettaja);
  lK1.appendChild(email);
  lK2.appendChild(aika);
  lK2.appendChild(palsta);
  lahettajaKortti.appendChild(kuva);
  lahettajaKortti.appendChild(lK1);
  lahettajaKortti.appendChild(lK2);
  viestiKortti.appendChild(viesti);

  if (message.picture !== "") {
    const figure = document.createElement('figure').appendChild(img);
    viestiKortti.appendChild(figure);
  }

  napitKortti.appendChild(tykkaykset);
  viestiContainer.appendChild(lahettajaKortti);
  viestiContainer.appendChild(viestiKortti);
  viestiContainer.appendChild(napitKortti);
  viestiContainer.appendChild(vastausKortti);


  const likeButton = document.createElement('button');
  likeButton.setAttribute('class', "like-button");
  likeButton.innerHTML = 'Tykkää';

  likeButton.addEventListener('click', async (evt) => {
    evt.preventDefault();
    const fetchOptions = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
      body: user,
    };
    const response = await fetch(url + '/message/like/' + message.message_id, fetchOptions);
    const json = await response.json();
    alert(json.message);
  });

  napitKortti.appendChild(likeButton);


  if (user.role === 0 || user.user_id === message.sender) {
    const modButton = document.createElement('button');
    modButton.innerHTML = 'Muokkaa';
    modButton.classList.add('modify-button');
    const href = `modify-cat.html?id=${message.message_id}`;
    modButton.addEventListener('click', function () {
      location.href = href;
    });

    napitKortti.appendChild(modButton);

    // delete message
    const delButton = document.createElement('button');
    delButton.innerHTML = 'Poista';
    delButton.classList.add('delete-button');
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
        getMessages();
      } catch (e) {
        console.log(e.message);
      }
    });

    napitKortti.appendChild(delButton);

  }

  //   viestiContainer.appendChild(replyBox);

  viestit.appendChild(viestiContainer);
  getMessages();

  /*
        const replyBox = document.createElement('div');
        replyBox.innerHTML =

        '<form action="http://localhost:3000/message" method="post" encType="multipart/form-data" id="addReplyForm'+message.message_id+'">'+
          '<label htmlFor="tekstikentta'+message.message_id+'"></label>'+
          '<input id="tekstikentta'+message.message_id+'" type="text" name="message_body" placeholder=" Kirjoita viesti...">'+
          '<div id="input-container'+message.message_id+'">'+
            '<input id="kuva-nappi'+message.message_id+'" type="file" name="picture" accept="image/*" placeholder="">'+
            '<button id="laheta-nappi'+message.message_id+'" type="submit">Lähetä</button>'+
          '</div>'+
        '</form>';

        const replyForm = document.querySelector(`#addReplyForm${message.message_id}`);
        replyForm.addEventListener('submit', async (evt) => {
          evt.preventDefault();
          const fd = new FormData(replyForm);
          console.log(fd);
          const fetchOptions = {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + sessionStorage.getItem('token'),
            },
            body: fd, ,
          };

          const response = await fetch(url + '/message', fetchOptions);
          const json = await response.json();
          alert(json.message);
          location.href = "front.html";
        });

  */
};

let message;
const getMessage = async () => {
  try {
  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  };
  const response = await fetch(url + '/message/' + message_id, fetchOptions);
  message = await response.json();
  console.log(message);
  loadMessage(message);
  } catch (e) {
    console.log(e.message);
  }
};



const loadMessages = (messages) => {

  document.getElementById('vastaukset').innerHTML = '';

  messages.forEach((message) => {
    console.log("jee", message)

    if (message.reply_id === message_id) {

      const img = document.createElement('img');

      if (message.picture !== "") {
        img.src = url + '/thumbnails/' + message.picture;
        img.alt = "kuva";
        img.className = 'viesti-kuva';

        img.addEventListener('click', () => {
          location.href = 'single.html?id=' + message.message_id;
        });

      }

      const Lahettaja = document.createElement('p');
      Lahettaja.innerHTML = message.name;

      const email = document.createElement('p');
      email.innerHTML = '<a href="mailto:' + message.email + '">' + message.email + '</a>';

      const viesti = document.createElement('p');
      viesti.setAttribute('class', 'viesti');
      viesti.innerHTML = message.message_body;

      const aika = document.createElement('p');

      const time1 = new Date(message.send_time);
      const time2 = new Date();
      const elapsedTime = time2.getTime() - time1.getTime();
      const minutes = elapsedTime / (1000 * 60);
      const hours = elapsedTime / (1000 * 3600);

      if (minutes < 60) {
        aika.innerHTML = `${Math.trunc(minutes)} minuuttia sitten`;
      } else if (hours < 24) {
        aika.innerHTML = ` ${Math.trunc(hours)} tuntia sitten`;
      } else {
        aika.innerHTML = `${message.send_time.substring(0, 10)}`;
      }


      const tykkaykset = document.createElement('p');
      tykkaykset.innerHTML = message.likecount + " <i class=\"fa-solid fa-heart\"></i>";

      let messageId = `viesti-${message.message_id}`;
      let boardId = `board-${message.board_id} viesti-container`;

      const viestiContainer = document.createElement('div');
      viestiContainer.setAttribute('id', messageId);
      viestiContainer.setAttribute('class', boardId);

      const lahettajaKortti = document.createElement('div');
      lahettajaKortti.setAttribute('class', 'lahettaja-kortti');

      const lK1 = document.createElement('div');
      lK1.setAttribute('class', 'lK1');
      const lK2 = document.createElement('div');
      lK2.setAttribute('class', 'lK2');

      const viestiKortti = document.createElement('div');
      viestiKortti.setAttribute('class', 'viesti-kortti');

      const napitKortti = document.createElement('div');
      napitKortti.setAttribute('class', 'napit-kortti');

      const kuva = document.createElement('img');
      kuva.setAttribute('class', 'profiilikuva');

      if (message.profile_picture !== "") {
        kuva.src = url + '/thumbnails/' + message.profile_picture;
        kuva.alt = "kuva";
      }

      const vastausKortti = document.createElement('div');
      vastausKortti.setAttribute('class', 'vastaus-kortti');

      lK1.appendChild(Lahettaja);
      lK1.appendChild(email);
      lK2.appendChild(aika);
      lahettajaKortti.appendChild(kuva);
      lahettajaKortti.appendChild(lK1);
      lahettajaKortti.appendChild(lK2);
      viestiKortti.appendChild(viesti);

      if (message.picture !== "") {
        const figure = document.createElement('figure').appendChild(img);
        viestiKortti.appendChild(figure);
      }

      napitKortti.appendChild(tykkaykset);
      viestiContainer.appendChild(lahettajaKortti);
      viestiContainer.appendChild(viestiKortti);
      viestiContainer.appendChild(napitKortti);
      viestiContainer.appendChild(vastausKortti);


      const likeButton = document.createElement('button');
      likeButton.setAttribute('class', "like-button");
      likeButton.innerHTML = 'Tykkää';

      likeButton.addEventListener('click', async (evt) => {
        evt.preventDefault();
        const fetchOptions = {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + sessionStorage.getItem('token'),
          },
          body: user,
        };
        const response = await fetch(url + '/message/like/' + message.message_id, fetchOptions);
        const json = await response.json();
        alert(json.message);
        getMessage();
      });

      napitKortti.appendChild(likeButton);


      if (user.role === 0 || user.user_id === message.sender) {
        const modButton = document.createElement('button');
        modButton.innerHTML = 'Muokkaa';
        modButton.classList.add('modify-button');
        const href = `modify-cat.html?id=${message.message_id}`;
        modButton.addEventListener('click', function () {
          location.href = href;
        });

        napitKortti.appendChild(modButton);

        // delete message
        const delButton = document.createElement('button');
        delButton.innerHTML = 'Poista';
        delButton.classList.add('delete-button');
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
            getMessage();
          } catch (e) {
            console.log(e.message);
          }
        });

        napitKortti.appendChild(delButton);

      }

      vastaukset.appendChild(viestiContainer);
    }
  });
};

const getMessages = async () => {
  try {
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
    };
    const response = await fetch(url + '/message', fetchOptions);
    const messages = await response.json();
    loadMessages(messages);

  } catch (e) {
    console.log(e.message);
  }
};

getMessage();

const addForm = document.querySelector('#addReplyForm');

addForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const fd = new FormData(addForm);
  fd.append('board_id',`${message.board_id}`)
  console.log(fd);
  const fetchOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: fd,
  };
  const response = await fetch(url + '/message/' + message_id, fetchOptions);
  const json = await response.json();
  alert(json.message);
  location.href = "show-message.html?id="+message_id;
});