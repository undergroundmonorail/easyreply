// ==UserScript==
// @name easyreply
// @namespace http://reddit.com/u/undergroundmonorail
// @author monorail
// @version 0.2
// @description easily respond to a user's last message in se chat
// @grant none
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
	// prefix/suffix of username to reply to
	var R_PREFIX = '@';
	var R_SUFFIX = '@';
	// prefix/suffix of username to star
	var S_PREFIX = '@';
	var S_SUFFIX = '*';
	
	var input = $('#input');

	function messageAuthor(message) {
		// a group of continuous messages by the same user is a "monologue"
		// go up to the monologue, then find the author
		// strip spaces from the username because that's how the name you type to ping someone is found
		// (e.g.) pinging 'Alex A.' is done by typing '@AlexA.')
		return message.parent().parent().children('.signature').children('.username').text().replace(/ /g, '');
	}
	
	function lastMessageFrom(author) {
			// go backwards through the messages until finding one that is by the mentioned user OR there are no more messages
			var message = $('.message:last');
			while (message.length && author.toLowerCase() !== messageAuthor(message).toLowerCase()) {
				var prev = message.prev('.message'); // go up one message
				if (!prev.length) { // handle monologue barriers
					// stole this code wholesale from doorknob. i mostly understand it.
					prev = message.closest('.monologue').prevAll('.monologue').eq(0).find('.message:last');
				}
				message = prev;
			}
			return message;	
	}
	
	function replyToMessage(message) {
		if (message.length) { // if a message was found
			// reply syntax is ':[message id]'
			// messages have the attribute 'id', containing 'message-[message id]'
			// put a colon, everything after the hyphen in the id, then the original message minus the first word
			input[0].value = ':' + message.attr('id').split('-')[1] + ' ' + input[0].value.split(' ').slice(1).join(' ');
		}
	}
1	
	function starMessage(message) {
		message.find('.stars:first .vote').click();
	}
	
	input.keydown(function(e) {
		if (e.which === 13) { // when enter key is pressed
			e.preventDefault();
			
			var firstWord = input[0].value.split(' ')[0];
			var R_author = firstWord.slice(R_PREFIX.length, -R_SUFFIX.length); // author name if reply
			var S_author = firstWord.slice(S_PREFIX.length, -R_SUFFIX.length); // author name if star
			
			if (R_PREFIX + R_author + R_SUFFIX === firstWord) {
				replyToMessage(lastMessageFrom(R_author));
			} else if (S_PREFIX + S_author + S_SUFFIX === firstWord) {
				starMessage(lastMessageFrom(S_author));
				input[0].value = ''; // no message is sent, clear input box manually
			}
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
