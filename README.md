# Automatic Speech Recognition Tool

## 1. Project Overview

The **Automatic Speech Recognition (ASR) Tool** is a lightweight web application that converts speech into text in real time. You click **Start Recording**, speak into your microphone, and the recognized text appears on the page as you talk.

Speech recognition is done by the browser's built-in **Web Speech API**, so there is no large AI model to download, no API key, and no database. A small **Flask** (Python) server delivers the web page.

## 2. Features

- Real-time speech-to-text with interim (live) and final results
- Continuous listening that does not stop after a short pause
- Automatic restart if Chrome or Edge ends the session unexpectedly
- Language selection: English (US/UK/India), Tamil, Hindi, Malayalam, Telugu, Kannada
- Start, Stop, Clear and Copy buttons
- Clear status and error messages (permission denied, no microphone, no speech, network error, unsupported browser)
- Clean, responsive interface for desktop and mobile
- `/health` endpoint for checking the server

## 3. Technologies Used

| Part | Technology |
|------|------------|
| Backend | Python 3, Flask |
| Frontend | HTML5, CSS3, JavaScript |
| Speech recognition | Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) |

## 4. Project Structure

```
ASR_Tool/
├── app.py              Flask server (routes: / and /health)
├── requirements.txt    Python dependencies (Flask only)
├── README.md           This file
├── .gitignore          Files Git should ignore
├── LICENSE             MIT license
├── templates/
│   └── index.html      Main web page
└── static/
    ├── style.css       Styling
    └── script.js       Speech recognition logic
```

## 5. Requirements

