module.exports.config = {
	name: "user",
	version: "1.0.5",
	permission: 2,
	credits: "ryuko",
	prefix: true,
  premium: false,
	description: "ban or unblock users",
	category: "admin",
	usages: "[unban/ban/search] [id or text]",
	cooldowns: 5
};

module.exports.languages = {
	"bangla": {
		"reason": "reason",
		"at": "at",
		"allCommand": "all commands",
		"commandList": "commands",
		"banSuccess": "banned user : %1",
		"unbanSuccess": "unbanned user %1",
		"banCommandSuccess": "banned command with user : %1",
		"unbanCommandSuccess": "unbanned command %1 with user: %2",
		"errorReponse": "%1 can't do what you request",
		"IDNotFound": "%1 ID you import doesn't exist in database",
		"existBan": "user %1 has been banned before %2 %3",
		"notExistBan": "user hasn't been banned before",
		"missingCommandInput": "%1 you have to import the command you want to ban",
		"notExistBanCommand": "user ID hasn't been banned before",

		"returnBan": "you are requesting to ban user :\nuser id and name who you want to ban : %1%2\n\nreact to this message to complete",
		"returnUnban": "you are requesting to unban user :\nuser id and name who you want to ban : %1\n\nreact to this message to complete",
		"returnBanCommand": "you are requesting to ban command with user :\n - user ID and name who you want to ban : %1\n- commands : %2\n\nreact to this message to complete",
		"returnUnbanCommand": "you are requesting to unban command with user :\nuser id and name : %1\ncommands : %2\n\nreact to this message to complete",
	
		"returnResult": "this is your result : \n",
		"returnNull": "there is no result with your input",
		"returnList": "there are %1 banned user, here are %2 user\n\n%3",
		"returnInfo": "here is some information about the user who you want to find :\nuser id and name : %1n- banned? : %2 %3 %4\ncommand banned? : %5"
	},
	"english": {
		"reason": "reason",
		"at": "at",
		"allCommand": "all commands",
		"commandList": "commands",
		"banSuccess": "banned user : %1",
		"unbanSuccess": "unbanned user %1",
		"banCommandSuccess": "banned command with user : %1",
		"unbanCommandSuccess": "unbanned command %1 with user: %2",
		"errorReponse": "%1 can't do what you request",
		"IDNotFound": "%1 ID you import doesn't exist in database",
		"existBan": "user %1 has been banned before %2 %3",
		"notExistBan": "user hasn't been banned before",
		"missingCommandInput": "%1 you have to import the command you want to ban",
		"notExistBanCommand": "user ID hasn't been banned before",

		"returnBan": "you are requesting to ban user :\nuser id and name who you want to ban : %1%2\n\nreact to this message to complete",
		"returnUnban": "you are requesting to unban user :\nuser id and name who you want to ban : %1\n\nreact to this message to complete",
		"returnBanCommand": "you are requesting to ban command with user :\n - user ID and name who you want to ban : %1\n- commands : %2\n\nreact to this message to complete",
		"returnUnbanCommand": "you are requesting to unban command with user :\nuser id and name : %1\ncommands : %2\n\nreact to this message to complete",
	
		"returnResult": "this is your result : \n",
		"returnNull": "there is no result with your input",
		"returnList": "there are %1 banned user, here are %2 user\n\n%3",
		"returnInfo": "here is some information about the user who you want to find :\nuser id and name : %1n- banned? : %2 %3 %4\ncommand banned? : %5"
	}
}

