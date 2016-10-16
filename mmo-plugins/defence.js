/**
  * Defence Plugin By Rainy Thunder
  * Using economy.js as base from boilerplate
  *
  * --> MMO Script Plugin !
**/

'use strict';

let color = require('../config/color');
let fs = require('fs');
let path = require('path');


/**
 * Gets defence amount of player when given.
 */
function defenceName(amount) {
	let name = " defence";
	return amount === 1 ? name : name + "";
}

/**
 * Says defence is defence...
 */
function isDefence(def) {
	let numDefence = Number(def);
	if (isNaN(def)) return "Must be a number.";
	if (String(def).includes('.')) return "Cannot contain a decimal.";
	if (numDefence < 1) return "Cannot be less than one buck.";
	return numDefence;
}

/**
 * Log defence to file(s).
 */
function logDefence(message) {
	if (!message) return;
	let file = path.join(__dirname, '../logs/mmo/defence.txt');
	let date = "[" + new Date().toUTCString() + "] ";
	let msg = message + "\n";
	fs.appendFile(file, date + msg);
}

exports.commands = {
	def: 'defence',
	mydef: 'defence',
	defence: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) target = user.name;

		const amount = Db('defence').get(toId(target), 0);
		let group = user.getIdentity().charAt(0);
		this.sendReply("|raw|<font color=#948A88>" + group +  "</font><font color=" + color(user.userid) + "><b>" + Tools.escapeHTML(target) + "</b></font> has " + amount + defenceName(amount) + ".");
	},
	defencehelp: ["/defence [user] - Shows the amount of defence a user has."],

	givedef: 'givedefence',
	givedefence: function (target, room, user) {
		if (!this.can('mmomanager')) return false;
		if (!target || target.indexOf(',') < 0) return this.parse('/help givedefence');

		let parts = target.split(',');
		let username = parts[0];
		let amount = isDefence(parts[1]);

		if (typeof amount === 'string') return this.errorReply(amount);

		let total = Db('defence').set(toId(username), Db('defence').get(toId(username), 0) + amount).get(toId(username));
		amount = amount + defenceName(amount);
		total = total + defenceName(total);
		this.sendReply(username + " was given " + amount + ". " + username + " now has " + total + ".");
		logDefence(username + " was given " + amount + " by " + user.name + ". " + username + " now has " + total);
	},
	givedefencehelp: ["/givedefence [user], [amount] - Give a user a certain amount of defence."],

	resetdef: 'resetdefence',
	resetdefence: function (target, room, user) {
		if (!this.can('mmomanager')) return false;
		Db('defence').set(toId(target), 0);
		this.sendReply(target + " now has 0 defence.");
		logDefence(user.name + " reset the defence of " + target + ".");
	},
	resetdefencehelp: ["/resetdefence [user] - Reset user's defence to zero (Only use if player is banned)."],

	defencelog: function (target, room, user, connection) {
		if (!this.can('modlog')) return;
		target = toId(target);
		let numLines = 15;
		let matching = true;
		if (target.match(/\d/g) && !isNaN(target)) {
			numLines = Number(target);
			matching = false;
		}
		let topMsg = "Displaying the last " + numLines + " lines of defence:\n";
		let file = path.join(__dirname, '../logs/mmo/defence.txt');
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

	defladder: 'bulkyuser',
	bulkusers: 'bulkyuser',
	bulkyusers: 'bulkyuser',
	bulkyuser: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let display = '<center><u><b>Strongest Users</b></u></center><br><table border="1" cellspacing="0" cellpadding="5" width="100%"><tbody><tr><th>Rank</th><th>Username</th><th>Defence</th></tr>';
		let keys = Object.keys(Db('defence').object()).map(function (name) {
			return {name: name, defence: Db('defence').get(name)};
		});
		if (!keys.length) return this.sendReplyBox("Defence ladder is empty.");
		keys.sort(function (a, b) {
			return b.defence - a.defence;
		});
		keys.slice(0, 10).forEach(function (user, index) {
			display += "<tr><td>" + (index + 1) + "</td><td>" + user.name + "</td><td>" + user.defence + "</td></tr>";
		});
		display += "</tbody></table>";
		this.sendReply("|raw|" + display);
	},
};
