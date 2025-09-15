<template>
    <div class="empty-state">
        <div class="empty-content">
            <div class="empty-icon">
                <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </div>
            <h3>Your Messages</h3>
            <p>Send private photos and messages to a friend or group</p>
            <button class="send-message-btn">Send Message</button>
        </div>
    </div>
</template>
<style scope>
.empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    width: 1060px;
}

.empty-content {
    text-align: center;
    max-width: 400px;
}

.empty-icon {
    margin-bottom: 16px;
}

.empty-icon svg {
    color: #262626;
}

.empty-content h3 {
    font-size: 22px;
    margin: 0 0 8px 0;
    color: #262626;
}

.empty-content p {
    color: #8e8e8e;
    margin: 0 0 24px 0;
    font-size: 14px;
}

.send-message-btn {
    background: #0095f6;
    color: #fff;
    border: none;
    padding: 8px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
}
</style>
