window.registeredcommands=[
	"help",
	"clear",
	"reddit",
	"google",
	"exit",
	"fortune",
	"credits",
	"wantyougone",
	"opensource"
]

window.shortcuts={
	"h":"help",
	"c":"clear",
	"r":"reddit",
	"g":"google",
	"4chan":"fortune",
	"4":"fortune"
}

window.consolerunning=false;

window.userinput="";

window.consolecontent="GLaDOS v1.09 (c) 1982 Aperture Science, Inc<br>\
";
window.consoleurl="<br>Lutan@GLaDOS:~$ ";
window.commandhistory=[""];
window.currentcommand=0;
whenbooted = function() {
	$(document).click(function() {
		$("#userinputworkaround").focus()
	});
	$("#userinputworkaround").focus();
	
	$(window).on("keydown",function(e) {
		
		if (window.ctrlDown && e.keyCode == 67) {
			abort();
			return;
		}
		if (window.consolerunning) {
			$("#userinputworkaround").val("");
			window.userinput="";
			return;
		}
		setTimeout(function() {
			window.userinput=$("#userinputworkaround").val();
			if (e.which==13) {
				e.preventDefault();
				e.stopPropagation();
				$("#userinputworkaround").val("");
				runCommand(window.userinput);
			} else if (e.which==38) {
				e.preventDefault();
				e.stopPropagation();
				oneCommandBack();
			} else if (e.which==40) {
				e.preventDefault();
				e.stopPropagation();
				oneCommandForward();
			}
			updateConsole(true);
		},50);
	});
	updateConsole();
}

function oneCommandBack() {
	window.currentcommand = window.currentcommand > 0 ? window.currentcommand - 1 : 0;
	window.userinput=window.commandhistory[window.currentcommand];
	$("#userinputworkaround").val(window.userinput);
}

function oneCommandForward() {
	window.currentcommand = window.currentcommand < window.commandhistory.length - 1 ? window.currentcommand + 1 : window.commandhistory.length - 1;
	window.userinput=window.commandhistory[window.currentcommand];
	$("#userinputworkaround").val(window.userinput);
}

function spanify(str) {
	len=str.length;
	output="";
	for (i=0; i<len; i++) {
		output+="<span>"+str[i]+"</span>";
	}
	return output;
}

function oc() {	//open console
	window.consolerunning=false;
	updateConsole();
}

function cc() {	//close console
	window.consolerunning=true;
	updateConsole();
}

function updateConsole(fromlinux) {
	//Removing the forcelinebreak-div will freeze hell and make the dead walk the earth. You want that? No, you don't. So don't fucking remove this.
	var cursorpos=doGetCaretPosition(document.getElementById("userinputworkaround"));
	if (window.consolerunning) {
		$("#console_primary_content").html("<div id=forcelinebreak></div>"+window.consolecontent+"<span id=userinput><span>&nbsp;</span></span>");
		$("#userinput > span").removeClass("mark");
		$("#userinput > span:last-child").addClass("mark");
	} else {
		$("#console_primary_content").html("<div id=forcelinebreak></div>"+window.consolecontent+(fromlinux?'':window.consoleurl)+"<div id=forcelinebreak></div><span id=userinput>"+spanify(window.userinput)+"<span>&nbsp;</span></span>");
		$("#userinput > span").removeClass("mark");
		$("#userinput > span:nth-child("+(cursorpos+1)+")").addClass("mark");
	}
}

function runCommand(command) {
	command=command.trim();
	if (command=="") {
		window.consolecontent+=window.consoleurl;
		return;
	}
	
	var split=command.split(" ");
	var cmd=split[0];
	
	if (typeof window.shortcuts[cmd]!=="undefined") {
		cmd=window.shortcuts[cmd];
	}
	
	if (window.registeredcommands.indexOf(cmd)==-1) {
		window.abort = function(){linux_send("\x03");}
		linux_send(command+"\n");
		window.userinput="";
		window.commandhistory[window.commandhistory.length-1]=command;
		window.commandhistory.push("");
		window.currentcommand=window.commandhistory.length - 1;
		return;
	}
	window.userinput="";
	window.commandhistory[window.commandhistory.length-1]=command;
	window.commandhistory.push("");
	window.currentcommand=window.commandhistory.length - 1;
	window.consolecontent+=window.consoleurl+command+"<br>";
	
	split.splice(0,1);
	
	//RUN THE COMMAND AYY LMAO
	window[cmd](split);
	setTimeout(updateConsole, 100);
}

function print(str) {
	if (typeof str==="undefined") {
		return;
	}
	window.consolecontent+=str;
	updateConsole();
}

function println(str) {
	if (typeof str ==="undefined") {
		str="";
	}
	window.consolecontent+=str+"<br>";
	updateConsole();
}

function throwerror() {
	errors=[
		"This is your fault. I'm going to kill you. And all the cake is gone. You don't even care, do you?",
		"Unbelievable. You, &lt;subject name here&gt; must be the pride of &lt;subject hometown here&gt;.",
		"Look, you're wasting your time. And, believe me, you don't have a whole lot left to waste. What's your point, anyway?",
		"You've been wrong about every single thing you've ever done, including this thing. You're not smart. You're not a scientist. You're not a doctor. You're not even a full-time employee! Where did your life go so wrong?",
		"Let's be honest. Neither one of us knows what that thing does. Just put it in the corner and I'll deal with it later.",
		'Well done. Here are the test results: You are a horrible person. I\'m serious, that\'s what it says: "A horrible person."',
		"It's just us talking, like regular people. And this is no joke: we are in deep trouble.",
	]
	error=errors[Math.floor(Math.random()*errors.length)];
	
	print("Error. ");
	println(error);
	oc();
}