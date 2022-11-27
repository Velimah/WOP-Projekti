'use strict';
const url = 'http://localhost:3000'; // change url when uploading to server

// get query parameter
const getQParam = (param) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
};

// get id from address
const cat_id = getQParam('id');

// select existing html elements
const img = document.querySelector('#image img');

// add existing cat data to form
const getCat = async (id) => {
  const fetchOptions = {
    headers: {
      Authorization: 'Bearer ' + sessionStorage.getItem('token'),
    },
  };
  const response = await fetch(url + '/message/' + id, fetchOptions);
  const cat = await response.json();
  img.src = `${url}/${cat.filename}`;
  addMarker(JSON.parse(cat.coords));
};

getCat(cat_id);
