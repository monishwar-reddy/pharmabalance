document.addEventListener('DOMContentLoaded', function () {
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const API_KEY = config.API_KEY; // Read from config.js

    // Auto-resize textarea
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') {
            this.style.height = '50px';
        }
    });

    // Handle Enter key
    userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    chatForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        userInput.value = '';
        userInput.style.height = '50px';

        // Show loading indicator
        const loadingId = addLoadingIndicator();

        try {
            const response = await generateGeminiResponse(message);
            removeLoadingIndicator(loadingId);
            addMessage(response, 'bot');
        } catch (error) {
            console.error('Error:', error);
            removeLoadingIndicator(loadingId);
            addMessage('Sorry, I encountered an error. Please check your API key or try again later.', 'bot');
        }
    });

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = 'chat-message flex gap-4';

        const isUser = sender === 'user';
        const avatarClass = isUser ? 'fa-user text-secondary' : 'fa-robot text-primary';
        const bgClass = isUser ? 'bg-[#00d4ff]/10 border-primary/20' : 'bg-slate-800/80 border-slate-700';
        const roundedClass = isUser ? 'rounded-tr-none' : 'rounded-tl-none';

        div.innerHTML = `
            <div class="w-8 h-8 rounded-full ${isUser ? 'bg-secondary/20' : 'bg-primary/20'} flex items-center justify-center flex-shrink-0 order-${isUser ? '2' : '1'}">
                <i class="fa-solid ${avatarClass} text-sm"></i>
            </div>
            <div class="${bgClass} p-4 rounded-2xl ${roundedClass} border max-w-[80%] text-left order-${isUser ? '1' : '2'}">
                <p class="text-slate-200" style="margin: 0; white-space: pre-wrap;">${text}</p>
            </div>
        `;

        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addLoadingIndicator() {
        const id = 'loading-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'chat-message flex gap-4';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-robot text-primary text-sm"></i>
            </div>
            <div class="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700 max-w-[80%] text-left">
                <div class="flex gap-1 items-center h-6">
                    <div class="typing-dot w-2 h-2 bg-primary/60 rounded-full"></div>
                    <div class="typing-dot w-2 h-2 bg-primary/60 rounded-full"></div>
                    <div class="typing-dot w-2 h-2 bg-primary/60 rounded-full"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeLoadingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    async function generateGeminiResponse(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format');
        }
    }
});
