'use strict';
const url = 'http://localhost:3000'; // change url when uploading to server

// get query parameter
const getQParam = (param) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
};

// get id from address
const message_id = getQParam('id');
console.log(message_id);

// select existing html elements
const modForm = document.querySelector('#modMessageForm');
const userList = document.querySelector('.add-owner');

// get user data for admin check
const user = JSON.parse(sessionStorage.getItem('user'));

// add existing message data to form
const getMessage = async (id) => {
  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  };
  const response = await fetch(url + '/message/' + id, fetchOptions);
  const message = await response.json();
  const inputs = modForm.querySelectorAll('input');
  inputs[0].value = message.message_body;
};

// create user options to <select>
const createUserOptions = (users) => {
  // clear user list
  userList.innerHTML = '';
  users.forEach((user) => {
    // create options with DOM methods
    const option = document.createElement('option');
    option.value = user.user_id;
    option.innerHTML = user.name;
    option.classList.add('light-border');
    userList.appendChild(option);
  });
  // load message data after users
  getMessage(message_id);
};

// get users to make options
const getUsers = async () => {
  try {
    const options = {
      headers: {
        Authorization: 'Bearer ' + sessionStorage.getItem('token'),
      },
    };
    const response = await fetch(url + '/user', options);
    const users = await response.json();
    createUserOptions(users);
  } catch (e) {
    console.log(e.message);
  }
};

// submit modify form
modForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const data = serializeJson(modForm);
  console.log(data);
  // remove empty properties
  for (const [prop, value] of Object.entries(data)) {
    if (value === '') {
      delete data[prop];
    }
  }
  const fetchOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
    body: JSON.stringify(data),
  };

  console.log(fetchOptions);
  const response = await fetch(url + '/message/' + message_id, fetchOptions);
  const json = await response.json();
  if (json.error) {
    alert(json.error.message);
  } else {
    alert(json.message);
  }
  location.href = 'front.html';
});

// start filling the form
if (user.role === 0) {
  getUsers(); // if admin
} else {
  getMessage(message_id); // if regular user
}