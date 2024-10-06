// Existing knowledge base
const knowledgeBase = {
    // ... keep your existing knowledge base ...
};

// Wikipedia API endpoint
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';

async function searchWikipedia(query) {
    const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*'
    });

    try {
        const response = await fetch(`${WIKIPEDIA_API}?${params}`);
        const data = await response.json();
        if (data.query.search.length > 0) {
            const topResult = data.query.search[0];
            return {
                title: topResult.title,
                snippet: stripHtml(topResult.snippet),
                fullUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(topResult.title)}`
            };
        }
    } catch (error) {
        console.error('Wikipedia search error:', error);
    }
    return null;
}

function stripHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

function showTypingIndicator() {
    const chatBox = document.getElementById('chatBox');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const gradeLevel = document.getElementById('gradeLevel').value;
    const subject = document.getElementById('subject').value;
    
    const userQuestion = userInput.value.trim();
    if (userQuestion === '') return;
    
    // Disable input while processing
    const sendButton = document.getElementById('sendButton');
    userInput.disabled = true;
    sendButton.disabled = true;
    
    // Add user message
    addMessage('user', userQuestion);
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    try {
        // First check local knowledge base
        let botResponse = findAnswer(userQuestion, subject, gradeLevel);
        
        if (botResponse.includes("I'm sorry")) {
            // If no local answer, search Wikipedia
            const searchResult = await searchWikipedia(userQuestion);
            
            if (searchResult) {
                botResponse = `Based on web search: ${searchResult.snippet}\n\nLearn more: ${searchResult.fullUrl}`;
            } else {
                botResponse = "I couldn't find an answer to your question, even after searching the web. Could you try rephrasing it?";
            }
        }
        
        // Remove typing indicator and add bot response
        removeTypingIndicator(typingIndicator);
        addMessage('bot', botResponse);
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingIndicator);
        addMessage('bot', 'Sorry, I encountered an error while searching. Please try again.');
    }
    
    // Re-enable input
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.value = '';
}

function addMessage(sender, text) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function findAnswer(question, subject, gradeLevel) {
    question = question.toLowerCase();
    
    if (subject === 'any') {
        // Search all subjects if 'any' is selected
        for (let subj in knowledgeBase) {
            if (knowledgeBase[subj][gradeLevel]) {
                const answer = searchSubject(question, knowledgeBase[subj][gradeLevel].keywords);
                if (answer) return answer;
            }
        }
    } else if (knowledgeBase[subject] && knowledgeBase[subject][gradeLevel]) {
        const answer = searchSubject(question, knowledgeBase[subject][gradeLevel].keywords);
        if (answer) return answer;
    }
    
    return "I'll search the web for an answer...";
}

function searchSubject(question, keywords) {
    for (let keyword in keywords) {
        if (question.includes(keyword.toLowerCase())) {
            return keywords[keyword];
        }
    }
    return null;
}

// Add event listener for Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
