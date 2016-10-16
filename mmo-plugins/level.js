/**
  * Level Plugin By Rainy Thunder
  * Using economy.js as base from boilerplate
  *
  * --> MMO Script Plugin !
**/

'use strict';

let color = require('../config/color');
let fs = require('fs');
let path = require('path');

function levelName(amount) {
	let name = " level";
	return amount === 1 ? name : name + "s";
}

function isLevel(lvl) {
	let numLevel = Number(lvl);
	if (isNaN(lvl)) return "Must be a number.";
	if (String(lvl).includes('.')) return "Cannot contain a decimal.";
	if (numLevel < 1) return "Cannot be less than one buck.";
	return numLevel;
}

function logLevel(message) {
	if (!message) return;
	let file = path.join(__dirname, '../logs/mmo/levels.txt');
	let date = "[" + new Date().toUTCString() + "] ";
	let msg = message + "\n";
	fs.appendFile(file, date + msg);
}

exports.commands = {
	lvl: 'levels',
	mylvl: 'levels',
	levels: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) target = user.name;

		const amount = Db('levels').get(toId(target), 0);
		let group = user.getIdentity().charAt(0);
		this.sendReply("|raw|<font color=#948A88>" + group +  "</font><font color=" + color(user.userid) + "><b>" + Tools.escapeHTML(target) + "</b></font> has " + amount + levelName(amount) + ".");
	},
	defencehelp: ["/level [user] - Shows the amount of levels a user has."],

	givelvl: 'givelevel',
	givelevel: function (target, room, user) {
		if (!this.can('mmomanager')) return false;
		if (!target || target.indexOf(',') < 0) return this.parse('/help givelevel');

		let parts = target.split(',');
		let username = parts[0];
		let amount = isLevel(parts[1]);

		if (typeof amount === 'string') return this.errorReply(amount);

		let total = Db('levels').set(toId(username), Db('levels').get(toId(username), 0) + amount).get(toId(username));
		amount = amount + levelName(amount);
		total = total + levelName(total);
		this.sendReply(username + " was given " + amount + ". " + username + " now has " + total + ".");
		logLevel(username + " was given " + amount + " by " + user.name + ". " + username + " now has " + total);
	},
	givelevelhelp: ["/givelevel [user], [amount] - Give a user a certain amount of level."],

	resetlvl: 'resetlevel',
	resetlevel: function (target, room, user) {
		if (!this.can('mmomanager')) return false;
		Db('levels').set(toId(target), 0);
		this.sendReply(target + " now has 0 level.");
		logLevel(user.name + " reset the level of " + target + ".");
	},
	resetlevelhelp: ["/resetlevel [user] - Reset user's level to zero (Only use if player is banned)."],

	levellog: function (target, room, user, connection) {
		if (!this.can('modlog')) return;
		target = toId(target);
		let numLines = 15;
		let matching = true;
		if (target.match(/\d/g) && !isNaN(target)) {
			numLines = Number(target);
			matching = false;
		}
		let topMsg = "Displaying the last " + numLines + " lines of level:\n";
		let file = path.join(__dirname, '../logs/mmo/level.txt');
		fs.exists(file, function (exists) {
			if (!exists) return connection.popup("No data.");
			fs.readFile(file, 'utf8', function (err, data) {
				data = data.split('\n');
				if (target && matching) {
					data = data.filter(function (line) {
						return line.toLowerCase().indexOf(target.toLowerCase()) >= 0;
					});
				}
				connection.popup('|wide|' + topMsg + data.slice(-(numLines + 1)).join('\n'));
			});
		});
	},

	lvlladder: 'lvluser',
	highusers: 'lvluser',
	levelusers: 'lvluser',
	lvluser: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let display = '<center><u><b>Level Users</b></u></center><br><table border="1" cellspacing="0" cellpadding="5" width="100%"><tbody><tr><th>Rank</th><th>Username</th><th>Level (80)</th></tr>';
		let keys = Object.keys(Db('levels').object()).map(function (name) {
			return {name: name, levels: Db('levels').get(name)};
		});
		if (!keys.length) return this.sendReplyBox("Level ladder is empty.");
		keys.sort(function (a, b) {
			return b.levels - a.levels;
		});
		keys.slice(0, 10).forEach(function (user, index) {
			display += "<tr><td>" + (index + 1) + "</td><td>" + user.name + "</td><td>" + user.levels + "</td></tr>";
		});
		display += "</tbody></table>";
		this.sendReply("|raw|" + display);
	},
};
