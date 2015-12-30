// ==UserScript==
// @name easyreply
// @namespace http://reddit.com/u/undergroundmonorail
// @author monorail
// @version 0.1
// @description easily respond to a user's last message in se chat
// @copyright MIT
// @include *://chat.stackoverflow.com/*
// @include *://chat.stackexchange.com/*
// @include *://chat.meta.stackexchange.com/*
// ==/UserScript==

function withJQuery(f) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.textContent = '('+ f + ')(jQuery)';
	document.head.appendChild(script);
}

withJQuery(easyreply);

function easyreply($) {
	function messageAuthor(message) {
		return message.parent().parent().children('.signature').children('.username').text().replace(/ /g, '');
	}
	
	function getNewText(old) {
		var newText = '';
		var firstWord = old.split(' ')[0];
		if (firstWord[0] == '@' && firstWord.slice(-1) == '@') {
			var message = $('.message:last');
			while (message.length && firstWord != '@' + messageAuthor(message) + '@') {
				var prev = message.prev('.message');
				if (!prev.length) {
					prev = message.closest('.monologue').prevAll('.monologue').eq(0).find('.message:last');
				}
				message = prev;
			}
			if (message.length) {
				newText = ':' + message.attr('id').split('-')[1] + ' ' + old.split(' ').slice(1).join(' ');
			} else {
				newText = old;
			}
		} else {
			newText = old;
		}
		return newText;
	}
	
	var input = $('#input');
	
	input.keydown(function(e) {
		if (e.which == 13) {
			e.preventDefault();
			input[0].value = getNewText(input[0].value);
			$('sayit-button').click();
		}
	});
	
	// i don't know what this means but doorknob's code has it ¯\_(ツ)_/¯
	var kdevts = $('#input').data('events').keydown;
	kdevts.unshift(kdevts.pop());
}
