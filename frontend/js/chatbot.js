const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span>🤖</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").innerText = message;
    return chatLi;
}

const generateResponse = async (chatElement) => {
    const API_URL = `${config.API_BASE_URL}/api/chat`;
    const messageElement = chatElement.querySelector("p");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(window.token ? { "Authorization": `Bearer ${window.token}` } : {})
            },
            body: JSON.stringify({
                message: userMessage
            })
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Server Error");

        // Sanitize: Escape HTML characters to prevent XSS
        let reply = data.reply
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        // Simple Markdown-like parsing for bold text
        reply = reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        // Simple Markdown-like parsing for code/links (backticks)
        reply = reply.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-red-500 font-mono text-xs">$1</code>');

        messageElement.innerHTML = reply;

    } catch (error) {
        messageElement.classList.add("error");
        messageElement.textContent = error.message; // Show specific error from backend (e.g. "Python missing")
    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if (!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
