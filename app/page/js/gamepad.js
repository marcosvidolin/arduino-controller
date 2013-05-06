var gamepadSupport = {
    TYPICAL_BUTTON_COUNT : 16,
    TYPICAL_AXIS_COUNT : 4,
    ticking : false,
    gamepads : [],
    prevRawGamepadTypes : [],
    prevTimestamps : [],
    init : function() {
        configureJoystick(); // custom
        var gamepadSupportAvailable = !!navigator.webkitGetGamepads
                || !!navigator.webkitGamepads
                || (navigator.userAgent.indexOf('Firefox/') != -1);
        if (!gamepadSupportAvailable) {
            tester.showNotSupported();
        } else {
            window.addEventListener('MozGamepadConnected',
                    gamepadSupport.onGamepadConnect, false);
            window.addEventListener('MozGamepadDisconnected',
                    gamepadSupport.onGamepadDisconnect, false);
            if (!!navigator.webkitGamepads || !!navigator.webkitGetGamepads) {
                gamepadSupport.startPolling();
            }
        }
    },
    onGamepadConnect : function(event) {
        gamepadSupport.gamepads.push(event.gamepad);
        tester.updateGamepads(gamepadSupport.gamepads);
        gamepadSupport.startPolling();
    },
    onGamepadDisconnect : function(event) {
        for ( var i in gamepadSupport.gamepads) {
            if (gamepadSupport.gamepads[i].index == event.gamepad.index) {
                gamepadSupport.gamepads.splice(i, 1);
                break;
            }
        }
        if (gamepadSupport.gamepads.length == 0) {
            gamepadSupport.stopPolling();
        }
        tester.updateGamepads(gamepadSupport.gamepads);
    },
    startPolling : function() {
        if (!gamepadSupport.ticking) {
            gamepadSupport.ticking = true;
            gamepadSupport.tick();
        }
    },
    stopPolling : function() {
        gamepadSupport.ticking = false;
    },
    tick : function() {
        gamepadSupport.pollStatus();
        gamepadSupport.scheduleNextTick();
    },
    scheduleNextTick : function() {
        if (gamepadSupport.ticking) {
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(gamepadSupport.tick);
            } else if (window.mozRequestAnimationFrame) {
                window.mozRequestAnimationFrame(gamepadSupport.tick);
            } else if (window.webkitRequestAnimationFrame) {
                window.webkitRequestAnimationFrame(gamepadSupport.tick);
            }
        }
    },
    pollStatus : function() {
        gamepadSupport.pollGamepads();
        for ( var i in gamepadSupport.gamepads) {
            var gamepad = gamepadSupport.gamepads[i];
            sendAxesPressed(gamepad.axes); // custom
            if (gamepad.timestamp
                    && (gamepad.timestamp == gamepadSupport.prevTimestamps[i])) {
                continue;
            }
            gamepadSupport.prevTimestamps[i] = gamepad.timestamp;
            gamepadSupport.updateDisplay(i);
        }
    },
    pollGamepads : function() {
        var rawGamepads = (navigator.webkitGetGamepads && navigator
                .webkitGetGamepads())
                || navigator.webkitGamepads;
        if (rawGamepads) {
            gamepadSupport.gamepads = [];
            var gamepadsChanged = false;
            for ( var i = 0; i < rawGamepads.length; i++) {
                if (typeof rawGamepads[i] != gamepadSupport.prevRawGamepadTypes[i]) {
                    gamepadsChanged = true;
                    gamepadSupport.prevRawGamepadTypes[i] = typeof rawGamepads[i];
                }
                if (rawGamepads[i]) {
                    gamepadSupport.gamepads.push(rawGamepads[i]);
                }
            }
            if (gamepadsChanged) {
                tester.updateGamepads(gamepadSupport.gamepads);
            }
        }
    },
    updateDisplay : function(gamepadId) {
        var gamepad = gamepadSupport.gamepads[gamepadId];
        tester.updateButton(gamepad.buttons[0], gamepadId, buttonNames[0]);
        tester.updateButton(gamepad.buttons[1], gamepadId, buttonNames[1]);
        tester.updateButton(gamepad.buttons[2], gamepadId, buttonNames[2]);
        tester.updateButton(gamepad.buttons[3], gamepadId, buttonNames[3]);
        tester.updateButton(gamepad.buttons[4], gamepadId, buttonNames[4]);
        tester.updateButton(gamepad.buttons[6], gamepadId, buttonNames[6]);
        tester.updateButton(gamepad.buttons[5], gamepadId, buttonNames[5]);
        tester.updateButton(gamepad.buttons[7], gamepadId, buttonNames[7]);
        tester.updateButton(gamepad.buttons[8], gamepadId, buttonNames[8]);
        tester.updateButton(gamepad.buttons[9], gamepadId, buttonNames[9]);
        tester.updateButton(gamepad.buttons[10], gamepadId, buttonNames[10]);
        tester.updateButton(gamepad.buttons[11], gamepadId, buttonNames[11]);
        tester.updateButton(gamepad.buttons[12], gamepadId, buttonNames[12]);
        tester.updateButton(gamepad.buttons[13], gamepadId, buttonNames[13]);
        tester.updateButton(gamepad.buttons[14], gamepadId, buttonNames[14]);
        tester.updateButton(gamepad.buttons[15], gamepadId, buttonNames[15]);
        tester.updateAxis(gamepad.axes[0], gamepadId, axesNames[0], 'stick-1', true);
        tester.updateAxis(gamepad.axes[1], gamepadId, axesNames[1], 'stick-1', false);
        tester.updateAxis(gamepad.axes[2], gamepadId, axesNames[2], 'stick-2', true);
        tester.updateAxis(gamepad.axes[3], gamepadId, axesNames[3], 'stick-2', false);
        var extraButtonId = gamepadSupport.TYPICAL_BUTTON_COUNT;
        while (typeof gamepad.buttons[extraButtonId] != 'undefined') {
            tester.updateButton(gamepad.buttons[extraButtonId], gamepadId,
                    'extra-button-' + extraButtonId);
            extraButtonId++;
        }
        var extraAxisId = gamepadSupport.TYPICAL_AXIS_COUNT;
        while (typeof gamepad.axes[extraAxisId] != 'undefined') {
            tester.updateAxis(gamepad.axes[extraAxisId], gamepadId,
                    'extra-axis-' + extraAxisId);
            extraAxisId++;
        }
    }
};