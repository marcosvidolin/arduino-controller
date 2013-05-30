var tester = {
    VISIBLE_THRESHOLD : 0.1,
    STICK_OFFSET : 25,
    ANALOGUE_BUTTON_THRESHOLD : .5,
    init : function() {
        tester.updateMode();
        tester.updateGamepads();
    },
    showNotSupported : function() {
        document.querySelector('#no-gamepad-support').classList.add('visible');
    },
    updateMode : function() {
        if (document.querySelector('#mode-raw').checked) {
            document.querySelector('#gamepads').classList.add('raw');
        } else {
            document.querySelector('#gamepads').classList.remove('raw');
        }
    },
    updateGamepads : function(gamepads) {
        var els = document.querySelectorAll('#gamepads > :not(.template)');
        for ( var i = 0, el; el = els[i]; i++) {
            el.parentNode.removeChild(el);
        }
        var padsConnected = false;
        if (gamepads) {
            for ( var i in gamepads) {
                var gamepad = gamepads[i];
                if (gamepad) {
                    var el = document.createElement('li');
                    el.innerHTML = document
                            .querySelector('#gamepads > .template').innerHTML;
                    el.id = 'gamepad-' + i;
                    el.querySelector('.name').innerHTML = gamepad.id;
                    el.querySelector('.index').innerHTML = gamepad.index;
                    document.querySelector('#gamepads').appendChild(el);
                    var extraButtonId = gamepadSupport.TYPICAL_BUTTON_COUNT;
                    while (typeof gamepad.buttons[extraButtonId] != 'undefined') {
                        var labelEl = document.createElement('label');
                        labelEl.setAttribute('for', 'extra-button-'
                                + extraButtonId);
                        labelEl.setAttribute('description', 'Extra button');
                        labelEl.setAttribute('access', 'buttons['
                                + extraButtonId + ']');
                        el.querySelector('.extra-inputs').appendChild(labelEl);
                        extraButtonId++;
                    }
                    var extraAxisId = gamepadSupport.TYPICAL_AXIS_COUNT;
                    while (typeof gamepad.axes[extraAxisId] != 'undefined') {
                        var labelEl = document.createElement('label');
                        labelEl
                                .setAttribute('for', 'extra-axis-'
                                        + extraAxisId);
                        labelEl.setAttribute('description', 'Extra axis');
                        labelEl.setAttribute('access', 'axes[' + extraAxisId
                                + ']');
                        el.querySelector('.extra-inputs').appendChild(labelEl);
                        extraAxisId++;
                    }
                    padsConnected = true;
                }
            }
        }
        if (padsConnected) {
            document.querySelector('#no-gamepads-connected').classList
                    .remove('visible');
        } else {
            document.querySelector('#no-gamepads-connected').classList
                    .add('visible');
        }
    },
    updateButton : function(value, gamepadId, id) {
        var gamepadEl = document.querySelector('#gamepad-' + gamepadId);
        var buttonEl = gamepadEl.querySelector('[name="' + id + '"]');
        if (buttonEl) {
            sendButtonPressed(buttonNames.indexOf(id), value); // custom
            if (value > tester.ANALOGUE_BUTTON_THRESHOLD) {
                buttonEl.classList.add('pressed');
            } else {
                buttonEl.classList.remove('pressed');
            }
        }
        var labelEl = gamepadEl.querySelector('label[for="' + id + '"]');
        if (typeof value == 'undefined') {
            labelEl.innerHTML = '?';
        } else {
            labelEl.innerHTML = value.toFixed(2);
            if (value > tester.VISIBLE_THRESHOLD) {
                labelEl.classList.add('visible');
            } else {
                labelEl.classList.remove('visible');
            }
        }
    },
    updateAxis : function(value, gamepadId, labelId, stickId, horizontal) {
        var gamepadEl = document.querySelector('#gamepad-' + gamepadId);
        var stickEl = gamepadEl.querySelector('[name="' + stickId + '"]');
        if (stickEl) {
            var offsetVal = value * tester.STICK_OFFSET;
            if (horizontal) {
                stickEl.style.marginLeft = offsetVal + 'px';
            } else {
                stickEl.style.marginTop = offsetVal + 'px';
            }
        }
        var labelEl = gamepadEl.querySelector('label[for="' + labelId + '"]');
        if (typeof value == 'undefined') {
            labelEl.innerHTML = '?';
        } else {
            labelEl.innerHTML = value.toFixed(2);
            if ((value < -tester.VISIBLE_THRESHOLD)
                    || (value > tester.VISIBLE_THRESHOLD)) {
                labelEl.classList.add('visible');
                if (value > tester.VISIBLE_THRESHOLD) {
                    labelEl.classList.add('positive');
                } else {
                    labelEl.classList.add('negative');
                }
            } else {
                labelEl.classList.remove('visible');
                labelEl.classList.remove('positive');
                labelEl.classList.remove('negative');
            }
        }
    }
};

