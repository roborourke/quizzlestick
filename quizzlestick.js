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
						config = quizconfig || quiz.data( 'quizzlestick' ),
						apidata, 		// fetch data from the api you define when the quiz is loading to override values
						questionwrap,	// pointer to wrapper element for questions
						questions, 		// pointer to questions collection
						progress,		// pointer to progress indicator
						timer, 			// pointer to timer element
						result, 		// pointer to final result block
						start, 			// pointer to start screen element
						check, 			// pointer to one .quizzlestick-check button
						next, 			// pointer to one .quizzlestick-next button
						prev, 			// pointer to one .quizzlestick-prev button
						finish, 		// pointer to one .quizzlestick-finish button
						clock;			// timer interval

					// make sure we have everything we need
					config = $.extend( true, {}, $.fn.quizzlestick.defaults, config );

					// store reference to quiz & current state on element
					quiz.data( {
						quizzlestick: config,
						initialised: true
					} );

					// if a config ID is available attempt to fetch something we can extend config with
					// use this to pull down totals & friend lists etc... in case of front end caching
					if ( config.id ) {
						config.api.send( {
							id: config.id,
							action: 'config'
						}, config );
					}

					quiz
						// styling/js hooks
						.addClass( 'quizzlestick quizzlestick-' + config.type + ' ' + config.classname )

						// bind events
						.on( 'start', 		config.onstart 		)
						.on( 'complete', 	config.oncomplete 	)
						.on( 'answer', 		config.onanswer 	)
						.on( 'correct', 	config.oncorrect 	)
						.on( 'incorrect', 	config.onincorrect 	)
						.on( 'timer', 		config.ontimer 		)
						.on( 'next', 		config.onnext 		)
						.on( 'prev', 		config.onprev 		)
						.on( 'ready', 		config.onready  	)

						// starts the timer
						.on( 'tap click', '.quizzlestick-start', function( e ) {
							e.preventDefault();

							// check we're not running already
							if ( quiz.data( 'started' ) || quiz.data( 'complete' ) )
								return;

							quiz.data( 'started', true );

							// quiz timer
							clock = setInterval( function() {

								// increment quiz time
								config.state.time += 1000;
								timer.html( quiz.fumanchu( '{{templates.timer}}', config ) );

								// timer event
								quiz.trigger( 'timer', [ config.state.time, config ] );

								// end quiz
								if ( config.state.time >= config.timelimit ) {

									// show results
									config.mustanswer = false;
									quiz.find( '.quizzlestick-finish' ).click();

								} else {


								}

							}, 1000 );

							// show questions & hide start screen
							start.addClass( 'quizzlestick-hidden' ).hide();
							questionwrap.show().removeClass( 'quizzlestick-hidden' );

							// start event
							quiz.trigger( 'start', [ clock, config ] );

							} )

						// check the answer(s)
						.on( 'tap click', '.quizzlestick-check', function( e ) {
							e.preventDefault();

							if ( quiz.data( 'complete' ) )
								return;

							var question = quiz.find( '.quizzlestick-current' ),
								answers = question.find( '.quizzlestick-answer' ),
								qresult = question.find( '.quizzlestick-result' ),
								selected = question.find( '.quizzlestick-selected' ),
								questionid = question.data( 'id' ),
								qdata = config.questions[ questionid ],
								correct;

								// don't allow questions to be answered again
								if ( question.data( 'answered' ) )
									return;

								// hide check button
								check
									.addClass( 'quizzlestick-hidden' )
									.hide();

								// been answered
								question.addClass( 'quizzlestick-answered' ).data( 'answered', true );

								// update question id incase we jumped to this one
								config.state.question = questionid;

								// update total clicks
								qdata.total++;

								// store answer
								if ( ! config.state.answers[ questionid ] )
									config.state.answers[ questionid ] = [];

								// check answers
								selected.each( function() {
									var answer = $( this ),
										answerid = answer.data( 'id' ),
										adata = qdata.answers[ answerid ];

									// store answers
									config.state.answers[ questionid ].push( answerid );

									// increment number of answers
									adata.total++;
									answer.find( '.quizzlestick-answer-total' ).html( adata.total );

									// if the answer is correct
									if ( adata.correct ) {

										// increment points
										config.state.points += parseInt( adata.points, 10 );

										// which quizzes are about the end results, only points needed
										if ( config.type !== 'which' ) {
											// correct answer styling
											answer.addClass( 'quizzlestick-correct' );

											// show correct result in result box
											if ( adata.resultcorrect )
												qresult.append( quiz.fumanchu( adata.resultcorrect, adata ) );
										}

									} else if ( config.type !== 'poll' ) {

										// incorrect answer styling
										answer.addClass( 'quizzlestick-incorrect' );

										// show incorrect result
										if ( adata.resultincorrect )
											qresult.append( quiz.fumanchu( adata.resultincorrect, adata ) );

									}
								} );

								// is it correct
								correct = config.state.answers[ questionid ].sort().join('') == qdata.correct.sort().join('');

								// show correct answers
								answers.each( function( i ) {
									if ( $.inArray( i, qdata.correct ) >= 0 && config.type !== 'which' && config.type !== 'poll' )
										$( this ).addClass( 'quizzlestick-correct' );
								} );

								// is this a quiz
								if ( config.type === 'single' || config.type === 'multi' ) {

									// are we correct?
									if ( correct ) {

										question.addClass( 'quizzlestick-question-correct' );

										if ( qdata.resultcorrect )
											qresult.append( quiz.fumanchu( qdata.resultcorrect, qdata, config ) );
										else if ( qdata.result )
											qresult.append( quiz.fumanchu( qdata.result, qdata, config ) );

										qresult.prepend( quiz.fumanchu( config.templates.correct, qdata, config ) );

										// oncorrect
										quiz.trigger( 'correct', [ correct, question, qdata, config ] );

									} else {

										question.addClass( 'quizzlestick-question-incorrect' );

										if ( qdata.resultcorrect )
											qresult.append( quiz.fumanchu( qdata.resultincorrect, qdata, config ) );
										else if ( qdata.result )
											qresult.append( quiz.fumanchu( qdata.result, qdata, config ) );

										qresult.prepend( quiz.fumanchu( config.templates.incorrect, qdata, config ) );

										// onincorrect
										quiz.trigger( 'incorrect', [ correct, question, qdata, config ] );

									}

								// which is it no question/answer result
								} else if ( config.type === 'which' ) {

								// polls update answer template
								} else if ( config.type === 'poll' ) {

									// update answer templates before parsing
									$.each( qdata.answers, function( a, answer ) {
										qdata.answers[ a ].template = config.templates.pollresult;
									} );

									// get poll result
									qresult.append( quiz.fumanchu( config.templates.pollresults, qdata, config ) );

								}

								// show result text if any
								if ( $.trim( qresult.html() ) !== '' )
									qresult.removeClass( 'quizzlestick-hidden' );

								// update progress indicator incase it uses numanswers
								progress.html( quiz.fumanchu( '{{templates.progress}}', config ) );

								// trigger onanswer
								quiz.trigger( 'answer', [ correct, question, qdata, config ] );

								// post config to API endpoint
								config.api.send( {
									id		: config.id,
									action	: 'answer',
									question: questionid,
									correct	: correct,
									state	: config.state
								}, config );

								// end game if everything has been answered
								if ( config.helpers.numanswers( {}, config ) >= questions.length ) {

									finish.click();

								// proceed to next question
								} else {

									// show next if no q delay
									if ( ! config.nextdelay ) {
										if ( config.mustanswer && questions.length > 1 ) {
											next.add( question.find( '.quizzlestick-next' ) ).show().removeClass( 'quizzlestick-hidden' );
										} else {

										}
									} else {
										setTimeout( function() {
											next.click();
										}, config.nextdelay );
									}

								}

							} )
						.on( 'tap click', '.quizzlestick-next', function( e ) {
							e.preventDefault();

							if ( quiz.data( 'complete' ) )
								return;

							// end game if everything has been answered
							if ( config.helpers.numanswers( {}, config ) >= questions.length ) {
								finish.click();
								return;
							}

							var question = quiz.find( '.quizzlestick-current' ),
								questionnext = question.next(),
								questionid = question.data( 'id' ),
								qdata = config.questions[ questionid ];

							// remove current class
							questions
								.removeClass( 'quizzlestick-question-prev quizzlestick-question-next quizzlestick-current' );
							question
								.removeClass( 'quizzlestick-current' )
								.addClass( 'quizzlestick-question-prev' );

							// have we reached the end, or have we answered every question?
							if ( config.state.question < questions.length ) {

								// update current question pointer
								config.state.question = questionid+1;

								// update progress indicator
								progress.html( quiz.fumanchu( '{{templates.progress}}', config ) );

								// move current classes
								questionnext
									.addClass( 'quizzlestick-current' )
									.next()
										.addClass( 'quizzlestick-question-next' );

								// next event trigger
								quiz.trigger( 'next', [ questionnext, questions, config ] );

							}

							} )

						.on( 'tap click', '.quizzlestick-prev', function( e ) {
							e.preventDefault();

							if ( quiz.data( 'complete' ) )
								return;

							// end game if everything has been answered
							if ( config.helpers.numanswers( {}, config ) >= questions.length ) {
								finish.click();
								return;
							}

							var question = quiz.find( '.quizzlestick-current' ),
								questionprev = question.prev(),
								resulthtml = '',
								questionid = question.data( 'id' ),
								qdata = config.questions[ questionid ];

							// remove current class
							questions
								.removeClass( 'quizzlestick-question-prev quizzlestick-question-next quizzlestick-current' );
							question
								.removeClass( 'quizzlestick-current quizzlestick-question-prev' )
								.addClass( 'quizzlestick-question-next' );

							// have we reached the beginning
							if ( config.state.question > 0 ) {

								// update current question pointer
								confid.state.question = questionid - 1;

								// update progress indicator
								progress.html( quiz.fumanchu( '{{templates.progress}}', config ) );

								// move current classes
								questionprev
									.addClass( 'quizzlestick-current' )
									.prev()
										.addClass( 'quizzlestick-question-prev' );

								// prev event trigger
								quiz.trigger( 'prev', [ questionprev, questions, config ] );

							}

							} )
						.on( 'tap click', '.quizzlestick-answer', function( e ) {
							e.preventDefault();

							if ( quiz.data( 'complete' ) )
								return;

							var answer = $( this ),
								question = $( this ).parents( '.quizzlestick-question' ),
								answers = question.find( '.quizzlestick-answer' ),
								questionid = question.data( 'id' ),
								answerid = answer.data( 'id' ),
								qdata = config.questions[ questionid ],
								adata = qdata.answers[ answerid ];

							if ( question.data( 'answered' ) )
								return;

							// setup class names
							questions.removeClass( 'quizzlestick-current quizzlestick-question-next quizzlestick-question-prev' );
							question.addClass( 'quizzlestick-current' );
							question.next().addClass( 'quizzlestick-question-next' );
							question.prev().addClass( 'quizzlestick-question-prev' );

							// multi choice game
							if ( config.type === 'multi' ) {

								// selection indicator
								answer.toggleClass( 'quizzlestick-selected' );

								// show check answer box
								if ( answers.filter( '.quizzlestick-selected' ).length )
									check.removeClass( 'quizzlestick-hidden quizzlestick-disabled' );
								else
									check.addClass( 'quizzlestick-disabled' );

							}

							// single choice game
							if ( config.type === 'single' || config.type === 'poll' || config.type === 'which' ) {

								// selection indicator
								answer.addClass( 'quizzlestick-selected' );

								// check answer
								check.click();

							}

							// onselect
							if ( $.type( adata.onselect ) === 'function' )
								adata.onselect.apply( this, [ adata, question, qdata ] );

							quiz.trigger( 'select', [ adata, question, qdata, config ] );
							answer.trigger( 'select', [ adata, question, qdata, config ] );

							} )
						.on( 'tap click', '.quizzlestick-finish', function( e ) {
							e.preventDefault();

							if ( quiz.data( 'complete' ) )
								return;

							// update progress indicator
							progress.html( quiz.fumanchu( '{{templates.progress}}', config ) );

							// finish game
							if ( config.helpers.numanswers( {}, config ) >= questions.length || ! config.mustanswer ) {

								// stop clock if running
								if ( config.timelimit )
									clearInterval( clock );

								// quiz finished
								quiz
									.addClass( 'quizzlestick-complete' )
									.data( 'complete', true );

								// hide all navigation links
								quiz.find( '.quizzlestick-next' ).addClass( 'quizzlestick-hidden' );
								quiz.find( '.quizzlestick-prev' ).addClass( 'quizzlestick-hidden' );

								// get rid of question classes, prev is useful for transitioning
								questions.removeClass( 'quizzlestick-current quizzlestick-question-next' );

								// show final results
								result
									.html( quiz.fumanchu( '{{templates.result}}', config ) )
									.show()
									.removeClass( 'quizzlestick-hidden' );

								// move user to results position, give the template a little time to render though
								setTimeout( function() {
									$( 'html,body' ).animate( { scrollTop: result.offset().top - 30 }, 1000 );
								}, 300 );

								// allow external plugin/script to hook in
								config.api.send( {
									id		: config.id,
									action	: 'complete',
									state	: config.state
								}, config );

								// finish game
								quiz.trigger( 'complete', [ config ] );

							}

							} );

					// Process questions & answers
					// determine total possible points etc...
					$.each( config.questions, function( q, question ) {

						var highest = 0;

						// initialise question object
						question = $.extend( true, { id: q }, $.fn.quizzlestick.defaults.questiondefaults, question );

						// populate with default template
						if ( ! question.template )
							question.template = config.templates.question;

						$.each( question.answers, function( a, answer ) {

							// initialise answer object
							answer = $.extend( true, { id: a }, $.fn.quizzlestick.defaults.answerdefaults, answer );

							// populate with default template
							if ( ! answer.template )
								answer.template = config.templates.answer;

							// all answers correct if it's a which are you/is it quiz
							if ( config.type === 'which' )
								answer.correct = true;

							// no correct answer if it's a poll
							if ( config.type === 'poll' ) {
								answer.correct = false;
								answer.points = 0;
							}

							// add flag incase multiple right answers
							if ( answer.correct ) {
								question.correct.push( a );
								config.state.poll = false;
							}

							// default correct answers to 1 point
							if ( answer.correct && parseInt( answer.points, 10 ) <= 0 && config.type !== 'which' )
								answer.points = 1;

							// update maxpoints
							if ( config.type === 'multi' && answer.correct )
								config.state.maxpoints += parseInt( answer.points, 10 );
							if ( ( config.type === 'single' || config.type === 'which' ) && answer.points > highest )
								highest = parseInt( answer.points, 10 );

							// make sure config matches updated
							question.answers[ a ] = answer;

						} );

						// add the highest scoring answer to maxpoints
						if ( ( config.type === 'single' || config.type === 'which' ) && highest )
							config.state.maxpoints += parseInt( highest, 10 );

						config.questions[ q ] = question;

					} );

					// its not a poll if it's possible to score any points
					if ( config.state.maxpoints > 0 )
						config.state.poll = false;

					// init state
					if ( config.questions ) {

						// create markup
						quiz.html( quiz.fumanchu( config.templates.scaffold, config ) );

						// store some placeholder vars for elements of the quiz
						questionwrap 	= quiz.find( '.quizzlestick-questions' );
						questions 		= quiz.find( '.quizzlestick-question' );
						progress 		= quiz.find( '.quizzlestick-progress' );
						timer 			= quiz.find( '.quizzlestick-timer' );
						result 			= quiz.find( '.quizzlestick-result-final' );
						start 			= quiz.find( '.quizzlestick-start-screen' );
						check			= quiz.find( '.quizzlestick-check' ).eq( 0 );
						next			= quiz.find( '.quizzlestick-next' ).eq( 0 );
						prev			= quiz.find( '.quizzlestick-prev' ).eq( 0 );
						finish			= quiz.find( '.quizzlestick-finish' ).eq( 0 );

						// add question & answer IDs incase we mix them up later eg. random sort
						var qi = 0, ai = 0;
						$.each( config.questions, function( id, q ) {
							questions.eq( qi ).attr( 'data-id', id ).data( 'id', id );
							$.each( q.answers, function( aid ) {
								questions.eq( qi ).find( '.quizzlestick-answer' ).eq( ai++ ).attr( 'data-id', aid ).data( 'id', aid );
							} );
							ai = 0;
							qi++;
						} );

						// hide results div
						result.hide();

						// hide the progress bar if only 1 question
						if ( questions.length < 2 )
							progress.remove();

						// if timed game hide questions & show start screen
						if ( parseInt( config.timelimit, 10 ) ) {
							questionwrap.hide().addClass( 'quizzlestick-hidden' );
						} else {
							timer.remove();
							start.remove();
						}

						// if single answer hide check answer
						if ( config.type !== 'multi' )
							quiz.find( '.quizzlestick-check' ).hide();

						// if a which are you game add a nextdelay if not set
						if ( config.type === 'which' )
							config.nextdelay = config.nextdelay || 500;

						// hide next buttons, shown when answered
						if ( config.mustanswer ) {
							quiz.find( '.quizzlestick-next' ).hide();
							quiz.find( '.quizzlestick-prev' ).hide();
							quiz.find( '.quizzlestick-finish' ).hide();
						}

						questions.eq( config.state.question ).addClass( 'quizzlestick-current' );
						questions.eq( config.state.question + 1 ).addClass( 'quizzlestick-question-next' );

					} else {

						// no questions!!

					}

					// trigger load event
					quiz.trigger( 'ready', [ config ] );

					return quiz;
				} );

			},

			complete: function() {
				$( this ).find( '.quizzlestick-next' ).eq(-1).click();
				return this;
			},

			// next question
			next: function() {
				$( this ).find( '.quizzlestick-question-current .quizzlestick-next' ).click();
				return this;
			},

			// prev question
			prev: function() {
				$( this ).find( '.quizzlestick-question-current .quizzlestick-prev' ).click();
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

		// game type, 'single', 'multi', 'which', 'poll' only at the moment
		type: 'single',

		// an optional ID for the quiz if you need to refer to it programmatically with an outside API
		id: '',

		// a title for the quiz for use in templates if desired eg. share template
		title: '',

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
		// available template tags:
		// 		{{points}}
		// 		{{maxpoints}}
		results: [
			// { points: 4, template: 'rubbish!', short: '' },				// 0-4 points
			// { points: 8, template: 'ok I guess', short: '' },			// 4-8 points
			// { points: 12, template: 'well done', short: '' },			// 8-12 points
			// { points: 16, template: 'get you, genius!', short: '' }		// 12-16 points
		],

		// events
		onstart		: $.noop,
		oncomplete	: $.noop,
		onselect	: $.noop,
		onanswer	: $.noop,
		oncorrect	: $.noop,
		onincorrect	: $.noop,
		ontimer		: $.noop,
		onnext		: $.noop,
		onprev		: $.noop,
		onsend		: $.noop,
		onready 	: $.noop,

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
			correct: [],		// array of correct answer ids
			template: false,
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
			template: false,
			total: 0,			// override this with total number of answers
			friends: []			// list of friend ids eg. facebook
		},

		// html output for quiz elements
		templates: {
			scaffold: '\
				<div class="quizzlestick-description">\
					{{templates.description}}\
				</div>\
				<div class="quizzlestick-progress">\
					{{templates.progress}}\
				</div>\
				<div class="quizzlestick-timer">\
					{{templates.timer}}\
				</div>\
				<div class="quizzlestick-start-screen">\
					{{templates.timerstart}}\
				</div>\
				<ol class="quizzlestick-questions">\
					{{templates.questions}}\
				</ol>\
				{{templates.toolbar}}\
				<div class="quizzlestick-result quizzlestick-result-final quizzlestick-hidden">\
					{{templates.result}}\
				</div>\
			',
			description: '\
				{{description}}\
			',
			progress: '\
				Question <span class="quizzlestick-current-num">{{helpers.currentquestion}}</span> \
				of <span class="quizzlestick-total">{{helpers.numquestions}}</span>\
			',
			timer: '\
				<span class="quizzlestick-timer-time">{{helpers.remainingtime}}</span>\
				<div class="quizzlestick-timer-progress">\
					<div class="quizzlestick-timer-progress-bar" style="width:{{helpers.timerwidth}}%;"></div>\
				</div>\
			',
			timerstart: '\
				<button class="quizzlestick-start" type="button">Start</button>\
			',
			result: '\
				<div class="quizzlestick-result-text">\
					{{helpers.getresult}}\
				</div>\
				{{templates.share}}\
			',
			questions: '\
				{{questions}}\
			',
			question: '\
				<li class="quizzlestick-question">\
					{{question}}\
					<ul class="quizzlestick-answers">\
						{{answers}}\
					</ul>\
					<div class="quizzlestick-result quizzlestick-result-question quizzlestick-hidden"></div>\
				</li>\
			',
			answer: '\
				<li class="quizzlestick-answer">\
					<a href="#">{{answer}}</a>\
				</li>\
			',
			pollresults: '\
				<div class="quizzlestick-poll-results">\
					{{answers}}\
				</div>\
			',
			pollresult: '\
				<div class="quizzlestick-poll-result">\
					{{answer}}\
					<div class="quizzlestick-poll-result-bar" style="width:{{helpers.answerwidth}}%;"><span>{{total}}</span></div>\
				</div>\
			',
			toolbar: '\
				<div class="quizzlestick-toolbar">\
					<a class="quizzlestick-check quizzlestick-hidden" href="#">Check answer</a>\
					<a class="quizzlestick-prev quizzlestick-hidden" href="#">Previous</a>\
					<a class="quizzlestick-next quizzlestick-hidden" href="#">Next</a>\
					<a class="quizzlestick-finish quizzlestick-hidden" href="#">Results</a>\
				</div>',
			correct: '\
				<div class="quizzlestick-response-correct">Correct!</div>\
			',
			incorrect: '\
				<div class="quizzlestick-response-incorrect">Wrong!</div>\
			',
			share: ''
		},

		// generic helpers that can return dynamic values to templates
		helpers: {

			// timer helpers
			time: function( context, config ) {
				var seconds = Math.floor( config.state.time / 1000 ),
					minutes = Math.floor( seconds / 60 ),
					hours   = Math.floor( minutes / 60 ),
					time = '';
				seconds -= minutes * 60;
				minutes -= hours * 60;
				if ( hours )
					time += ( hours < 10 ? '0' + hours : hours ) + ':';
				time += ( minutes < 10 ? '0' + minutes : minutes ) + ':';
				time += ( seconds < 10 ? '0' + seconds : seconds );
				return time;
			},
			timerwidth: function( context, config ) {
				var width = ( 100 / config.timelimit ) * config.state.time;
				if ( isNaN( width ) )
					width = 0;
				return width;
			},
			remainingtime: function( context, config ) {
				var seconds = Math.floor( (config.timelimit - config.state.time) / 1000 ),
					minutes = Math.floor( seconds / 60 ),
					hours   = Math.floor( minutes / 60 ),
					time = '';
				seconds -= minutes * 60;
				minutes -= hours * 60;
				if ( hours )
					time += ( hours < 10 ? '0' + hours : hours ) + ':';
				time += ( minutes < 10 ? '0' + minutes : minutes ) + ':';
				time += ( seconds < 10 ? '0' + seconds : seconds );
				return time;
			},

			// result helper
			getresult: function( context, config ) {

				// nothing if quiz isn't finished
				if ( ! $( this ).data( 'complete' ) )
					return '';

				// get from results object
				if ( $.type( config.results ) === 'array' ) {
					config.results.sort( function( a, b ) {
						return parseInt( a.points, 10 ) > parseInt( b.points, 10 );
					} );
					for ( var n in config.results ) {
						if ( config.state.points <= parseInt( config.results[ n ].points, 10 ) ) {
							return config.results[ n ];
						}
					}
				}

				// use result as string
				if ( $.type( config.results ) === 'string' ) {
					return config.results;
				}

				// default string
				return 'You scored <strong>{{state.points}}</string> out of <strong>{{state.maxpoints}}</strong>';
			},
			getresultimage: function( context, config ) {
				var result = $( this ).find( '.quizzlestick-result-final img' ),
					results = $( this ).find( '.quizzlestick-result img' );

				if ( result.length ) {
					return result.eq( -1 ).attr( 'src' );
				} else if ( results.length ) {
					return results.eq( -1 ).attr( 'src' );
				}

				return '';
			},

			// progress bar helpers
			numquestions: function( context, config ) {
				return config.helpers.getlength( config.questions );
			},
			currentquestion: function( context, config ) {
				return parseInt( config.state.question, 10 ) + 1;
			},
			numanswers: function( context, config ) {
				var length = 0;
				for( var i in config.state.answers )
					length++;
				return length;
			},
			progresswidth: function( context, config ) {
				var width = ( 100 / config.helpers.getlength( config.questions ) ) * config.helpers.getlength( config.state.answers );
				if ( isNaN( width ) )
					width = 0;
				return width;
			},

			// qustion/answer helpers
			totalanswers: function( question, config ) {
				return question.total;
			},
			answertotal: function( answer, config ) {
				return answer.total;
			},
			answerwidth: function( answer, config, args ) {
				var total = 0,
					width = 0;
				$.map( args.list, function( el, i ) { return total += parseInt( el.total, 10 ); } )
				width = ( 100 / total ) * parseInt( answer.total, 10 );
				if ( isNaN( width ) )
					width = 0;
				return width;
			},

			// utilities
			numberformat: function( num ) {
				return '' + num;
			},

			// get array or object length
			getlength: function( obj ) {
				var length = 0;
				if ( $.type( obj ) === 'object' ) {
					for ( var key in obj )
						if ( obj.hasOwnProperty( key ) ) length++;
				} else if ( obj.length ) {
					length = obj.length;
				}
				return length;
			}

		},

		// to be overridden eg. for playtomic or other plugins
		api: {
			send: function( obj, config ) {
				// replace with a function that can handle and post/fetch an object
				// obj contains:
				// 		action	: 'config', 'answer' or 'complete'
				// 		id		: config.id
				//
				// if obj.action is 'complete' or 'answer'
				// 		state 	: config.state
				//
				// if obj.action is 'answer'
				// 		correct : true/false
				// 		question: question ID (index in questions array)
			}
		}
	};

	$( document ).ready( function() {
		// run on elements with data attribute
		$( '[data-quizzlestick]' ).quizzlestick();
	} );

})(jQuery);


