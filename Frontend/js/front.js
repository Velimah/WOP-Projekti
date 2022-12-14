'use strict';
const url = 'https://10.114.34.66/app'; // change url when uploading to server

// select existing html elements
const viestit = document.querySelector('#viestit');

// get user data for admin check
const user = JSON.parse(sessionStorage.getItem('user'));

const dialog = document.getElementById("modal");


// load all messages
const loadMessages = (messages) => {
  // clears the html element before adding content
  document.getElementById('viestit').innerHTML = '';

  messages.forEach((message) => {

    // chooses only non-reply messages. Search removes reply_id from results so !message.hasOwnProperty allows to show replies when search is used.
    if (message.reply_id === null || (!message.hasOwnProperty('reply_id'))) {

      // message sender information section

      const lahettajaKortti = document.createElement('div');
      lahettajaKortti.setAttribute('class', 'lahettaja-kortti');

      const lahettaja = document.createElement('p');
      lahettaja.setAttribute('class', 'lahettaja-kortti-nimi');
      lahettaja.innerHTML = message.name;

      const email = document.createElement('p');
      email.setAttribute('class', 'lahettaja-kortti-email');
      email.innerHTML = '<a href="mailto:' + message.email + '">' + message.email + '</a>';

      const aika = document.createElement('p');
      aika.setAttribute('class', 'lahettaja-kortti-aika');

      // calculates minutes and hours since the message was posted
      const time1 = new Date(message.send_time);
      const time2 = new Date();
      const elapsedTime = time2.getTime() - time1.getTime();
      const minutes = Math.trunc(elapsedTime / (1000 * 60));
      const hours = Math.trunc(elapsedTime / (1000 * 3600));

      // chooses the correct time format to display (minutes/hours/date)
      if (minutes === 1) {
        aika.innerHTML = `Minuutti sitten`;
      } else if (minutes < 60) {
        aika.innerHTML = `${minutes} minuuttia sitten`;
      } else if (hours === 1) {
        aika.innerHTML = `Tunti sitten`;
      } else if (hours < 24) {
        aika.innerHTML = `${hours} tuntia sitten`;
      } else {
        aika.innerHTML = `${message.send_time.substring(0, 10)}`;
      }

      const palsta = document.createElement('p');
      palsta.setAttribute('class', "viestikortti-palsta");
      palsta.innerHTML = message.boardname;

      const kuva = document.createElement('img');
      kuva.setAttribute('class', 'profiilikuva');

      // if the sender has profile pic embeds it into the message header
      if (message.profile_picture !== "") {
        kuva.src = url + '/thumbnails/' + message.profile_picture;
        kuva.alt = "kuva";
      }

      // containers for flexbox
      const lK1 = document.createElement('div');
      lK1.setAttribute('class', 'lK1');
      const lK2 = document.createElement('div');
      lK2.setAttribute('class', 'lK2');

      // combining information into flexbox containers, then into a parent element
      lK1.appendChild(lahettaja);
      lK1.appendChild(email);
      lK2.appendChild(aika);
      lK2.appendChild(palsta);
      lahettajaKortti.appendChild(kuva);
      lahettajaKortti.appendChild(lK1);
      lahettajaKortti.appendChild(lK2);

      // message body section

      const viestiKortti = document.createElement('div');
      viestiKortti.setAttribute('class', 'viesti-kortti');

      const viesti = document.createElement('p');
      viesti.setAttribute('class', 'viesti');
      viesti.innerHTML = message.message_body;
      viesti.addEventListener('click', function () {
        location.href = href;
      });

      viestiKortti.appendChild(viesti);


      if (message.modify_time != null) {

        const time1 = new Date(message.modify_time);
        const time2 = new Date();
        const elapsedTime2 = time2.getTime() - time1.getTime();
        const minutes = Math.trunc(elapsedTime2 / (1000 * 60));
        const hours = Math.trunc(elapsedTime2 / (1000 * 3600));

        const muokkausAika = document.createElement('p');
        muokkausAika.setAttribute('class', 'viesti-kortti-muokkausaika');

        if (minutes === 1) {
          muokkausAika.innerHTML = `Muokattu minuutti sitten`;
        } else if (minutes < 60) {
          muokkausAika.innerHTML = `Muokattu ${minutes} minuuttia sitten`;
        } else if (hours === 1) {
          muokkausAika.innerHTML = `Muokattu tunti sitten`;
        } else if (hours < 24) {
          muokkausAika.innerHTML = `Muokattu ${hours} tuntia sitten`;
        } else {
          muokkausAika.innerHTML = `Muokattu ${message.modify_time.substring(0, 10)}`;
        }
        viestiKortti.appendChild(muokkausAika);
      }


      const img = document.createElement('img');

      // if the message has a picture, embeds it into the message post
      if (message.picture !== "") {
        img.src = url + '/thumbnails/' + message.picture;
        img.alt = "kuva";
        img.className = 'viesti-kuva';

        img.addEventListener('click', () => {
          location.href = 'single.html?id=' + message.message_id;
        });
      }

      if (message.picture !== "") {
        const figure = document.createElement('figure').appendChild(img);
        viestiKortti.appendChild(figure);
      }

      // message buttons section

      const napitKortti = document.createElement('div');
      napitKortti.setAttribute('class', 'napit-kortti');

      // like count and button

      const likeButton = document.createElement('button');
      likeButton.setAttribute('class', "message-button");
      likeButton.innerHTML = "<i class=\"fa-regular fa-heart\"></i> " + "<p>" + message.likecount + "</p>";

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
        dialog.addEventListener("click", () => {
          dialog.close();
        });
        dialog.innerHTML = '<p>'+json.message+'</p>'
        dialog.showModal();
        getMessages();
      });

      napitKortti.appendChild(likeButton);

      // reply count and reply button
      const replyButton = document.createElement('button');
      replyButton.setAttribute('class', "message-button");

      if (message.replycount === null) {
        replyButton.innerHTML = "<i class=\"fa-regular fa-comment\"></i> " + "<p>0</p>";
      } else {
        replyButton.innerHTML = "<i class=\"fa-regular fa-comment\"></i> " + "<p>" + message.replycount + "</p>";
      }

      const href = `show-message.html?id=${message.message_id}`;
      replyButton.addEventListener('click', function () {
        location.href = href;
      });

      napitKortti.appendChild(replyButton);

      // edit and delete button depending on user role
      if (user.role === 0 || user.user_id === message.sender) {

        // edit message
        const modButton = document.createElement('button');
        modButton.setAttribute('class', "message-button");
        modButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
        const href = `modify-message.html?id=${message.message_id}`;
        modButton.addEventListener('click', function () {
          location.href = href;
        });

        napitKortti.appendChild(modButton);

        // delete message
        const delButton = document.createElement('button');
        delButton.setAttribute('class', "message-button");
        delButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
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
            dialog.addEventListener("click", () => {
              dialog.close();
            });
            dialog.innerHTML = '<p>'+json.message+'</p>'
            dialog.showModal();
            getMessages();
          } catch (e) {
            console.log(e.message);
          }
        });
        napitKortti.appendChild(delButton);
      }

      // container for each complete message
      const viestiContainer = document.createElement('div');

      //puts the post and board id into each message (if needed for something in future)
      let messageId = `viesti-${message.message_id}`;
      let boardId = `board-${message.board_id} viesti-container`;
      viestiContainer.setAttribute('id', messageId);
      viestiContainer.setAttribute('class', boardId);

      //combines message header, message body and buttons together into a container and then into existing html element
      viestiContainer.appendChild(lahettajaKortti);
      viestiContainer.appendChild(viestiKortti);
      viestiContainer.appendChild(napitKortti);
      viestit.appendChild(viestiContainer);
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

