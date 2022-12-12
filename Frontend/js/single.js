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

// select existing html elements
const img = document.querySelector('#image img');


const getMessage = async (id) => {
  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  };
  const response = await fetch(url + '/message/' + id, fetchOptions);
  const message = await response.json();
  img.src = `${url}/${message.picture}`;
  addMarker(JSON.parse(message.coords));
  if (message.coords === "[24.74,60.24]") {
    document.getElementById("map").style.display = "none";
  }
};

getMessage(message_id);
