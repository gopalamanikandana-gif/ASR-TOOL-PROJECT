/*
 * Automatic Speech Recognition Tool - front-end logic.
 * Uses the browser's Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 */

(function () {
    "use strict";

    // ---------- Page elements ----------
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const clearBtn = document.getElementById("clearBtn");
    const copyBtn = document.getElementById("copyBtn");
    const languageSelect = document.getElementById("language");
    const output = document.getElementById("output");
    const statusBox = document.getElementById("status");
    const statusText = document.getElementById("statusText");

    // ---------- State ----------
    let recognition = null;      // the SpeechRecognition object
    let isRecording = false;     // true while the USER wants recording on
    let finalText = "";          // confirmed text
    let interimText = "";        // text still being processed
    let restartTimer = null;
    let recentRestarts = [];     // timestamps, used to avoid endless restart loops

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    // ---------- Status helper ----------
    // type: "idle" | "listening" | "warning" | "error"
    function setStatus(message, type) {
        statusText.textContent = message;
        statusBox.className = "status status-" + (type || "idle");
    }

    function updateButtons() {
        startBtn.disabled = isRecording || !SpeechRecognitionAPI;
        stopBtn.disabled = !isRecording;
    }

    // Show confirmed text plus interim (not yet confirmed) text in the text area.
    function render() {
        output.value = finalText + interimText;
        output.scrollTop = output.scrollHeight;
    }

    // ---------- Browser support check ----------
    if (!SpeechRecognitionAPI) {
        setStatus(
            "Speech recognition is not available in this browser. Please use Google Chrome or Microsoft Edge.",
            "error"
        );
        updateButtons();
    }

    // ---------- Create and configure the recognizer ----------
    function createRecognition() {
        const rec = new SpeechRecognitionAPI();
        rec.lang = languageSelect.value;
        rec.continuous = true;        // keep listening through pauses
        rec.interimResults = true;    // show partial results
        rec.maxAlternatives = 1;

        rec.onstart = function () {
            setStatus("Listening... Speak now.", "listening");
        };

        rec.onresult = function (event) {
            recentRestarts = [];      // we got speech, so everything is healthy
            let interim = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    if (finalText && !/\s$/.test(finalText)) finalText += " ";
                    finalText += transcript.trim() + " ";
                } else {
                    interim += transcript;
                }
            }
            interimText = interim;
            render();
            setStatus("Listening... Speak now.", "listening");
        };

        rec.onerror = function (event) {
            handleError(event.error);
        };

        rec.onend = function () {
            interimText = "";
            render();

            // Chrome ends sessions on its own (after silence or a timeout).
            // If the user has not clicked Stop, quietly start a new session.
            if (isRecording) {
                scheduleRestart();
            }
        };

        return rec;
    }

    // ---------- Automatic restart ----------
    function scheduleRestart() {
        const now = Date.now();
        recentRestarts = recentRestarts.filter(function (t) { return now - t < 5000; });
        recentRestarts.push(now);

        // More than 6 restarts in 5 seconds with no speech = something is wrong.
        if (recentRestarts.length > 6) {
            stopRecording(false);
            setStatus(
                "Recognition keeps stopping. Check your microphone and internet connection, then try again.",
                "error"
            );
            return;
        }

        clearTimeout(restartTimer);
        restartTimer = setTimeout(function () {
            if (!isRecording) return;
            try {
                recognition = createRecognition();
                recognition.start();
            } catch (err) {
                stopRecording(false);
                setStatus("Could not restart recognition: " + err.message, "error");
            }
        }, 300);
    }

    // ---------- Error handling ----------
    function handleError(code) {
        switch (code) {
            case "no-speech":
                // Not fatal: stay in recording mode, the session will restart.
                setStatus("No speech detected yet. Keep speaking or check your microphone.", "warning");
                break;

            case "aborted":
                // Happens when we stop/restart on purpose. Ignore.
                break;

            case "not-allowed":
            case "service-not-allowed":
                stopRecording(false);
                setStatus(
                    "Microphone permission denied. Click the lock icon in the address bar, allow the microphone, then reload the page.",
                    "error"
                );
                break;

            case "audio-capture":
                stopRecording(false);
                setStatus(
                    "No microphone found. Connect a microphone and check Windows sound settings.",
                    "error"
                );
                break;

            case "network":
                stopRecording(false);
                setStatus(
                    "Network error. The speech service needs an internet connection. Check your connection and try again.",
                    "error"
                );
                break;

            case "language-not-supported":
                stopRecording(false);
                setStatus("This language is not supported by your browser. Please choose another language.", "error");
                break;

            default:
                stopRecording(false);
                setStatus("Speech recognition error: " + code, "error");
        }
    }

    // ---------- Start / Stop ----------
    async function startRecording() {
        if (!SpeechRecognitionAPI || isRecording) return;

        setStatus("Requesting microphone permission...", "warning");

        // Ask for the microphone first so we can give clear error messages.
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(function (track) { track.stop(); });
            } catch (err) {
                if (err.name === "NotAllowedError" || err.name === "SecurityError") {
                    handleError("not-allowed");
                } else if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
                    handleError("audio-capture");
                } else if (err.name === "NotReadableError") {
                    setStatus("The microphone is being used by another application. Close it and try again.", "error");
                } else {
                    setStatus("Could not access the microphone: " + err.message, "error");
                }
                return;
            }
        }

        isRecording = true;
        recentRestarts = [];
        updateButtons();
        languageSelect.title = "Changing the language while recording restarts listening.";

        try {
            recognition = createRecognition();
            recognition.start();
        } catch (err) {
            stopRecording(false);
            setStatus("Could not start recognition: " + err.message, "error");
        }
    }

    // showMessage = true when the user clicked Stop.
    function stopRecording(showMessage) {
        isRecording = false;
        clearTimeout(restartTimer);

        if (recognition) {
            try { recognition.stop(); } catch (e) { /* already stopped */ }
        }

        interimText = "";
        render();
        updateButtons();

        if (showMessage) {
            setStatus("Stopped. Click \"Start Recording\" to continue.", "idle");
        }
    }

    // ---------- Clear ----------
    function clearText() {
        finalText = "";
        interimText = "";
        render();
        if (!isRecording) {
            setStatus("Text cleared.", "idle");
        }
    }

    // ---------- Copy ----------
    async function copyText() {
        const text = output.value.trim();
        if (!text) {
            setStatus("Nothing to copy yet.", "warning");
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            setStatus("Text copied to clipboard.", isRecording ? "listening" : "idle");
        } catch (err) {
            // Fallback for older browsers.
            output.select();
            const ok = document.execCommand("copy");
            setStatus(ok ? "Text copied to clipboard." : "Copy failed. Select the text and press Ctrl+C.",
                      ok ? "idle" : "error");
        }
    }

    // ---------- Events ----------
    startBtn.addEventListener("click", startRecording);
    stopBtn.addEventListener("click", function () { stopRecording(true); });
    clearBtn.addEventListener("click", clearText);
    copyBtn.addEventListener("click", copyText);

    // If the user edits the text by hand, keep our stored text in sync.
    output.addEventListener("input", function () {
        finalText = output.value;
        interimText = "";
    });

    // Changing language while recording: restart with the new language.
    languageSelect.addEventListener("change", function () {
        if (isRecording && recognition) {
            setStatus("Switching language...", "warning");
            try { recognition.stop(); } catch (e) { /* ignore */ }
            // onend will restart automatically using the new language.
        }
    });

    updateButtons();
})();
