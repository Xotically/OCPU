'use strict';

let color = require('../config/color');
const path = require('path');

let amount; // Needed else annoying undefined errors.

function levelName(amount) {
	let name = " level";
	return amount === 1 ? name : name + "s";
}

function attackName(amount) {
	let name = " attack";
	return amount === 1 ? name : name + "";
}

function defenceName(amount) {
	let name = " defence";
	return amount === 1 ? name : name + "";
}

exports.commands = {
	// All Stats
        allstats: function(target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) target = user.name;

		const lvl = Db('levels').get(toId(target), 0);
		const att = Db('attack').get(toId(target), 0);
		const def = Db('defence').get(toId(target), 0);
		let group = user.getIdentity().charAt(0);
	    
		this.sendReply("|raw|<font color=#948A88><hr>" + group +  "</font><font color=" + color(user.userid) + "><b>" + Tools.escapeHTML(target) + "</b></font> has <b>" + lvl + levelName(amount) + "</b>.");
		this.sendReply("|raw|<font color=#948A88>" + group +  "</font><font color=" + color(user.userid) + "><b>" + Tools.escapeHTML(target) + "</b></font> has <b>" + att + attackName(amount) + "</b>.");
		this.sendReply("|raw|<font color=#948A88>" + group +  "</font><font color=" + color(user.userid) + "><b>" + Tools.escapeHTML(target) + "</b></font> has <b>" + def + defenceName(amount) + "</b>.<hr>");
	}
};

process.nextTick(() => Tools.includeData());