/**
 * Envia os comandos referentes a coordenadas dos eixos para o Arduino.
 * TODO: No codigo do Arduino, parar o "motor" caso o controle direcional
 *       pare de enviar novas coordenadas durante algum tempo (milisegundos).
 *
 * @param axes - coordenadas do direcional
 *
 */
function sendAxesPressed(axes) {
    /*for (var btn = 0; btn < axes.length; btn++) {
        if (axes[btn] >= 0.06 || axes[btn] <= -0.06) {
            sendOperationToArduino(convertButtonToArduino(btn, true), equalizeValue(calculateServoVal(axes[btn])));
        }
    }*/
    if (axes[3] >= 0.06 || axes[3] <= -0.06) {
        sendOperationToArduino(convertButtonToArduino(3, true), axes[3]);
    }
}

/**
 * Envia os comandos referentes a botoes pressionado para o Arduino..
 * TODO: - No codigo do Arduino, gardar os botoes pressionados para saber
 *         quando desligar ou ligar algo. Exemplo: botao pressionado liga
 *         os leds, pressionado novamente desliga os leds.
 *
 * @param button - nome do botao pressionado
 * @param value - valor do botao pressionado (geralmente 1)
 *
 */
function sendButtonPressed(button, value) {
    if (value > 0 && buttonPressedValidator(button)) {
        sendOperationToArduino(convertButtonToArduino(button, false), value);
    }
}

/**
 * Realiza um GET via Ajax na URL do servico do Arduino, passando os parametros
 * de comando para o arduino realizar.
 * TODO: Remover console.log() quando terminado.
 * 
 * @param button - nome do botao pressionado
 * @param value - valor do botao pressionado 
 *
 */
function sendOperationToArduino(button, value) {
    websocketClient.sendData(button + '=' + value);
    //console.log('[' + new Date().getTime() + ']' + button + '=' + getArduinoValue(value));
}

/**
 * Impede que um mesmo botao pressionado no "mesmo instante" seja enviado 
 * mais de uma vez para o Arduino
 * 
 * @param button - nome do botao pressionado
 * @return boolean
 *
 */
var milsOld = 0, btnOld = '';
function buttonPressedValidator(button) {
    if (button != btnOld || button == buttonNames[6] || button == buttonNames[7]) {
        milsOld = new Date().getTime();
        btnOld = button;
        return true;
    } else if ((new Date().getTime() - milsOld) > 300) {
        milsOld = new Date().getTime();
        btnOld = button;
        return true;
    }
    return false;
}

/**
 * Configura os botoes do joystick (gamepad).
 *
 */
var buttonNames = new Array(), axesNames = new Array();
function configureJoystick() {
    buttonNames[0] = 'button-1',
    buttonNames[1] = 'button-2',
    buttonNames[2] = 'button-3',
    buttonNames[3] = 'button-4',
    buttonNames[4] = 'button-left-shoulder-top',
    buttonNames[6] = 'button-left-shoulder-bottom',
    buttonNames[5] = 'button-right-shoulder-top',
    buttonNames[7] = 'button-right-shoulder-bottom',
    buttonNames[8] = 'button-select',
    buttonNames[9] = 'button-start',
    buttonNames[10] = 'stick-1',
    buttonNames[11] = 'stick-2',
    buttonNames[12] = 'button-dpad-top',
    buttonNames[13] = 'button-dpad-bottom',
    buttonNames[14] = 'button-dpad-left',
    buttonNames[15] = 'button-dpad-right',
    axesNames[0] = 'stick-1-axis-x',
    axesNames[1] = 'stick-1-axis-y',
    axesNames[2] = 'stick-2-axis-x',
    axesNames[3] = 'stick-2-axis-y';
}

/**
 * Converts a button/axes name to a Arduino name. This is a short name
 * (char) for Arduino performance improvement.
 *
 * @param index - the index of the array
 * @return char
 *
 */
function convertButtonToArduino(index, isAxes) {
    if (isAxes) {
        var axes = ['Q','R','S','T'];
        return axes[index];
    }
    var button = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P'];
    return button[index];
}