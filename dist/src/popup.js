"use strict";
const roomInput = document.getElementById("room");
const joinButton = document.getElementById("join");
joinButton.addEventListener("click", () => {
    const room = roomInput.value.trim();
    if (room) {
        chrome.storage.local.set({ room });
    }
});
