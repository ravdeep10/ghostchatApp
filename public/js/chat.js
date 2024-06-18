const socket = io();
//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $userLocationButton =document.querySelector('#location');
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const { username, room } = Qs.parse(location.search,{ ignoreQueryPrefix: true})

const autoscroll = ()=>{
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;

    const containerHeight = $messages.scrollHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }


}
socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message:message.text,
        createdAt :moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        url:message.url,
        createdAt :moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users})=>{
    const html = Mustache.render(sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    $messageFormButton.setAttribute('disabled','disabled')

    const message =  e.target.elements.message.value;
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus( )
        if(error){
            return console.log(error)
        }
    })
})


$userLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser.")
    }
    $userLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
         socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
         },()=>{
            $userLocationButton.removeAttribute('disabled')
         })
    })
})

socket.emit('join',{username,room}, (error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }
})
