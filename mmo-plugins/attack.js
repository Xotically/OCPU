/**
  * Attack Plugin By Rainy Thunder
  * Using economy.js as base from boilerplate
  *
  * --> MMO Script Plugin !
**/

'use strict';

let color = require('../config/color');
let fs = require('fs');
let path = require('path');


/**
 * Gets attack amount of player when given.
 */
function attackName(amount) {
	let name = " attack";
	return amount === 1 ? name : name + "";
}

/**
 * Says attack is attack...
 */
function isAttack(atk) {
	let numAttack = Number(atk);
	if (isNaN(atk)) return "Must be a number.";
	if (String(atk).includes('.')) return "Cannot contain a decimal.";
	if (numAttack < 1) return "Cannot be less than one buck.";
	return numAttack;
}

/**
 * Log attack to file(s).
 */
function logAttack(message) {
	if (!message) return;
	let file = path.join(__dirname, '../logs/mmo/attack.txt');
	let date = "[" + new Date().toUTCString() + "] ";
	let msg = message + "\n";
	fs.appendFile(file, date + msg);
}

exports.commands = {
	atk: 'attack',
	myatk: 'attack',
	attack: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) target = user.name;

		const amount = Db('attack').get(toId(target), 0);
		let group = user.getIdentity().charAt(0);
		this.sendReply("|raw|<font color=#948A88>" + group +  "</font><font color=" + color(user.userid) + "><b>" + Tools.escapeHTML(target) + "</b></font> has " + amount + attackName(amount) + ".");
	},
	attackhelp: ["/attack [user] - Shows the amount of attack a user has."],

	giveatk: 'giveattack',
	giveattack: function (target, room, user) {
		if (!this.can('mmomanager')) return false;
		if (!target || target.indexOf(',') < 0) return this.parse('/help attack');

		let parts = target.split(',');
		let username = parts[0];
		let amount = isAttack(parts[1]);

		if (typeof amount === 'string') return this.errorReply(amount);

		let total = Db('attack').set(toId(username), Db('attack').get(toId(username), 0) + amount).get(toId(username));
		amount = amount + attackName(amount);
		total = total + attackName(total);
		this.sendReply(username + " was given " + amount + ". " + username + " now has " + total + ".");
		logAttack(username + " was given " + amount + " by " + user.name + ". " + username + " now has " + total);
	},
	giveattackhelp: ["/giveattack [user], [amount] - Give a user a certain amount of attack."],

	resetatk: 'resetattack',
	resetattack: function (target, room, user) {
		if (!this.can('mmomanager')) return false;
		Db('attack').set(toId(target), 0);
		this.sendReply(target + " now has 0 attack.");
		logAttack(user.name + " reset the attack of " + target + ".");
	},
	resetattackhelp: ["/resetattack [user] - Reset user's attack to zero (Only use if player is banned)."],

	attacklog: function (target, room, user, connection) {
		if (!this.can('modlog')) return;
		target = toId(target);
		let numLines = 15;
		let matching = true;
		if (target.match(/\d/g) && !isNaN(target)) {
			numLines = Number(target);
			matching = false;
		}
		let topMsg = "Displaying the last " + numLines + " lines of attack:\n";
		let file = path.join(__dirname, '../logs/mmo/attack.txt');
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

	strladder: 'stronguser',
	strongusers: 'stronguser',
	strongestusers: 'stronguser',
	stronguser: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let display = '<center><u><b>Strongest Users</b></u></center><br><table border="1" cellspacing="0" cellpadding="5" width="100%"><tbody><tr><th>Rank</th><th>Username</th><th>Attack</th></tr>';
		let keys = Object.keys(Db('attack').object()).map(function (name) {
			return {name: name, attack: Db('attack').get(name)};
		});
		if (!keys.length) return this.sendReplyBox("Attack ladder is empty.");
		keys.sort(function (a, b) {
			return b.attack - a.attack;
		});
		keys.slice(0, 10).forEach(function (user, index) {
			display += "<tr><td>" + (index + 1) + "</td><td>" + user.name + "</td><td>" + user.attack + "</td></tr>";
		});
		display += "</tbody></table>";
		this.sendReply("|raw|" + display);
	},
};
