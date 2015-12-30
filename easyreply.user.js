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

// workaround for Safari
// (as if anyone uses Safari)
// ((glares at @AlexA.))
function withJQuery(f) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.textContent = '('+ f + ')(jQuery)';
	document.head.appendChild(script);
}

withJQuery(easyreply);

function easyreply($) {
	// OPTIONS
	// change the identifiers to look for on either end of a username
	var PREFIX = '@';
	var SUFFIX = '@';
	
	function messageAuthor(message) {
		// a group of continuous messages by the same user is a "monologue"
		// go up to the monologue, then find the author
		// strip spaces from the username because that's how the name you type to ping someone is found
		// (e.g.) pinging 'Alex A.' is done by typing '@AlexA.')
		return message.parent().parent().children('.signature').children('.username').text().replace(/ /g, '');
	}
	
	function getNewText(old) {
		// runs just before sending a message
		// takes text of message about to be sent
		// returns message to send instead
		var newText = old; // by default don't change anything
		var firstWord = old.split(' ')[0];
		
		// if the first word denotes a reply
		if (firstWord.slice(0, PREFIX.length) == PREFIX && firstWord.slice(-SUFFIX.length) == SUFFIX) {
			// go backwards through the messages until finding one that is by the mentioned user OR there are no more messages
			var message = $('.message:last');
			while (message.length && firstWord != PREFIX + messageAuthor(message) + SUFFIX) {
				var prev = message.prev('.message'); // go up one message
				if (!prev.length) { // handle monologue barriers
					// stole this code wholesale from doorknob. i mostly understand it.
					prev = message.closest('.monologue').prevAll('.monologue').eq(0).find('.message:last');
				}
				message = prev;
			}
			if (message.length) { // if a message was found
				// reply syntax is ':[message id]'
				// messages have the attribute 'id', containing 'message-[message id]'
				// put a colon, everything after the hyphen in the id, then the original message minus the first word
				newText = ':' + message.attr('id').split('-')[1] + ' ' + old.split(' ').slice(1).join(' ');
			}
		}
		return newText;
	}
	
	var input = $('#input');
	
	input.keydown(function(e) {
		if (e.which == 13) { // when enter key is pressed
			e.preventDefault();
			input[0].value = getNewText(input[0].value); // replace text in message box
			$('sayit-button').click(); // SLAM THAT SEND BUTTON
		}
	});
	
	// i don't know what this means but doorknob's code has it ¯\_(ツ)_/¯
	var kdevts = $('#input').data('events').keydown;
	kdevts.unshift(kdevts.pop());
	// doorknob: "For the record, it moves the last keydown event to the front of the 'list' of events."
	// "That way your function is called before SE's default functions."
	// "Otherwise, the message would be sent *before* the replacement would be made."
	// thanks doorknob
}
