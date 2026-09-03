function UnityProgress(gameInstance, progress) {
    if (!gameInstance.Module)
        return;
    if (!gameInstance.logo) {
        gameInstance.logo = document.createElement("div");
        gameInstance.logo.className = "logo " + gameInstance.Module.splashScreenStyle;
        gameInstance.container.appendChild(gameInstance.logo);
    }
    if (!gameInstance.progress) {
        gameInstance.progress = document.createElement("div");
        gameInstance.progress.className = "progress " + gameInstance.Module.splashScreenStyle;
        gameInstance.progress.empty = document.createElement("div");
        gameInstance.progress.empty.className = "empty";
        gameInstance.progress.appendChild(gameInstance.progress.empty);
        gameInstance.progress.full = document.createElement("div");
        gameInstance.progress.full.className = "full";
        gameInstance.progress.appendChild(gameInstance.progress.full);
        gameInstance.container.appendChild(gameInstance.progress);
    }

    gameInstance.progress.full.style.width = (100 * progress) + "%";
    gameInstance.progress.empty.style.width = (100 * (1 - progress)) + "%";

    if (progress == 1) {
        gameInstance.logo.style.opacity = 0.0;
        gameInstance.progress.style.opacity = 0.0;

        setTimeout(function() {
            gameInstance.container.removeChild(gameInstance.logo);
            gameInstance.container.removeChild(gameInstance.progress);
        }, 500);
    }
}