getMessages();

//form to add messages
const addMessageForm = document.querySelector('#addMessageForm');

addMessageForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const fd = new FormData(addMessageForm);
  const fetchOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: fd,
  };
  const response = await fetch(url + '/message', fetchOptions);
  const json = await response.json();
  dialog.addEventListener("click", () => {
    dialog.close();
  });
  dialog.innerHTML = '<p>'+json.message+'</p>'
  dialog.showModal();
  getMessages();
});

// search
const searchForm = document.querySelector('#search-form');

// submits the search string
searchForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const data = serializeJson(searchForm);

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url + '/message/search', fetchOptions);
  const json = await response.json();

  // checks if the result has an error message in json reply
  if (json.hasOwnProperty('message')) {
    dialog.addEventListener("click", () => {
      dialog.close();
    });
    dialog.innerHTML = '<p>'+"Ei tuloksia"+'</p>';
    dialog.showModal();
    getMessages();
  } else {
    loadMessages(json);
    if (json.length === 1) {
      dialog.addEventListener("click", () => {
        dialog.close();
      });
      dialog.innerHTML = '<p>'+"Löytyi " + json.length + " tulos"+'</p>';
      dialog.showModal();
    } else {
      dialog.addEventListener("click", () => {
        dialog.close();
      });
      dialog.innerHTML = '<p>'+"Löytyi " + json.length + " tulosta"+'</p>';
      dialog.showModal();
    }
  }
});

// board select;

const boardSelect = document.querySelector('#board-select2');

boardSelect.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const data = serializeJson(boardSelect);

  //checks if all messages are chosen and the returns to main page
  if (data?.board_id === "1") {
    location.href = "front.html";
    return;
  }

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url + '/message/board', fetchOptions);
  const json = await response.json();
  loadMessages(json);

});