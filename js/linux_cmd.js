"use strict";

var bootready = false;
var linux_receive_char = function(str) {
	window.consolecontent+=str;
	/*if(str.indexOf('\n')>=0)*/ updateConsole(true);
};
var linux_send;

function initialize_linux() {
	linux_receive_char("Booting ");
	var log = function(x) {linux_receive_char(x);};
    var emulator = new V86Starter({
        bios: {
            url: "img/seabios.bin",
        },
        vga_bios: {
            url: "img/vgabios.bin",
        },
        cdrom: {
            url: "img/linux.iso",
        },
        autostart: true,
        disable_keyboard: true,
    });

    // In this example we wait for output from the serial terminal, which
    // should be running busybox. We log in as soon as a prompt appears and then
    // retrieve a directory listing of the root directory
    var data = "";

    var stages = [
        {
            test: "login:",
            send: "root\n",
        },
		{
			test: "/root% ",
			send: "alias ls=\"ls --color=never\"; rm -r *; echo 'hi:)'>yolo.txt\n"
		},
		{
			test: "/root% ",
			send: "PS1=\"Lutan@GLaDOS:\\w$ \"\n"
		},
		{
			test: "PS1=\"Lutan@GLaDOS:\\w$ \"\n",
		}
    ];
    var stage = 0;

	var screen_charcount = 0;
	function boot_printer(char) {
		if(screen_charcount++%14000==0) {
			log('.');
		}
	}
	emulator.add_listener("screen-put-char", boot_printer);
	function boot_complete() {
		log("\n");
		bootready = true;
		emulator.remove_listener("screen-put-char", boot_printer);
		emulator.remove_listener("serial0-output-char", initializer);
		emulator.add_listener("serial0-output-char", linux_receive_char);
		whenbooted();
		return;
	};

	function initializer(char) {
        if(char === "\r")
        {
            return;
        }

        data += char;
        var current = stages[stage];

		if(!current) { boot_complete(); return; }

        if(data.endsWith(current.test))
        {
			if(!current.send) { boot_complete(); return; }
			data = "";
            stage++;
            emulator.serial0_send(current.send);

			console.log("Sending: " + current.send.replace(/\n/g, "\\n") + "\n");
        }
    }
	linux_send = function(text) { console.log("sending "+text);emulator.serial0_send(text); }

	emulator.add_listener("serial0-output-char", initializer); 
}
$(function() {
	$.getScript("js/libv86.js", initialize_linux);
});
