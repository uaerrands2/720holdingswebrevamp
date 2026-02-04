// Global JavaScript

// Initialize floating actions on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeFloatingActions();
});


// Initialize floating WhatsApp and Chatbot
function initializeFloatingActions() {
    // Create floating actions HTML if not already present
    if (!document.querySelector('.floating-actions')) {
        const floatingHTML = `
            <div class="floating-actions">
                <a href="https://wa.me/254723518210" target="_blank" class="whatsapp-icon" title="Chat with us on WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </a>
                <button class="chatbot-icon" id="chatbot-toggle-btn" title="Chat with our bot">
                    <i class="fas fa-comments"></i>
                </button>
            </div>
            
            <div class="chatbot-widget" id="chatbot-widget">
                <div class="chatbot-header">
                    <h3>Chat with us</h3>
                    <button class="chatbot-close" id="chatbot-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="chatbot-message bot">
                        Hello! 👋 How can we help you today? Feel free to ask about our products or services.
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Type your message...">
                    <button class="chatbot-send" id="chatbot-send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', floatingHTML);
    }
    
    // Chatbot toggle functionality
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatbotWidget = document.getElementById('chatbot-widget');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSendBtn = document.getElementById('chatbot-send-btn');
    const chatbotMessages = document.getElementById('chatbot-messages');
    
    if (chatbotToggleBtn) {
        chatbotToggleBtn.addEventListener('click', function() {
            chatbotWidget.classList.toggle('active');
            if (chatbotWidget.classList.contains('active')) {
                chatbotInput.focus();
            }
        });
    }
    
    if (chatbotCloseBtn) {
        chatbotCloseBtn.addEventListener('click', function() {
            chatbotWidget.classList.remove('active');
        });
    }
    
    // Handle sending messages
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message === '') return;
        
        // Add user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chatbot-message user';
        userMessageDiv.textContent = message;
        chatbotMessages.appendChild(userMessageDiv);
        
        // Clear input
        chatbotInput.value = '';
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        // Simulate bot response after a delay
        setTimeout(() => {
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'chatbot-message bot';
            botMessageDiv.textContent = getBotResponse(message);
            chatbotMessages.appendChild(botMessageDiv);
            
            // Scroll to bottom
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }, 500);
    }
    
    if (chatbotSendBtn) {
        chatbotSendBtn.addEventListener('click', sendMessage);
    }
    
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Dummy bot responses
function getBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    const responses = {
        'curtain': 'We offer premium powder-coated curtain rods for all types of windows. Would you like to know more about our Executive Curtain Rods?',
        'paint': 'SetPaints provides professional-grade paints for interior and exterior use. What type of painting project are you planning?',
        'hardware': 'Set Hardware supplies a wide range of building and door hardware. What specific items are you looking for?',
        'solar': 'SunWatch Solar offers eco-friendly solar lighting solutions. Interested in our solar products?',
        'price': 'For pricing information, please visit our shop page or contact us directly at info@seventwentyholdings.co.ke',
        'order': 'You can order through our website or contact us for bulk orders. Would you like help placing an order?',
        'delivery': 'We offer nationwide delivery! Delivery times depend on your location. Where are you located?',
        'contact': 'You can reach us at 0723 518 210 or info@seventwentyholdings.co.ke',
        'help': 'I can help you with information about our products, pricing, delivery, and more! What would you like to know?'
    };
    
    // Check for keywords in the message
    for (let keyword in responses) {
        if (message.includes(keyword)) {
            return responses[keyword];
        }
    }
    
    // Default response
    return 'Thanks for your message! For specific inquiries, please contact us at 0723 518 210 or info@seventwentyholdings.co.ke. We\'ll be happy to help! 😊';
}
