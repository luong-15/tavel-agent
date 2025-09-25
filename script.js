const apiKey = "AIzaSyDkcJeEiUK-zJWM2MOL7jsW7cnIMK1EDJQ";
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const suggestedQuestions = document.getElementById('suggested-questions');
const conversationList = document.getElementById('conversation-list');
const startNewConversationButton = document.getElementById('start-new-conversation-button');
const newChatDialog = document.getElementById('new-chat-dialog');
const newChatNameInput = document.getElementById('new-chat-name-input');
const cancelNewChatBtn = document.getElementById('cancel-new-chat-btn');
const confirmNewChatBtn = document.getElementById('confirm-new-chat-btn');
const deleteChatBtn = document.getElementById('delete-chat-btn');
const deleteConfirmDialog = document.getElementById('delete-confirm-dialog');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const toggleNavButton = document.getElementById('toggle-nav-button');
const navigationPanel = document.querySelector('.navigation-panel');

const CHAT_STORAGE_KEY = 'gemini_conversations';

let conversations = [];
let currentConversationId = null;
let imageToUpload = null;
let isTyping = false; // Biến trạng thái để kiểm tra nếu trợ lý đang gõ

// Lưu danh sách cuộc trò chuyện vào Local Storage
const saveConversations = () => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
};

// Tải danh sách cuộc trò chuyện từ Local Storage
const loadConversations = () => {
    const storedConversations = localStorage.getItem(CHAT_STORAGE_KEY);
    if (storedConversations) {
        conversations = JSON.parse(storedConversations);
        if (conversations.length > 0) {
            currentConversationId = conversations[0].id;
        }
    }
};

// Lấy cuộc trò chuyện hiện tại
const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversationId);
};

// Render danh sách cuộc trò chuyện trên thanh điều hướng
const renderConversationList = () => {
    conversationList.innerHTML = '';
    conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = `conversation-item ${conv.id === currentConversationId ? 'active' : ''}`;
        item.dataset.id = conv.id;
        item.innerHTML = `
            <span class="truncate">${conv.name}</span>
        `;
        item.addEventListener('click', () => {
            currentConversationId = conv.id;
            displayMessages();
            renderConversationList();
            // Close nav panel on mobile after selection
            if (window.innerWidth <= 640) {
                navigationPanel.classList.remove('visible');
            }
        });
        conversationList.appendChild(item);
    });
};

