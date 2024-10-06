const user_input = document.getElementById('user-input');
const send_button = document.getElementById('send-button');
const chat_output = document.getElementById('chat-output');

send_button.addEventListener('click', () => {
    const user_message = user_input.value;
    chat_output.innerText = `
