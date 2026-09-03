cd /D "%~dp0"
cd ".\JS Files"
copy /B Main.js + Menu.js + UpdateGame.js + DrawGame.js + UpdateCircuit.js + PrepareCircuit.js + DrawWires.js + DrawGates.js + EventHandlers.js + EndScreen.js + Tutorial.js + LevelInfo.js "..\Game.js"
