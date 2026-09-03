"use strict";

// Allow user to consent to audio, rather than blocking it. Overall approach based on:
// https://forum.unity.com/threads/chrome-on-the-dev-branch-version-66-may-block-audio-for-unity-webgl.517758/page-2#post-3495799

const AutoplayCheck = {
    gameInstance: null,
    autoplayPrompt: null,
    runtimeLoaded: false,
    gameRunning: false,

    disableAutorunIfNecessary: function() {
        AutoplayCheck.gameInstance.Module.noInitialRun = true;
    },

    runGame: function(event) {
        if (event && event.keyCode && !(event.keyCode == 32 || event.keyCode == 13)) {
            // For keyboard presses, only allow the space and return keys to start the game
            return;
        }

        AutoplayCheck.gameInstance.container.removeEventListener("click", AutoplayCheck.runGame);
        document.removeEventListener("keydown", AutoplayCheck.runGame);

        const fullScreenButton = document.getElementsByClassName("fullscreen")[0];
        fullScreenButton.removeEventListener("mousedown", AutoplayCheck.runGame);

        AutoplayCheck.gameRunning = true;
        AutoplayCheck.gameInstance.Module.callMain();

        AutoplayCheck.autoplayPrompt.style.opacity = 0;

        setTimeout(function() {
            AutoplayCheck.gameInstance.container.removeChild(AutoplayCheck.autoplayPrompt);
            AutoplayCheck.autoplayPrompt = null;
        }, 500);
    },

    runAndGoToFullscreen: function(event) {
        if (AutoplayCheck.runtimeLoaded) {
            if (AutoplayCheck.gameInstance.Module.noInitialRun && !AutoplayCheck.gameRunning) {
                setTimeout(function() {
                    AutoplayCheck.gameInstance.SetFullscreen(1);
                }, 0);

                AutoplayCheck.runGame();

            } else {
                AutoplayCheck.gameInstance.SetFullscreen(1);
            }
        }
    },

    onRuntimeLoaded: function() {
        AutoplayCheck.runtimeLoaded = true;
        const fullScreenButton = document.getElementsByClassName("fullscreen")[0];
        fullScreenButton.onclick = AutoplayCheck.runAndGoToFullscreen;
        fullScreenButton.classList.remove(["disabled"]);
        fullScreenButton.addEventListener("mousedown", AutoplayCheck.runGame); // Hack to make this work in Firefox (i.e. run game on mouse down, then go fullscreen on mouse up)

        if (AutoplayCheck.gameInstance.Module.noInitialRun) {
            AutoplayCheck.gameInstance.container.addEventListener("click", AutoplayCheck.runGame);
            document.addEventListener("keydown", AutoplayCheck.runGame);

            AutoplayCheck.autoplayPrompt = document.createElement("div");
            AutoplayCheck.autoplayPrompt.className = "autoplay"
            AutoplayCheck.autoplayPrompt.style.opacity = 0;

            const heading = document.createElement("h1");
            heading.textContent = "Click here to play.";

            const body = document.createElement("p");
            body.textContent = "If the game's audio doesn't play, try enabling auto-play in your browser settings.";

            AutoplayCheck.autoplayPrompt.appendChild(heading);
            AutoplayCheck.autoplayPrompt.appendChild(document.createElement("br"));
            AutoplayCheck.autoplayPrompt.appendChild(body);
            AutoplayCheck.gameInstance.container.appendChild(AutoplayCheck.autoplayPrompt);

            setTimeout(function() {
                AutoplayCheck.autoplayPrompt.style.opacity = 1;
            }, 0);
        }
    }
}
