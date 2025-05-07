const roomInput = document.getElementById("room") as HTMLInputElement;
const joinButton = document.getElementById("join") as HTMLButtonElement;

joinButton.addEventListener("click", () => {
    const room = roomInput.value.trim();
    if (room) {
        chrome.storage.local.set({ room });
    }
});