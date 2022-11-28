document.getElementById('keski').innerHTML =
  '<div class="viesti">' +
  '<h2 class="lahettaja">' + message.name + '</h2>' +
  '<p>' + message.email + '</p>' +
  '<p>' + message.message_body + '</p>' +
  '<p>' + message.send_time + '</p>' +
  '<img src="' + url + '/thumbnails/' + message.picture + '">' +
  '</div>';