- Windows 10 or 11
- **Python 3.8 or newer** (download from https://www.python.org/downloads/ and tick **"Add Python to PATH"** during installation)
- **Visual Studio Code** (https://code.visualstudio.com/)
- **Google Chrome or Microsoft Edge** (recommended)
- A working microphone
- An internet connection (the browser's speech service needs it)

> **Browser note:** The Web Speech API is browser-dependent. It works in Chrome and Edge. Firefox does not support it, and Safari support is limited.

## 6. VS Code Setup

1. Extract `ASR_Tool.zip` (right-click, then **Extract All...**).
2. Open VS Code.
3. Choose **File, then Open Folder...** and select the extracted `ASR_Tool` folder.
4. (Optional) Install the **Python** extension from the Extensions panel (Ctrl+Shift+X).
5. Open a terminal with **Terminal, then New Terminal** (or press Ctrl+`).
6. Look at the terminal's name in the top-right of the terminal panel. It will say **powershell** or **cmd**. VS Code uses PowerShell by default on Windows. To switch, click the small arrow next to the **+** button and choose **Command Prompt**.

Pick **one** set of commands below (CMD **or** PowerShell) and do not mix them.

## 7. Virtual Environment Setup and Installation

### Option A: Command Prompt (CMD)

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

`venv\Scripts\activate` is **for CMD only**. After activation you will see `(venv)` at the start of the prompt.

### Option B: PowerShell

```
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

`venv\Scripts\Activate.ps1` is **for PowerShell only**.

If PowerShell shows an error such as *"running scripts is disabled on this system"*, run this once and then activate again:

```
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Type `Y` and press Enter if asked to confirm. This only affects your user account.

## 8. How to Run

With the virtual environment active (you see `(venv)`):

```
python app.py
```

You should see output ending with `Running on http://127.0.0.1:5000`. Then open this address in Chrome or Edge:

```
http://127.0.0.1:5000
```

To stop the server, click in the terminal and press **Ctrl+C**.

## 9. How to Test

| Test | Action | Expected result |
|------|--------|-----------------|
| 1 | Open `http://127.0.0.1:5000` | The page loads with the title "Automatic Speech Recognition Tool" |
| 2 | Select **English (US)** in the language dropdown | It is selected by default |
| 3 | Click **Start Recording** | The browser asks for microphone permission; click **Allow**. Status shows "Listening..." |
| 4 | Say: *"Hello, this is an automatic speech recognition test."* | Words appear live in the text box |
| 5 | Check the text box | The full sentence appears |
| 6 | Click **Stop** | Status shows "Stopped" and no more text is added |
| 7 | Click **Clear** | The text box is emptied |
| 8 | Speak again, then click **Copy** | Status shows "Text copied". Paste into Notepad (Ctrl+V) to confirm |
| 9 | Stop, choose another language such as **Hindi** or **Tamil**, then record and speak in it | Text appears in that language |
| 10 | Open `http://127.0.0.1:5000/health` | You see `{"service":"ASR Tool","status":"ok"}` |

## 10. Troubleshooting

**1. `requirements.txt` not found**
You are in the wrong folder. In VS Code use **File, then Open Folder** and select the `ASR_Tool` folder itself (the one that directly contains `requirements.txt`, not a folder that contains it). If the zip extracted into a nested folder, open the inner one. Check with `dir` (CMD) or `ls` (PowerShell).

**2. "Python is not recognized"**
Python is not installed or not on PATH. Reinstall Python and tick **Add Python to PATH**, then close and reopen VS Code. You can also try `py -m venv venv` and `py app.py` instead.

**3. "pip is not recognized"**
Use `python -m pip install -r requirements.txt` instead. If that fails, reinstall Python with the PATH option ticked.

**4. Virtual environment activation error**
- In **CMD** use `venv\Scripts\activate`.
- In **PowerShell** use `venv\Scripts\Activate.ps1`. If you see an execution policy error, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.
- If `venv` was not created, run `python -m venv venv` again and check that the `venv` folder appears.

**5. Microphone permission denied**
Click the **lock icon** (or tune icon) left of the address bar, set **Microphone** to **Allow**, then reload the page. Also check Windows: **Settings, then Privacy & security, then Microphone**, and make sure microphone access is on and that desktop apps are allowed.

**6. Microphone not detected**
Plug in or reconnect the microphone, then check **Settings, then System, then Sound, then Input** and confirm the right device is selected and the input level moves when you speak. Close other apps (Zoom, Teams) that may be using the microphone, then reload the page.

**7. Speech recognition stops immediately**
Check that you clicked **Allow** for the microphone, that you have internet access, and that you are using Chrome or Edge. Open the page at `127.0.0.1` or `localhost` (microphone access needs a secure origin). If the status says recognition keeps stopping, reload the page and try again.

**8. Browser does not support SpeechRecognition**
Use the latest Google Chrome or Microsoft Edge. Firefox does not support the Web Speech API.

**9. Network or speech service error**
Chrome and Edge send audio to an online speech service, so you need a working internet connection. Disable VPNs or strict firewalls that may block it, then try again.

**10. Port 5000 already in use**
Another program is using port 5000. Close it, or change the port in `app.py` (for example `port=5001`) and open `http://127.0.0.1:5001` instead.

## 11. How the ASR System Works

1. **Microphone permission.** When you click Start Recording, the page asks the browser for microphone access using `navigator.mediaDevices.getUserMedia`. This lets the app give a specific message if permission is denied or no microphone exists.
2. **Recognition session.** The page creates a `SpeechRecognition` object with `continuous = true` (keep listening) and `interimResults = true` (show partial text), and sets its language from the dropdown.
3. **Streaming results.** The browser streams audio to its speech service. The `onresult` event returns *interim* results (live guesses) and *final* results (confirmed phrases). Final text is added to the permanent text; interim text is shown temporarily.
4. **Automatic restart.** Chrome may end a session after silence or a time limit. In `onend`, if you have not clicked Stop, the app starts a new session after a short delay. A safety check prevents endless restart loops.
5. **Error handling.** The `onerror` event is mapped to clear messages for permission denied, no microphone, no speech, network failure and unsupported languages.
6. **Role of Flask.** Flask only serves the page (`/`) and a health check (`/health`). All speech processing happens in the browser.

## 12. GitHub Upload Instructions

1. Install Git from https://git-scm.com/ and create a free account at https://github.com/.
2. On GitHub click **New repository**, name it `ASR_Tool`, and do **not** add a README (this project already has one).
3. In the VS Code terminal, inside the project folder, run:

```
git init
git add .
git commit -m "Initial commit: Automatic Speech Recognition Tool"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ASR_Tool.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. The `.gitignore` file keeps the `venv` folder out of the upload. Update the name in `LICENSE` before publishing.

## 13. Demonstration Procedure

1. Introduce the project: speech-to-text using Flask and the browser's Web Speech API.
2. Show the project structure in the VS Code Explorer.
3. Start the server with `python app.py` and open `http://127.0.0.1:5000`.
4. Show `/health` returning `{"service":"ASR Tool","status":"ok"}`.
5. Select **English (India)** and click **Start Recording**. Allow the microphone.
6. Speak a few sentences, including a short pause, to show continuous listening and live interim text.
7. Click **Stop**, then demonstrate **Copy** (paste into Notepad) and **Clear**.
8. Switch to **Tamil** or **Hindi** and record a short phrase.
9. Demonstrate error handling: block the microphone in the browser and click Start Recording to show the permission message.
10. Explain the main parts: `onresult` (live and final text), `onend` (auto restart) and `onerror` (messages).

## License

Released under the MIT License. See `LICENSE`.
