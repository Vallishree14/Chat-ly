var name = getQueryVariable('name') || 'Someone from the other side';
var room = getQueryVariable('room');
var socket = io();

console.log(name + ' wants to join ' + room);
jQuery('.chat-room').text(room);
socket.on('connect', function() {
    console.log("CONNECTED TO SOCKET SERVER");
    socket.emit('joinRoom', {
        name: name,
        room: room
    });
});

socket.on('message', function(message) {
    var mtimestamp = moment.utc(message.timeStamp);
    var $messages = jQuery('.messages');
    var $message = jQuery('<li class="list-group-item"></li>')
    console.log("New Message: ");
    console.log(message.text);
    $message.append('<p><strong>' + message.name + ' ' + mtimestamp.local().format('h:mma:') +'</strong></p>')
    $message.append('<p>' + message.text + '</p>');
    $messages.append($message);
});

var $form = jQuery('#message-form');

$form.on('submit', function() {
    event.preventDefault();
    var $msg = $form.find('input[name=message]');
    socket.emit('message', {
        name: name,
        text: $msg.val()
    });
    $msg.val('');
});
