'use strict';

const url = 'http://localhost:3000'; // change url when uploading to server

const getQParam = (param) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
};
// gets user information and message id
const user = JSON.parse(sessionStorage.getItem('user'));
const message_id = parseInt(getQParam('id'));

//selects correct html elements from page to use in message and replies
const viestit = document.querySelector('#viestit');
const vastaukset = document.querySelector('#vastaukset');

// loads the main message
const loadMessage = (message) => {

  //clears the html element before adding content
  document.getElementById('viestit').innerHTML = '';

  //message sender information section

  const lahettajaKortti = document.createElement('div');
  lahettajaKortti.setAttribute('class', 'lahettaja-kortti');

  const Lahettaja = document.createElement('p');
  Lahettaja.innerHTML = message.name;

  const email = document.createElement('p');
  email.innerHTML = '<a href="mailto:' + message.email + '">' + message.email + '</a>';

  const aika = document.createElement('p');

  //calculates minutes and hours since the message was posted
  const time1 = new Date(message.send_time);
  const time2 = new Date();
  const elapsedTime = time2.getTime() - time1.getTime();
  const minutes = Math.trunc(elapsedTime / (1000 * 60));
  const hours = Math.trunc(elapsedTime / (1000 * 3600));

  //chooses the correct time format to display (minutes/hours/date)
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
  palsta.innerHTML = message.boardname;
  palsta.setAttribute('class', "viestikortti-palsta");

  // if the sender has profile pic embeds it into the message header
  const kuva = document.createElement('img');
  kuva.setAttribute('class', 'profiilikuva');

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
  lK1.appendChild(Lahettaja);
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

  viestiKortti.appendChild(viesti);

  if (message.modify_time != null) {

    const muokkausAika = document.createElement('p');

    const time1 = new Date(message.modify_time);
    const time2 = new Date();
    const elapsedTime2 = time2.getTime() - time1.getTime();
    const minutes = Math.trunc(elapsedTime2 / (1000 * 60));
    const hours = Math.trunc(elapsedTime2 / (1000 * 3600));

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

  //if the message has a picture, embeds it into the message post
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

  // message button section

  const napitKortti = document.createElement('div');
  napitKortti.setAttribute('class', 'napit-kortti');

  // like count and like button
  const likeButton = document.createElement('button');
  likeButton.setAttribute('class', "message-button");
  likeButton.innerHTML = "<p>"+message.likecount+"</p>" + " <i class=\"fa-regular fa-heart\"></i>";

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
    getMessage();
    alert(json.message);
  });

  napitKortti.appendChild(likeButton);

  // reply count and reply button
  const replyButton = document.createElement('button');
  replyButton.setAttribute('class', "message-button");

  if (message.replycount === null) {
    replyButton.innerHTML = "<p>0</p>" + " <i class=\"fa-regular fa-comment\"></i>";
  } else {
    replyButton.innerHTML = "<p>"+message.replycount+"</p>" + " <i class=\"fa-regular fa-comment\"></i>"
  }

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
        getMessage();
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

  //combines message header, message body, buttons and replies into same container
  viestiContainer.appendChild(lahettajaKortti);
  viestiContainer.appendChild(viestiKortti);
  viestiContainer.appendChild(napitKortti);
  viestit.appendChild(viestiContainer);

  // runs the function that gets message replies after the main message is ready
  getMessage();
};

// loads the replies for the message. code is almost same as above, just loops through reply_id's to find correct replies
const loadReplies = (messages) => {

  document.getElementById('vastaukset').innerHTML = '';

  messages.forEach((message) => {

    // checks for reply_id to find correct reply messages
    if (message.reply_id === message_id) {

//message sender information section

      const lahettajaKortti = document.createElement('div');
      lahettajaKortti.setAttribute('class', 'lahettaja-kortti');

      const Lahettaja = document.createElement('p');
      Lahettaja.innerHTML = message.name;

      const email = document.createElement('p');
      email.innerHTML = '<a href="mailto:' + message.email + '">' + message.email + '</a>';

      const aika = document.createElement('p');

      //calculates minutes and hours since the message was posted
      const time1 = new Date(message.send_time);
      const time2 = new Date();
      const elapsedTime = time2.getTime() - time1.getTime();
      const minutes = Math.trunc(elapsedTime / (1000 * 60));
      const hours = Math.trunc(elapsedTime / (1000 * 3600));

      //chooses the correct time format to display (minutes/hours/date)
      if (minutes === 1) {
        aika.innerHTML = `${minutes} Minuutti sitten`;
      } else if (minutes < 60) {
        aika.innerHTML = `${minutes} minuuttia sitten`;
      } else if (hours === 1) {
        aika.innerHTML = `${hours} Tunti sitten`;
      } else if (hours < 24) {
        aika.innerHTML = `${hours} tuntia sitten`;
      } else {
        aika.innerHTML = `${message.send_time.substring(0, 10)}`;
      }

      const palsta = document.createElement('p');
      palsta.innerHTML = message.boardname;
      palsta.setAttribute('class', "viestikortti-palsta");

      // if the sender has profile pic embeds it into the message header
      const kuva = document.createElement('img');
      kuva.setAttribute('class', 'profiilikuva');

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
      lK1.appendChild(Lahettaja);
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

      viestiKortti.appendChild(viesti);

      if (message.modify_time != null) {

        const muokkausAika = document.createElement('p');

        const time1 = new Date(message.modify_time);
        const time2 = new Date();
        const elapsedTime2 = time2.getTime() - time1.getTime();
        const minutes = Math.trunc(elapsedTime2 / (1000 * 60));
        const hours = Math.trunc(elapsedTime2 / (1000 * 3600));

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

      //if the message has a picture, embeds it into the message post
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

      // message button section

      const napitKortti = document.createElement('div');
      napitKortti.setAttribute('class', 'napit-kortti');

      const likeButton = document.createElement('button');
      likeButton.setAttribute('class', "message-button");

      likeButton.innerHTML = "<p>"+message.likecount+"</p>" + " <i class=\"fa-regular fa-heart\"></i>";

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
        getMessage();
        alert(json.message);
      });

      napitKortti.appendChild(likeButton);

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
            getMessage();
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

      //combines message header, message body, buttons and replies into same container
      viestiContainer.appendChild(lahettajaKortti);
      viestiContainer.appendChild(viestiKortti);
      viestiContainer.appendChild(napitKortti);

      vastaukset.appendChild(viestiContainer);
    }
  });
};

const getMessage = async () => {
  try {
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
    };
    const response = await fetch(url + '/message', fetchOptions);
    const messages = await response.json();
    loadReplies(messages);

  } catch (e) {
    console.log(e.message);
  }
};

// storage for message information
let message;

// gets the correct message id from param.id and finds the matching replies
const getReplies = async () => {
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

// starts the function train
getReplies();

// form to reply to the message
const addForm = document.querySelector('#addReplyForm');

addForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const fd = new FormData(addForm);

  //sends board id to be able to use the same sql route
  fd.append('board_id', `${message.board_id}`)
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
  location.href = "show-message.html?id=" + message_id;
});