// --- Hàm để thêm tin nhắn vào giao diện với hiệu ứng gõ chữ mới ---
const addMessage = (role, text, image = null) => {
    const normalizedRole = normalizeRole(role);
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', normalizedRole);
    
    const avatar = document.createElement('div');
    avatar.classList.add('avatar', normalizedRole === 'user' ? 'user-avatar' : 'gemini-avatar');
    avatar.textContent = normalizedRole === 'user' ? 'Bạn' : 'AI';
    
    const content = document.createElement('div');
    content.classList.add('message-content');
    
    // Xử lý nội dung văn bản và hình ảnh
    if (image) {
        const img = document.createElement('img');
        img.src = image;
        img.alt = 'Tin nhắn hình ảnh';
        img.classList.add('message-image');
        content.appendChild(img);
    }
    
    if (text) {
        const textNode = document.createElement('div');
        textNode.classList.add('message-text');

        if (normalizedRole === 'model') {
            content.appendChild(textNode);
            animateGeminiText(textNode, text);
        } else {
            textNode.textContent = text;
            content.appendChild(textNode);
        }
    }

    if (normalizedRole === 'user') {
        messageElement.appendChild(content);
        messageElement.appendChild(avatar);
    } else {
        messageElement.appendChild(avatar);
        messageElement.appendChild(content);
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
};
    
        // --- Hàm định dạng văn bản từ Gemini (Markdown, newlines) ---
        const formatGeminiText = (text) => {
            // Kiểm tra text có tồn tại không
            if (!text) return '';
            
            let formattedText = text;

            // Xử lý tiêu đề dạng **text:** thành <h3>
            formattedText = formattedText.replace(/\n\*\*(.*?):\*\*/g, '\n\n<h3>$1:</h3>');

            // Xử lý danh sách. Tách các dòng có dấu * và chuyển thành thẻ <li>
            formattedText = formattedText.replace(/(\n\* [^\n]+)+/g, (match) => {
                // Tách từng dòng và tạo thẻ <li>
                const listItems = match.split('\n* ').filter(item => item.trim() !== '');
                const htmlItems = listItems.map(item => `<li>${item.trim()}</li>`).join('');
                // Bao bọc toàn bộ danh sách bằng thẻ <ul>
                return `<ul>${htmlItems}</ul>`;
            });

            // Xử lý in đậm
            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

            // Xử lý in nghiêng
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<i>$1</i>');
            
            // Xử lý các dòng xuống hàng còn lại thành <br>
            formattedText = formattedText.replace(/\n/g, '<br>');

            return formattedText;
        };

// Hàm hiệu ứng gõ chữ
const animateGeminiText = (element, text) => {
    const cursor = '<span class="typing-cursor">|</span>'; // Con trỏ gõ
    let i = 0;
    isTyping = true;
    element.innerHTML = cursor; // Đặt con trỏ ban đầu
    let currentContent = '';

    const typingInterval = setInterval(() => {
        if (i < text.length) {
            currentContent += text[i];
            const formattedContent = formatGeminiText(currentContent);
            element.innerHTML = formattedContent + cursor;
            chatMessages.scrollTop = chatMessages.scrollHeight;
            i++;
        } else {
            clearInterval(typingInterval);
            isTyping = false;
            element.innerHTML = formatGeminiText(currentContent); // Xóa con trỏ sau khi gõ xong
        }
    }, 5); // Tốc độ gõ: 25ms/ký tự
};

// Hiển thị tin nhắn của cuộc trò chuyện hiện tại
const displayMessages = () => {
    const currentConv = getCurrentConversation();
    chatMessages.innerHTML = '';
    if (currentConv) {
        currentConv.messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', msg.role);

            const avatar = document.createElement('div');
            avatar.classList.add('avatar', msg.role === 'user' ? 'user-avatar' : 'gemini-avatar');
            avatar.textContent = msg.role === 'user' ? 'Bạn' : 'AI';

            const content = document.createElement('div');
            content.classList.add('message-content');
            
            if (msg.role === 'user') {
                messageElement.appendChild(content);
                messageElement.appendChild(avatar);
            } else {
                messageElement.appendChild(avatar);
                messageElement.appendChild(content);
            }

            if (msg.image) {
                const img = document.createElement('img');
                img.src = msg.image;
                img.alt = 'Uploaded Image';
                img.classList.add('message-image');
                content.appendChild(img);
            }
            
            const textNode = document.createElement('div');
            textNode.innerHTML = formatGeminiText(msg.text);
            textNode.classList.add('message-text');
            content.appendChild(textNode);

            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
};

// Bắt đầu một cuộc trò chuyện mới
const startNewConversation = (name = 'Chuyến đi mới') => {
    const newConversation = {
        id: Date.now(),
        name: name,
        messages: []
    };
    conversations.unshift(newConversation); // Thêm vào đầu danh sách
    currentConversationId = newConversation.id;
    saveConversations();
    displayMessages();
    renderConversationList();
    document.getElementById('current-chat-name').textContent = name;
    suggestedQuestions.classList.remove('hidden');
};

// Gửi tin nhắn
const sendMessage = async () => {
    const input = chatInput.value.trim();
    if (!input && !imageToUpload) return;
    if (isTyping) return;

    const currentConv = getCurrentConversation();
    if (!currentConv) {
        startNewConversation(input.substring(0, 30) + '...');
        return sendMessage(); // Thử lại sau khi tạo cuộc trò chuyện mới
    }

    // Thêm tin nhắn của người dùng vào cuộc trò chuyện
    const userMessage = {
        role: 'user', // Đảm bảo luôn dùng 'user'
        text: input,
        image: imageToUpload ? URL.createObjectURL(imageToUpload) : null,
        timestamp: Date.now()
    };
    currentConv.messages.push(userMessage);
    saveConversations();
    displayMessages();
    
    // Hiện hiệu ứng "đang gõ"
    const typingMessage = {
        role: 'model',
        text: '...'
    };
    const typingMessageElement = addMessage(typingMessage.role, typingMessage.text);
    const typingIndicator = createTypingIndicator();
    const messageContent = typingMessageElement.querySelector('.message-content');
    if (messageContent) { // Ensure the element exists before manipulating it
        messageContent.innerHTML = ''; // Clear '...'
        messageContent.appendChild(typingIndicator);
    }
    
    chatInput.value = '';
    imageToUpload = null;
    imagePreview.classList.add('hidden');
    suggestedQuestions.classList.add('hidden');
    sendButton.disabled = true;

    try {
        // Gọi API Gemini
        const history = currentConv.messages.map(msg => ({
            // Chuyển đổi role để đảm bảo chỉ sử dụng 'user' hoặc 'model'
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [
                {
                    text: msg.text || ''
                }
            ]
        }));
        
        // Ghi lại payload để gỡ lỗi
        console.log('Sending payload:', {
            contents: history
        });
        
        const payload = {
            contents: history,
            tools: [{ "google_search": {} }],
            systemInstruction: {
                parts: [{ text: "You are a friendly and helpful travel assistant. Keep your responses concise and engaging." }]
            },
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 403) {
                 throw new Error('Lỗi xác thực: Vui lòng kiểm tra khóa API của bạn.');
            } else {
                 throw new Error(`Lỗi API: ${errorData.error.message || response.statusText}`);
            }
        }

        const result = await response.json();
        const geminiText = result.candidates[0].content.parts[0].text;
        
        // Thay thế hiệu ứng "đang gõ" bằng tin nhắn thật
        typingMessageElement.remove(); // Xóa tin nhắn "đang gõ"
        
        // Thêm tin nhắn trả lời của Gemini với hiệu ứng gõ
        const geminiMessage = {
            role: 'model', // Đảm bảo luôn dùng 'model'
            text: geminiText,
            timestamp: Date.now()
        };
        currentConv.messages.push(geminiMessage);
        saveConversations();

        addMessage('model', geminiText);

    } catch (error) {
        console.error('Lỗi khi gọi API Gemini:', error);
        // Thêm tin nhắn lỗi với hiệu ứng gõ
        typingMessageElement.remove();
        addMessage('model', error.message);
    } finally {
        sendButton.disabled = false;
    }
};

// Hàm tạo hiệu ứng "đang gõ"
function createTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        indicator.appendChild(dot);
    }
    return indicator;
}

