// Existing knowledge base
const knowledgeBase = {
  math: {
        elementary: {
            keywords: {
                'add': {
                    simple: 'Addition is combining numbers to find their total.',
                    detailed: `Addition is when you combine two or more numbers together to get a new number called the sum. 
                    
For example:
If you have 3 apples and get 2 more apples, you add 3 + 2 to find out you now have 5 apples total.

Let's practice:
1. What is 4 + 3?
2. If you have 6 cookies and your friend gives you 5 more, how many do you have now?`,
                    examples: [
                        {problem: "2 + 3 = ?", solution: "5", explanation: "Count forward 3 more after 2: 2, 3, 4, 5"},
                        {problem: "4 + 4 = ?", solution: "8", explanation: "Double 4, or count: 4, 5, 6, 7, 8"}
                    ]
                },
                'subtract': {
                    simple: 'Subtraction is finding the difference between numbers.',
                    detailed: `Subtraction is when you take away some things from a group to find out how many are left. 
                    
For example:
If you have 5 candies and eat 2 of them, you subtract 2 from 5 (5 - 2) to find out you have 3 candies left.

Let's practice:
1. What is 7 - 3?
2. If you have 8 stickers and give 4 to your friend, how many do you have left?`,
                    examples: [
                        {problem: "5 - 2 = ?", solution: "3", explanation: "Start at 5, count backward 2: 5, 4, 3"},
                        {problem: "10 - 5 = ?", solution: "5", explanation: "Half of 10 is 5, or count backward: 10, 9, 8, 7, 6, 5"}
                    ]
                }
            }
        },
        middle: {
            keywords: {
                'algebra': {
                    simple: 'Algebra uses letters and symbols to represent numbers.',
                    detailed: `Algebra is a branch of mathematics that uses letters (variables) to represent unknown numbers. This helps us solve problems and describe mathematical patterns.

For example:
If we know that x + 5 = 12, we can find x by subtracting 5 from both sides: x = 7

Let's practice:
1. If y + 3 = 10, what is y?
2. If 2x = 14, what is x?`,
                    examples: [
                        {problem: "Solve: x + 2 = 6", solution: "x = 4", explanation: "Subtract 2 from both sides: x + 2 - 2 = 6 - 2"},
                        {problem: "Solve: 3x = 15", solution: "x = 5", explanation: "Divide both sides by 3: 3x ÷ 3 = 15 ÷ 3"}
                    ]
                }
            }
        }
    },
    science: {
        elementary: {
            keywords: {
                'plant': {
                    simple: 'Plants are living things that need water and sunlight to grow.',
                    detailed: `Plants are living organisms that can make their own food using sunlight, water, and air. This process is called photosynthesis.

Key parts of a plant:
1. Roots - Take water and nutrients from soil
2. Stem - Carries water and food through the plant
3. Leaves - Catch sunlight to make food
4. Flowers - Make seeds for new plants

Let's explore:
1. What do plants need to grow?
2. Can you name the main parts of a plant?`,
                    examples: [
                        {problem: "What do plants need to live?", solution: "Sunlight, water, air, and nutrients from soil"},
                        {problem: "How do plants make food?", solution: "Through photosynthesis using sunlight, water, and air"}
                    ]
                }
            }
        }
    }
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
