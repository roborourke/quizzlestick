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
			quiz: function( quiz ) {
				
				// declare var for this scope
				var quizconfig = quiz;
				
				return this.each( function() {
					
					var quiz = $( this ),
						config = quizconfig || quiz.data( 'config' ),
						questions,
						parse;
					
					// make sure we have everything we need
					config = $.extend( {}, $.fn.quizzlestick.defaults, config );
					
					// store reference to quiz & current state on element
					quiz.data( 'quiz', config );
					
					// bind events
					quiz
						// triggers
						.on( 'start', 		config.onstart 		)
						.on( 'complete', 	config.oncomplete 	)
						.on( 'answer', 		config.onanswer 	)
						.on( 'correct', 	config.oncorrect 	)
						.on( 'incorrect', 	config.onincorrect 	)
						.on( 'timeup', 		config.ontimeup 	)
						.on( 'next', 		config.onnext 		)
						.on( 'prev', 		config.onprev 		)
						.on( 'get', 		config.onget 		)
						.on( 'set', 		config.onset 		)
						// inputs
						.on( 'click', '.quizzlestick-check', function( e ) {
							e.preventDefault();
							
							var question = $( this ).parents( '.quizzlestick-question' ),
								answers = question.find( '.quizzlestick-answer' ),
								result = question.find( '.quizzlestick-result' ),
								selected = question.find( '.quizzlestick-selected' ),
								check = question.find( '.quizzlestick-check' ),
								next = question.find( '.quizzlestick-next' ),
								questionid = questions.index( question ),
								qdata = config.questions[ questionid ],
								correct;
							
								// don't allow questions to be answered again
								if ( question.data( 'answered' ) )
									return;

								// been answered
								question.addClass( 'quizzlestick-answered' ).data( 'answered', true );
								
								qdata.total++;
								
								// store answer
								if ( ! config.state.answers[ questionid ] )
									config.state.answers[ questionid ] = [];
								
								// check answers
								selected.each( function() {
									var answer = $( this ),
										answerid = answers.index( answer ),
										adata = qdata.answers[ answerid ];
									
									// store answers
									config.state.answers[ questionid ].push( answerid );
									
									// increment number of answers
									adata.total++;
									
									if ( adata.correct ) {
										
										// correct answer styling
										answer.addClass( 'quizzlestick-correct' );
										
										// show correct result in result box
										if ( adata.resultcorrect )
											result.append( adata.resultcorrect );
										
									} else if ( ! config.state.poll ) {
										
										// incorrect answer styling
										answer.addClass( 'quizzlestick-incorrect' );
										
										// show incorrect result
										if ( adata.resultincorrect )
											result.append( adata.resultincorrect );
										
									}
								} );
								
								// is it correct
								correct = config.state.answers[ questionid ].sort().join('') == qdata.correct.sort().join('');
								
								// show correct answers
								answers.each( function( i ) {
									if ( $.inArray( i, qdata.correct ) >= 0 )
										$( this ).addClass( 'quizzlestick-correct' );
								} );
								
								// multi choice handling
								if ( config.type == 'multi' ) {
									
								}
								
								// single choice handling
								if ( config.type == 'single' ) {
								
								}
								
								// is this a quiz
								if ( ! config.state.poll ) {
									
									// are we correct?
									if ( correct ) {
										
										question.addClass( 'quizzlestick-question-correct' );
										
										if ( qdata.resultcorrect )
											result.append( qdata.resultcorrect );
										else if ( qdata.result )
											result.append( qdata.result );
										else
											result.prepend( config.templates.correct );
											
										// oncorrect
										quiz.trigger( 'correct', [ correct, question, qdata, config ] );
										
									} else {
										
										question.addClass( 'quizzlestick-question-incorrect' );
										
										if ( qdata.resultcorrect )
											result.append( qdata.resultincorrect );
										else if ( qdata.result )
											result.append( qdata.result );
										else
											result.prepend( config.templates.incorrect );
										
										// onincorrect
										quiz.trigger( 'incorrect', [ correct, question, qdata, config ] );
										
									}
									
									// show result text if any
									if ( $.trim( result.html() ) !== '' )
										result.removeClass( 'quizzlestick-hidden' );
									
								// this is a poll
								} else {
									
									// show result
									
								}
								
								// show next if no q delay
								if ( ! config.nextdelay ) {
									if ( config.mustanswer )
										next.show().removeClass( 'quizzlestick-hidden' );
								} else {
									setTimeout( function() {
										next.click();
									}, config.nextdelay );
								}
								
								// trigger onanswer
								quiz.trigger( 'answer', [ correct, question, qdata, config ] );
							
							} )
						.on( 'click', '.quizzlestick-next', function( e ) {
							e.preventDefault();
							
							var question = $( this ).parents( '.quizzlestick-question' ),
								answers = question.find( '.quizzlestick-answer' ),
								result = question.find( '.quizzlestick-result' ),
								questionid = questions.index( question ),
								qdata = config.questions[ questionid ];
							
							// update state
							config.state.question++;
							
							// have we reached the end
							if ( config.state.question < questions.length ) {
							
								// move current classes
								question
									.removeClass( 'quizzlestick-current' )
									.addClass( 'quizzlestick-question-prev' );
									
								question.next()
									.addClass( 'quizzlestick-current' )
									.removeClass( 'quizzlestick-question-next' );
								
							} else {
							
								question.removeClass( 'quizzlestick-current' );
								
								// quiz finished	
								quiz.addClass( 'quizzlestick-complete' );
								
								// show final results
								quiz.find( '.quizzlestick-result-final' )
									.removeClass( 'quizzlestick-hidden' )
									.html( 'done!' );
									
							}
							
							} )
						.on( 'click', '.quizzlestick-answer', function( e ) {
							e.preventDefault();
							
							var answer = $( this ),
								question = $( this ).parents( '.quizzlestick-question' ),
								answers = question.find( '.quizzlestick-answer' ),
								result = question.find( '.quizzlestick-result' ),
								check = question.find( '.quizzlestick-check' ),
								next = question.find( '.quizzlestick-next' ),
								prev = question.find( '.quizzlestick-prev' ),
								questionid = questions.index( question ),
								answerid = answers.index( answer ),
								qdata = config.questions[ questionid ];
								adata = qdata.answers[ answerid ];
								
							if ( question.data( 'answered' ) )
								return;
							
							// multi choice game
							if ( config.type === 'multi' ) {
								
								// trigger onselect
								quiz.trigger( 'select' );
								answer.trigger( 'select' );
								
								// selection indicator
								answer.toggleClass( 'quizzlestick-selected' );
								
								// show check answer box
								if ( answers.filter( '.quizzlestick-selected' ).length )
									check.removeClass( 'quizzlestick-hidden quizzlestick-disabled' );
								else
									check.addClass( 'quizzlestick-disabled' );
								
							}
							
							// single choice game
							if ( config.type === 'single' ) {
								
								// selection indicator
								answer.addClass( 'quizzlestick-selected' );
								
								// check answer
								check.click();
								
							}
							
							// onselect
							if ( $.type( adata.onselect ) === 'function' )
								adata.onselect.apply( this, [ adata, question, qdata ] );
							
						} );
					
					// Process questions & answers
					// determine total possible points
					// check if we have no correct answers eg. it's a poll
					$.each( config.questions, function( q, question ) {
						
						// initialise question object
						config.questions[ q ] = $.extend( {}, $.fn.quizzlestick.defaults.questiondefaults, question );
						
						$.each( question.answers, function( a, answer ) {
							
							// initialise answer object
							config.questions[ q ].answers[ a ] = $.extend( {}, $.fn.quizzlestick.defaults.answerdefaults, answer );
							
							// add flag incase multiple right answers
							if ( answer.correct ) {
								config.questions[ q ].correct.push( a );
								config.state.poll = false;
							}
							
							// update maxpoints
							config.state.maxpoints += config.questions[ q ].answers[ a ].points;
							
						} );
						
					} );
					

					// template function (crappy mustache)
					parse = function( template, context, args ) {
						var getpath = function( path, object ) {
								path = path.split( '.' );
								if ( path.length == 4 )
									return object[ path[0] ][ path[1] ][ path[2] ][ path[3] ];
								if ( path.length == 3 )
									return object[ path[0] ][ path[1] ][ path[2] ];
								if ( path.length == 2 )
									return object[ path[0] ][ path[1] ];
								if ( path.length == 1 )
									return object[ path[0] ];
								return false;
							},
							parser = function( match, p1, offset, s ) {
								// get object property
								var val = getpath( p1, context ),
									out = '';
								
								// array type
								if ( $.type( val ) === 'array' ) {
									$.each( val, function( i, item ) {
										out += parse( getpath( item.template, config ), item, { index: i } );
									} );
								// function type
								} else if ( $.type( val ) === 'function' ) {
									out = val.apply( quiz.get(0), [ context, config, args ] );
								// string	
								} else {
									out = val;
								}

								return parse( out, context );
							};
						
						return template.replace( /{{([a-z0-9\.]+)}}/gi, parser );
					};

					// create markup
					quiz.html( parse( config.templates.wrap, config ) );
					
					// store some placeholder vars for elements of the quiz
					questions = quiz.find( '.quizzlestick-question' );
					
					// if timed game show start screen
					
					
					// if single choice hide check answer
					if ( config.type == 'single' )
						quiz.find( '.quizzlestick-check' ).hide();
					
					// hide next buttons, shown when answered
					if ( config.mustanswer ) {
						quiz.find( '.quizzlestick-next' ).hide();
						quiz.find( '.quizzlestick-prev' ).hide();
					}
					
					// init state
					if ( config.questions ) {
						questions.eq( config.state.question ).addClass( 'quizzlestick-current' );
						questions.eq( config.state.question + 1 ).addClass( 'quizzlestick-question-next' );
						questions.eq(-1).find( '.quizzlestick-next' ).html( 'Results' );
						// progress meter
					}

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
			return methods.quiz.apply( this, arguments ); // default to quiz method
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.quizzlestick' );
		}
		return this;
	};
	
	// default quiz config
	$.fn.quizzlestick.defaults = {
		
		// optional additional class name for the quiz. default is quizzlestick + quizzlestick-type
		classname: '',
	
		// game type, 'single', 'multi' only at the moment
		type: 'single',
		
		// quiz description html, can be anything such as a main question or instructions
		description: '',
		
		// if 0 then no timer, timer starts when user clicks start
		timelimit: 0,
		
		// set a delay for auto proceeding to next question on answer, if 0 then requires clicking next
		nextdelay: 0,
		
		// reference to current quiz state
		state: {
			question: 0,
			time: 0,
			points: 0,
			maxpoints: 0,
			answers: [],
			poll: true 		// if any answers are marked as correct this is set to false
		},
		
		// if true then players must answer questions before progressing
		mustanswer: true,
		
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
		results: {
			// '4': 'rubbish!',				// 0-4 points
			// '8': 'ok I guess',			// 4-8 points
			// '12': 'well done',			// 8-12 points
			// '16': 'get you, genius!'		// 12-16 points
		},
		
		// returns a points based result from the results object
		getresult: function( points, results ) {
			
			for ( var n in results ) {
				if ( points <= parseInt( n, 10 ) )
					return results[ n ];
			}
			
			return false;
		},
		
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
		
		// question defaults
		questiondefaults: {
			question: '', 		// question html
			answers: [],        // array of answer objects
			onanswer: null,
			oncorrect: null,
			onincorrect: null,
			result: '',
			resultcorrect: '',
			resultincorrect: '',
			correct: [],
			template: 'templates.question',
			total: 0, 			// override this with total number of answers
			friends: []			// list of friend ids eg. facebook
		},
		
		// answer defaults
		answerdefaults: {
			answer: '',         // answer html
			correct: false,     // whether answer is right or not
			points: 0, 			// points scored for answer
			onselect: null,		// when an answer is selected
			result: '',
			resultcorrect: '',
			resultincorrect: ''	,
			template: 'templates.answer',
			total: 0,			// override this with total number of answers
			friends: []			// list of friend ids eg. facebook
		},
		
		// html output for quiz elements
		templates: {
			wrap: '\
				<div class="quizzlestick">\
					{{templates.description}}\
					{{templates.timer}}\
					{{templates.questions}}\
					{{templates.result}}\
				</div>\
			',
			description: '\
				<div class="quizzlestick-description">\
					{{description}}\
				</div>\
			',
			timer: function( context, config ) {
				if ( ! config.timelimit )
					return '';
				return '\
				<div class="quizzlestick-timer">\
					<span class="quizzlestick-timer-time">0:00</span>\
					<div class="quizzlestick-timer-progress">\
						<div class="quizzlestick-timer-progress-bar"></div>\
					</div>\
				</div>\
				';
			},
			result: function( context, config ) {
				return '\
				<div class="quizzlestick-result quizzlestick-result-final quizzlestick-hidden">\
					{{templates.share}}\
				</div>';
			},
			questions: '\
				<ul class="quizzlestick-questions">\
					{{questions}}\
				</ul>\
			',
			question: '\
				<li class="quizzlestick-question">\
					{{question}}\
					<ul class="quizzlestick-answers">\
						{{answers}}\
					</ul>\
					<div class="quizzlestick-result quizzlestick-question-result quizzlestick-hidden"></div>\
					<a class="quizzlestick-check quizzlestick-hidden" href="#">Check answer</a>\
					<a class="quizzlestick-next quizzlestick-hidden" href="#">Next question</a>\
				</li>\
			',
			answer: '\
				<li class="quizzlestick-answer">\
					<a href="#">{{answer}}</a>\
				</li>\
			',
			correct: 'Correct!',
			incorrect: 'Wrong!',
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
		
		nextquestion: function() {
			
		},
		
		prevquestion: function() {
			
		}
		
	} );
	
	
})(jQuery);
