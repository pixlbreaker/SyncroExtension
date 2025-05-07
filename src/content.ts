import { ref, onValue, set } from "firebase/database";
import { db } from "./firebase-config";

chrome.storage.local.get(["room"], ({ room }) => {
    if (!room) return;

    const video = document.querySelector("video");
    if (!video) return;

    const roomRef = ref(db, `rooms/${room}`);
    let lastSent = 0;

    video.addEventListener("play", () => {
        set(roomRef, { action: "play", time: video.currentTime });
    });

    video.addEventListener("pause", () => {
        set(roomRef, { action: "pause", time: video.currentTime });
    });

    video.addEventListener("seeked", () => {
        set(roomRef, { action: "seek", time: video.currentTime });
    });

    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (!data || Date.now() - lastSent < 500) return;

        switch (data.action) {
            case "play":
                video.currentTime = data.time;
                video.play();
                break;
            case "pause":
                video.pause();
                video.currentTime = data.time;
                break;
            case "seek":
                video.currentTime = data.time;
                break;
        }

        lastSent = Date.now();
    });
});