// Sự kiện click nút gửi
sendButton.addEventListener('click', sendMessage);

// Sự kiện nhấn Enter trong ô input
chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
    
// Xử lý nút tải ảnh lên
const imageUploadButton = document.getElementById('image-upload-button');
const removeImageBtn = document.getElementById('remove-image-btn');
imageUploadButton.addEventListener('click', () => {
    imageUpload.click();
});
    
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        imageToUpload = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImageElement = document.getElementById('preview-image');
            if (previewImageElement) { // Thêm kiểm tra này để tránh lỗi
                previewImageElement.src = e.target.result;
                imagePreview.classList.remove('hidden');
            } else {
                console.error('Lỗi: Không tìm thấy phần tử có ID "preview-image".');
            }
        };
        reader.readAsDataURL(file);
    }
});
    
removeImageBtn.addEventListener('click', () => {
    imageToUpload = null;
    imageUpload.value = null;
    imagePreview.classList.add('hidden');
});

// Xử lý các câu hỏi gợi ý
suggestedQuestions.addEventListener('click', (event) => {
    if (event.target.classList.contains('question-button')) {
        const questionText = event.target.textContent;
        chatInput.value = questionText;
        sendMessage();
    }
});

// Xử lý các nút điều hướng
startNewConversationButton.addEventListener('click', () => {
    newChatDialog.classList.remove('hidden');
});

confirmNewChatBtn.addEventListener('click', () => {
    const newName = newChatNameInput.value.trim();
    if (newName) {
        startNewConversation(newName);
        newChatNameInput.value = '';
        newChatDialog.classList.add('hidden');
    }
});

cancelNewChatBtn.addEventListener('click', () => {
    newChatNameInput.value = '';
    newChatDialog.classList.add('hidden');
});

// Xử lý hiển thị dialog xác nhận xóa
deleteChatBtn.addEventListener('click', () => {
    if (currentConversationId) {
        deleteConfirmDialog.classList.remove('hidden');
    }
});

// Xử lý hủy xóa
cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmDialog.classList.add('hidden');
});

// Xử lý xác nhận xóa
confirmDeleteBtn.addEventListener('click', () => {
    if (currentConversationId) {
        conversations = conversations.filter(conv => conv.id !== currentConversationId);
        if (conversations.length > 0) {
            currentConversationId = conversations[0].id;
        } else {
            startNewConversation();
        }
        saveConversations();
        displayMessages();
        renderConversationList();
    }
    deleteConfirmDialog.classList.add('hidden');
});

// Xử lý nút bật tắt thanh điều hướng trên di động
toggleNavButton.addEventListener('click', () => {
    navigationPanel.classList.toggle('visible');
});

// Khởi tạo ứng dụng
loadConversations();
if (conversations.length === 0) {
    startNewConversation('Chuyến đi đầu tiên của bạn');
} else {
    displayMessages();
}
renderConversationList();

// Hàm chuyển đổi role cho đúng định dạng API
const normalizeRole = (role) => {
    return role === 'user' ? 'user' : 'model';
};