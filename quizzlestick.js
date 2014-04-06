/*global jQuery */
/*!
* quizzlestick.js 0.1
*
* Copyright 2014, Robert O'Rourke sanchothefat.com
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Date: Sun Apr 6 16:00:00 2014
*/
(function($){
	
	var methods = {
			
			// set up game engine
			quiz: function( config ) {
				
				return this.each( function() {
					
					var quiz = $( this ),
						state = {
							question: 0,
							time: 0,
							points: 0,
							maxpoints: 0,
							answers: []
						};
					
					// make sure we have everything we need
					config = $.extend( {}, $.fn.quizzlestick.quiz.defaults, config );
					
					// store reference to quiz & current state on element
					quiz.data( 'quiz', config );
					quiz.data( 'quizstate', state );
					
					// bind events
					quiz
						.on( 'start', config.onstart )
						.on( 'complete', config.oncomplete )
						.on( 'answer', config.onanswer )
						.on( 'correct', config.oncorrect )
						.on( 'incorrect', config.onincorrect )
						.on( 'timeup', config.ontimeup )
						.on( 'next', config.onnext )
						.on( 'prev', config.onprev )
						.on( 'get', config.onget )
						.on( 'set', config.onset );
					
					
					// determine total possible points
					// check if we have no correct answers eg. it's a poll
					$.each( config.questions, function( q, question ) {
						
						// initialise question object
						config.questions[ q ] = new $.fn.quizzlestick.question( question );
						
						$.each( questions.answers, function( a, answer ) {
							
							// initialise answer object
							config.questions[ q ].answers[ a ] = new $.fn.quizzlestick.answer( answer );
							
							// update maxpoints
							state.maxpoints += config.questions[ q ].answers[ a ].points;
							
						} );
					} );
					
					
					// create markup
					quiz.html( config.wrap );
					
					
					return quiz;
				} );
			
			},
			
			complete: function() {
				$( this ).trigger( 'complete' );
				return this;
			},
			
			// next question
			next: function() {
				$( this ).trigger( 'next' );
				return this;
			},
			
			// prev question
			prev: function() {
				$( this ).trigger( 'prev' );
				return this;
			},
			
			// timer controls
			timer: function( command ) {
				
				switch( command ) {
					case 'stop':
						break;
					case 'start':
						break;
					case 'pause':
						break;
				}
				
				return this;
			}
			
		};

	$.fn.quizzlestick = function( method ) {
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.quiz.apply( this, arguments ); // default to letters method
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.lettering' );
		}
		return this;
	};
	
	// default quiz config
	$.fn.quizzlestick.defaults = {
	
		// game type, 'multichoice' only at the moment
		type: 'multichoice',
		
		// quiz description html, can be anything such as a main question or instructions
		description: '',
		
		// if 0 then no timer, timer starts when user clicks start
		timelimit: 0,
		
		// an id or unique key to identify the player eg. facebook id
		player: function() {
			
			},
		
		// if true uses a cookie to determine whether user has played or not
		playonce: false,
		
		// question ordering
		order: 'normal', // 'random'
		
		// limit number of questions each time quiz is shown, only used if order is random
		maxquestions: 0,
		
		// array of questions & answers
		questions: [],
		
		// array of possible results
		results: [],
		
		// events
		onstart: function() {
			
		},
		oncomplete: function() {
			
		},
		onselect: function() {
		
		},
		onanswer: function() {
			
		},
		oncorrect: function() {
			
		},
		onincorrect: function() {
			
		},
		ontimeup: function() {
			
		},
		onnext: function() {
			
		},
		onprev: function() {
			
		},
		onget: function() {
			
		},
		onset: function() {
			
		},
		
		// html output for quiz elements
		templates: {
			wrap: '',
			timerstart: '',
			result: '',
			question: '',
			answer: '',
			correct: '',
			incorrect: '',
			share: ''
		},
		
		// storage and retrieval implementation, to be overridden eg. for playtomic
		api: {
			set: function( key, value ) {
				
				},
			get: function( key ) {
				
				}
		}
	};
	
	// quiz prototype
	$.extend( $.fn.quizzlestick.prototype, {
		
		
	} );
	
	// question prototype
	$.fn.quizzlestick.question = function( config ) {
		
		var question = this;
		
		config = $.extend( {}, $.fn.quizzlestick.question.defaults, config );
		
		return question;
	};
	
	$.fn.quizzlestick.question.defaults = {
		quiz: null, 		// reference to quiz node
		question: '', 		// question html
		answers: [],        // array of answer objects
		onanswer: null,
		oncorrect: null,
		onincorrect: null
	};
	
	$.extend( $.fn.quizzlestick.question.prototype, {
	} );
	
	// answer prototype
	$.fn.quizzlestick.answer = function( config ) {
		
		var answer = this;
		
		config = $.extend( {}, $.fn.quizzlestick.answer.defaults, config );
		
		return answer;
	};
	
	$.fn.quizzlestick.answer.defaults = {
		quiz: null, 		// reference to quiz node
		answer: '',         // answer html
		correct: false,     // whether answer is right or not
		points: 0, 			// points scored for answer
		onselect: null,
		
	};
	
	$.extend( $.fn.quizzlestick.answer.prototype, {
	} );

})(jQuery);