module.exports.handleReaction = async ({ event, api, Users, handleReaction, getText }) => {
	if (parseInt(event.userID) !== parseInt(handleReaction.author)) return;
	const moment = require("moment-timezone");
	const { threadID } = event;
	const { messageID, type, targetID, reason, commandNeedBan, nameTarget } = handleReaction;
	
	const time = moment.tz("Asia/Ho_Chi_minh").format("HH:MM:ss L");
	global.client.handleReaction.splice(global.client.handleReaction.findIndex(item => item.messageID == messageID), 1);
	
	switch (type) {
		case "ban": {
			try {
				let data = (await Users.getData(targetID)).data || {};
				data.banned = true;
				data.reason = reason || null;
				data.dateAdded = time;
				await Users.setData(targetID, { data });
				global.data.userBanned.set(targetID, { reason: data.reason, dateAdded: data.dateAdded });
				return api.sendMessage(getText("banSuccess", `${targetID} - ${nameTarget}`), threadID, () => {
					return api.unsendMessage(messageID);
				});
			} catch { return api.sendMessage(getText("errorReponse", "ban user - "), threadID) };
		}

		case "unban": {
			try {
				let data = (await Users.getData(targetID)).data || {};
				data.banned = false;
				data.reason = null;
				data.dateAdded = null;
				await Users.setData(targetID, { data });
				global.data.userBanned.delete(targetID);
				return api.sendMessage(getText("unbanSuccess", `${targetID} - ${nameTarget}`), threadID, () => {
					return api.unsendMessage(messageID);
				});
			} catch { return api.sendMessage(getText("errorReponse", "unban user - "), threadID) };
		}

		case "banCommand": {
			try {	
				let data = (await Users.getData(targetID)).data || {};
				data.commandBanned = [...data.commandBanned || [], ...commandNeedBan];
				await Users.setData(targetID, { data });
				global.data.commandBanned.set(targetID, data.commandBanned);
				return api.sendMessage(getText("banCommandSuccess", `${targetID} - ${nameTarget}`), threadID, () => {
					return api.unsendMessage(messageID);
				});
			} catch (e) { return api.sendMessage(getText("errorReponse", "command ban - "), threadID) };
		}

		case "unbanCommand": {
			try {
				let data = (await Users.getData(targetID)).data || {};
				data.commandBanned = [...data.commandBanned.filter(item => !commandNeedBan.includes(item))];
				await Users.setData(targetID, { data });
				global.data.commandBanned.set(targetID, data.commandBanned);
				if(data.commandBanned.length == 0) global.data.commandBanned.delete(targetID)
				return api.sendMessage(getText("unbanCommandSuccess", ((data.commandBanned.length == 0) ? getText("allCommand") : `${getText("commandList")}: ${commandNeedBan.join(", ")}`), `${targetID} - ${nameTarget}`), threadID, () => {
					return api.unsendMessage(messageID);
				});
			} catch (e) { return api.sendMessage(getText("errorReponse", "unban command -"), threadID) };
		}
	}
}