/*global jQuery */
/*!
* fumanchu.js 0.1
*
* Copyright 2014, Robert O'Rourke sanchothefat.com
*/
(function($){

	// slightly rubbish handlebars-esque templating thing
	$.fumanchu = function( template, context, fallback, args ) {

		var t = this;

		// set defaults
		$.fumanchu.context = context || {};
		$.fumanchu.fallback = fallback || context;
		$.fumanchu.args = args || {};

		// avoid breaking catastrophically
		if ( $.type( template ) === 'undefined' )
			return '';

		// if template is a function then run it
		if ( $.type( template ) === 'function' )
			template = template.apply( t, [ $.fumanchu.context, $.fumanchu.fallback, $.fumanchu.args ] );

		// if template is an object then look for a template & override context
		if ( $.type( template ) === 'object' ) {

			// regular object, check for template entry
			if ( template.template ) {
				$.fumanchu.context = template;
				template = template.template;

			// check if its a jquery selection & try to get content out
			} else {
				try {
					template = template.html();
				} catch(e) {
				}
			}
		}

		// replace any double bracketed strings or double underscored
		return template.toString().replace( /(?:__|{{)([a-z0-9\.]+)(?:}}|__)/gi, function( match, p1, offset, s ) {
			// get object property
			var val = $.fumanchu.getpath( p1, $.fumanchu.context, $.fumanchu.fallback ),
				out = '',
				tpl = $.fumanchu.templates[ p1 ] || $( '[data-template="' + p1 + '"]' ).html();

			// store template if found
			if ( ! $.fumanchu.templates[ p1 ] && tpl )
				$.fumanchu.templates[ p1 ] = tpl;

			// object type w. template
			if ( $.type( val ) === 'object' && val.template ) {
				out = t.fumanchu( val.template, val, $.fumanchu.fallback, args );
			// array|object type
			} else if ( $.type( val ) === 'array' || $.type( val ) === 'object' ) {
				$.each( val, function( i, item ) {
					if ( $.type( item ) === 'object' ) {
						if ( ! item.template && tpl )
							item.template = tpl;
						$.fumanchu.context = item;
					}
					out += t.fumanchu( item, $.fumanchu.context, $.fumanchu.fallback, { list: val, index: i } );
				} );
			// function type
			} else if ( $.type( val ) === 'function' ) {
				out = val.apply( t, [ $.fumanchu.context, $.fumanchu.fallback, args ] );
			// number
			} else if ( $.type( val ) === 'number' ) {
				out = $.fumanchu.numberformat( val, $.fumanchu.fallback );
			// boolean
			} else if ( $.type( val ) === 'boolean' ) {
				out = val ? '1' : '0';
			// string
			} else if ( $.type( val ) === 'string' ) {
				out = val;
			}

			return t.fumanchu( out, $.fumanchu.context, $.fumanchu.fallback, $.fumanchu.args );
		} );
	};

	// searches an object and returns any found path
	$.fumanchu.getpath = function getpath( path, object, fallback ) {
		path = path.split( '.' );
		if ( path.length == 4 && object && object[ path[0] ] && object[ path[0] ][ path[1] ] && object[ path[0] ][ path[1] ][ path[2] ] && $.type( object[ path[0] ][ path[1] ][ path[2] ][ path[3] ] ) !== 'undefined' )
			return object[ path[0] ][ path[1] ][ path[2] ][ path[3] ];
		if ( path.length == 3 && object && object[ path[0] ] && object[ path[0] ][ path[1] ] && $.type( object[ path[0] ][ path[1] ][ path[2] ] ) !== 'undefined' )
			return object[ path[0] ][ path[1] ][ path[2] ];
		if ( path.length == 2 && object && object[ path[0] ] && $.type( object[ path[0] ][ path[1] ] ) !== 'undefined' )
			return object[ path[0] ][ path[1] ];
		if ( path.length == 1 && object && $.type( object[ path[0] ] ) !== 'undefined' )
			return object[ path[0] ];
		// if we get here try again from the fallback object
		if ( fallback && object !== fallback ) {
			return $.fn.fumanchu.getpath( path.join( '.' ), fallback );
		}
		// empty string if nothing found
		return '';
	};

	// template cache
	$.fumanchu.templates = {};

	// number handling function
	$.fumanchu.numberformat = function( num, fallback ) {
		return '' + num;
	};

	// prime template cache
	$( document ).ready( function() {
		$( '[data-template]' ).each( function() {
			$.fumanchu.templates[ $( this ).data( 'template' ) ] = $( this ).html();
		} );
	} );

	// allow collection usage, to alter 'this' in callbacks
	$.fn.fumanchu = $.fumanchu;

})(jQuery);
