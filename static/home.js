'use strict'

function home() {
  document.getElementById('home').style.display = 'inline-block';
  document.getElementById('creatingGame').style.display = 'none';
  document.getElementById('showCode').style.display = 'none';
  document.getElementById('joiningGame').style.display = 'none';
}

function createGame() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('creatingGame').style.display = 'inline-block';
  document.getElementById('showCode').style.display = 'none';
  document.getElementById('createNameBox').focus();
}

function showCode() {
  var name = document.getElementById('createNameBox').value;
  socket.emit('createGame', {name: name});
  return false;
}

socket.on('createCode', function(data) {
  document.getElementById('creatingGame').style.display = 'none';
  document.getElementById('showCode').style.display = 'inline-block';
  document.getElementById('code').innerHTML = data.code;
});

function joinGame() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('showCode').style.display = 'none';
  document.getElementById('joiningGame').style.display = 'inline-block';
  document.getElementById('joinNameBox').focus();
}

function joinStart() {
  var name = document.getElementById('joinNameBox').value;
  var code = document.getElementById('codeBox').value.toUpperCase();
  socket.emit('joinGame', {name: name, code: code});
  return false;
}

socket.on('startGame', function(data) {
  if (data.status === null) {
    alert('No game exists with that game code.');
    return false;
  } else if (data.status === 'full') {
    alert('This game is already underway.');
    return false;
  } else if (data.status === 'valid') {
    document.getElementById('home').style.display = 'none';
    document.getElementById('showCode').style.display = 'none';
    document.getElementById('joiningGame').style.display = 'none';
    start(data.code, data.color, data.blackName, data.whiteName);
  }
});