module.exports.run = async ({ event, api, args, Users, getText, botid }) => {
	const { threadID, messageID } = event;
	const type = args[0];
	var targetID = String(args[1]);
	var reason = (args.slice(2, args.length)).join(" ") || null;

	if (isNaN(targetID)) {
		const mention = Object.keys(event.mentions);
		args = args.join(" ");
		targetID = String(mention[0]);
		reason = (args.slice(args.indexOf(event.mentions[mention[0]]) + (event.mentions[mention[0]] || "").length + 1, args.length)) || null;
	}

	switch (type) {
		case "ban":
		case "-b": {
			if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "ban user - "), threadID, messageID);
			if (global.data.userBanned.has(targetID)) {
				const { reason, dateAdded } = global.data.userBanned.get(targetID) || {};
				return api.sendMessage(getText("existBan", targetID, ((reason) ? `${getText("reason")}: "${reason}"` : ""), ((dateAdded) ? `${getText("at")} ${dateAdded}` : "")), threadID, messageID);
			}
			const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
			return api.sendMessage(getText("returnBan", `${targetID} - ${nameTarget}`, ((reason) ? `\n- ${getText("reason")}: ${reason}` : "")), threadID, (error, info) => {
				global.client.handleReaction.get(botid).push({
					type: "ban",
					targetID,
					reason,
					nameTarget,
					name: this.config.name,
					messageID: info.messageID,
					author: event.senderID,
					
				});
			}, messageID);
		}

		case "unban":
		case "-ub": {
			if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "unban user - "), threadID, messageID);
			if (!global.data.userBanned.has(targetID)) return api.sendMessage(getText("notExistBan"), threadID, messageID);
			const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
			return api.sendMessage(getText("returnUnban", `${targetID} - ${nameTarget}`), threadID, (error, info) => {
				global.client.handleReaction.get(botid).push({
					type: "unban",
					targetID,
					nameTarget,
					name: this.config.name,
					messageID: info.messageID,
					author: event.senderID,
					
				});
			}, messageID);
		}

		case "search":
		case "-s": {
			const contentJoin = reason || "";
			const getUsers = (await Users.getAll(['userID', 'name'])).filter(item => !!item.name);
			var matchUsers = [], a = '', b = 0;
			getUsers.forEach(i => {
				if (i.name.toLowerCase().includes(contentJoin.toLowerCase())) {
					matchUsers.push({
						name: i.name,
						id: i.userID
					});
				}
			});
			matchUsers.forEach(i => a += `\n${b += 1}. ${i.name} - ${i.id}`);
			(matchUsers.length > 0) ? api.sendMessage(getText("returnResult", a), threadID) : api.sendMessage(getText("returnNull"), threadID);
			return;
		}
		
		case "banCommand":
		case "-bc": {
			if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "command ban - "), threadID, messageID);
			if (reason == null || reason.length == 0) return api.sendMessage(getText("missingCommandInput", "command ban - "), threadID, messageID);
			if (reason == "all") {
				var allCommandName = [];
				const commandValues = global.client.commands.keys();
				for (const cmd of commandValues) allCommandName.push(cmd);
				reason = allCommandName.join(" ");
			}
			const commandNeedBan = reason.split(" ");
			const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
			return api.sendMessage(getText("returnBanCommand", `${targetID} - ${nameTarget}`, ((commandNeedBan.length == global.client.commands.size) ? getText("allCommand") : commandNeedBan.join(", "))), threadID, (error, info) => {
				global.client.handleReaction.get(botid).push({
					type: "banCommand",
					targetID,
					commandNeedBan,
					nameTarget,
					name: this.config.name,
					messageID: info.messageID,
					author: event.senderID,
					
				});
			}, messageID);
		}

		case "unbanCommand":
		case "-ubc": {
			if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "command unban - "), threadID, messageID);
			if (!global.data.commandBanned.has(targetID)) return api.sendMessage(getText("notExistBanCommand"), threadID, messageID);
			if (reason == null || reason.length == 0) return api.sendMessage(getText("missingCommandInput", "command unban - "), threadID, messageID);
			if (reason == "all") {
				reason = (global.data.commandBanned.get(targetID)).join(" ");
			}
			const commandNeedBan = reason.split(" ");
			const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
			return api.sendMessage(getText("returnUnbanCommand", `${targetID} - ${nameTarget}`, ((commandNeedBan.length == global.data.commandBanned.get(targetID).length) ? getText("allCommand") : commandNeedBan.join(", "))), threadID, (error, info) => {
				global.client.handleReaction.get(botid).push({
					type: "unbanCommand",
					targetID,
					commandNeedBan,
					nameTarget,
					name: this.config.name,
					messageID: info.messageID,
					author: event.senderID,
					
				});
			}, messageID);
		}

		case "list":
		case "-l": {
			var listBan = [], i = 0;
			const threadData = global.data.userBanned.keys();
			for (; ;) {
				let idUser = String(threadData.next().value);
				if (typeof idUser == "undefined") {
					const userName = (await Users.getData(idUser)).name || "unknown";
					listBan.push(`${i+=1}/ ${idUser} - ${userName}`);
				}
				if (i == global.data.userBanned.size || i == (parseInt(reason) || 10)) break;
			}
			return api.sendMessage(getText("returnList",(global.data.userBanned.size || 0), listBan.length, listBan.join("\n")), threadID, messageID);
		}

		case "info":
		case "-i": {
			if (!global.data.allUserID.includes(targetID)) return api.sendMessage(getText("IDNotFound", "user info - "), threadID, messageID);
			if (global.data.commandBanned.has(targetID)) { var commandBanned = global.data.commandBanned.get(targetID) || [] };
			if (global.data.userBanned.has(targetID)) { var { reason, dateAdded } = global.data.userBanned.get(targetID) || {} };
			const nameTarget = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
			return api.sendMessage(getText("returnInfo", `${targetID} - ${nameTarget}`, ((!dateAdded) ? "YES" : "NO"), ((reason) ? `${getText("reason")}: "${reason}"` : ""), ((dateAdded) ? `${getText("at")}: ${dateAdded}` : ""), ((commandBanned) ? `YES: ${(commandNeedBan.length == global.client.commands.size) ? getText("allCommand") : commandNeedBan.join(", ")}` : "NO")), threadID, messageID);
		}
	}
}