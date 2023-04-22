// ==UserScript==
// @name         DF monkey
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Hints for playing better at diceforge
// @author       Jonas
// @match        https://boardgamearena.com/8/diceforge?table=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=boardgamearena.com
// @grant        none
// ==/UserScript==

var next_log_id = 0
var players = []
var player_id = []
var player_score = []
var player_hammer_value = []

function update() {
  while(get_next_log()) {}

  for(var i = 0; i < players.length; i++) {
      update_vp_ui(players[i])
  }
}

function get_next_log() {
    var obj = document.getElementById("log_"+next_log_id)

    // stop processing new logs
    if(obj === null) {
        return(false)
    }

    // game start
    if(next_log_id == 0) {
        init()
    }

    // data contained in first roundedbox
    if(process_log(obj.children[0])) {
        obj.children[0].style.backgroundColor = "#99e699"
    } else {
        obj.children[0].style.backgroundColor = "#ff8080"
    }

    console.log("processed log " + next_log_id)
    next_log_id = next_log_id + 1
    return true
}

function init() {
    var player_obj = document.getElementsByClassName("player-name")
    for(let i = 0; i < player_obj.length; i++) {
        players.push(player_obj[i].children[0].innerHTML)
        player_id.push(player_obj[i].id.replace("player_name_", ""))
        player_score.push(0)
        player_hammer_value.push(0)
    }
    console.log("Players: " + players)
}

function process_log(log) {

    if(log.innerHTML.endsWith(" begint")) {
        return process_log_start_turn(log)
    }

    if(log.innerHTML.startsWith("Het is ") && log.innerHTML.endsWith(" beurt")) {
        return process_log_set_active_player(log)
    }

    if(log.innerText.includes(" gooit ") ) {
        return process_log_dice_throw(log)
    }

    if(log.innerText.includes(" activeert De Oudere ") ) {
        return process_log_activate_elder(log)
    }

    if(log.innerText.includes(" krijgt ") && !log.innerText.includes(" voltooit ") ) {
        return process_log_dice_resolve(log)
    }

    if(log.innerText.includes(" gekocht ") ) {
        return process_log_buy_card(log)
    }


    return false

}

function process_log_start_turn(log) {
    return true
}

function process_log_set_active_player(log) {
    return true
}

function process_log_dice_throw(log) {
    return true
}

function process_log_dice_resolve(log) {
    var components = log.innerText.split(' ')
    var child = log.children
    var player = components[0]

    for(let i = 1; i < child.length; i++) {
        var value = parseInt(components[2*i])
        if(child[i].getAttribute('alt') == "vp") {
            add_vp(player, value)
        }
        if(child[i].getAttribute('alt') == "hammer") {
            add_hammer(player, value)
        }
    }

    return true
}

function process_log_buy_card(log) {
    var player = log.children[0].innerText
    var card = log.innerText.match("heeft (.*) gekocht")[1]

    var card_names = ["De Hamer van de Smid", "De Kist van de Smid", "De Zilveren Hinde", "Saters", "Veerman", "Helm van Onzichtbaarheid",
                 "Kreeft", "Hydra", "Sfinx", "Spiegel van De Diepzee", "Gorgo", "Minotaurus", "De Uil van de Bewaker", "Wilde Geesten", "De Oudere"]

    var card_vp = [0, 2, 2, 6, 12, 4, 8, 26, 10, 10, 14, 8, 4, 2, 0]

    var index = card_names.indexOf(card)

    if(index == -1) {
        console.log("Error: Kaart " + card + " niet herkend")
        return false
    }

    console.log(player + " krijgt " + card_vp[index] + " punten van kaart " + card)
    add_vp(player, card_vp[index])
    return true
}

function process_log_activate_elder(log) {
    var player = log.children[0].innerText
    add_vp(player, 4)
    return true
}

function add_vp(player_name, count) {
    console.log(player_name + " krijgt " + count + " vp")
    var index = players.indexOf(player_name)
    player_score[index] += count
}

function update_vp_ui(player_name) {
    var index = players.indexOf(player_name)
    var score_ui_elem = document.getElementById("player_score_" + player_id[index])

    var value = score_ui_elem.innerText.split(" :: ")
    score_ui_elem.innerText = value[0] + " :: " + player_score[index]
}


function add_hammer(player_name, count) {
    var index = players.indexOf(player_name)
    var hammer_current = player_hammer_value[index]

    var diff_score = score_hammer(hammer_current + count) - score_hammer(hammer_current)

    player_hammer_value[index] += count
    if(diff_score > 0) {
        console.log(player_name + " krijgt " + diff_score + " vp van hamer")
        add_vp(player_name, diff_score)
    }
}

function score_hammer(hammer) {
    return (10 * ((hammer >= 15) + (hammer >= 45) + (hammer >= 75) + (hammer >= 105)) +
            15 * ((hammer >= 30) + (hammer >= 60) + (hammer >= 90) + (hammer == 120)))
}

(function() {
    'use strict';

    var intervalId = window.setInterval(update, 1000);

    // Your code here...
})()