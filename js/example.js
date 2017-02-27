const Examples = {
  'tutorial 1: basic messaging':`/*
 * gibberwocky.midi - tutorial #1: basic messaging
 *
 * This first intro will explain how to execute code, and send basic
 * MIDI noteon / noteoff and CC messages. 
 * 
 * First: choose a MIDI output in the MIDI tab that appears in the sidebar
 * to the right. This will be the destination MIDI port for all messages
 * that gibberwocky outputs. For this intro, it's a good idea to have
 * a simple melodic instrument setup to receive gibberwocky's MIDI output.
 */

// MIDI messages are all sent via a channel object in gibberwocky. A global
// array storing access the these is found in the 'channels' variable.

// Send a MIDI NoteOn message with a value of 60 to channel 0 (all MIDI messages are
// zero-indexed in gibberwocky).  Place your cursor
// on any line of code in the editor and hit Ctrl+Enter to execute it: 

channels[0].midinote( 60 )

// Each channel has a velocity and a duration method.

// define a value to be sent as the third byte of all NoteOn messages from channels[0]

channels[0].velocity( 32 )
channels[0].midinote( 60 )

channels[0].velocity( 127 )
cahnnels[0].midinote( 60 )

// define how long gibberwocky waits before sending a NoteOff message after each note
// is generated. Measured in milliseconds

channels[0].duration( 2000 )
channels[0].midinote( 60 )

channels[0].duration( 50 )
channels[0].midinote( 60 )

// We can also call midichord and pass an array of notes:
channels[0].midichord( [48,55,60] )

// And we can send CC messages as follows (also zero-indexed):

channels[0].cc0( 64 ) // send value 64 on CC 0.
channels[0].cc1( 32 ) // send value 32 on CC 1.

// Modulation graphs can output continuous streams of CC messages.
// As a quick example, here's a LFO running at .5 Hz outputting to CC 0:

channels[0].cc0( lfo( .5 ) )

// Try running the above line of code with different Hz values. 
// To cancel the LFO we can assign a new value to cc0 to replace it:

channels[0].cc0( 64 )

// OK, that's some basics out of the way. Try the sequencing tutorial next!`
  ,

  'tutorial 2: basic sequencing': `/* gibberwocky.midi - tutorial #2: basic sequencing
 *
 * This tutorial will provide an introdution to sequencing midinote and
 * cc messages, and a brief overview of rhythm in gibberwocky.
 *
 * Make sure you have a MIDI output selected in the MIDI tab of the sidebar. You will
 * also need to choose a clock source. gibberwocky can generate its own 
 * clock (internal) or you can use incoming MIDI clock messages (external).
 * If you want to accept MIDI Clock sync, make sure you also select a MIDI 
 * input port to receive it on.  These MIDI settings will be remembered from 
 * one gibberwocky.midi session to the next.
 *
 * If you decide to use external clock sync, stop your sync source, rewind your transport, 
 * and restart playback to establish the sync with a timeline.
 * After this initial stopping / starting you should be able to start and
 * stop the transport at will in your DAW and maintain sync in gibberwocky.midi

 */

// In tutorial #1, we saw how we could send MIDI messages to specific MIDI
// channel objects. We can easily sequence any of these methods by adding
// a call to .seq(). For example:

// send noteon message with a first value of 60
channels[0].midinote( 60 )

// send same value every quarter note
channels[0].midinote.seq( 60, 1/4 )

// You can stop all sequences in gibberwocky with the Ctrl+. keyboard shortcut
// (Ctrl + period). You can also stop all sequences on a specific channel:

channels[0].stop()

// Most sequences in gibberwocky contain values (60) and timings (1/4). To
// sequence multiple values we simply pass an array:

channels[0].midinote.seq( [60,72,48], 1/4 )

// ... and we can do the same thing with multiple timings:

channels[0].midinote.seq( [60,72,48], [1/4,1/8] )

// We can also sequence our note velocities and durations.
channels[0].midinote.seq( 60, 1/2 )
channels[0].velocity.seq( [16, 64, 127], 1/2 )
channels[0].duration.seq( [10, 100,500], 1/2 )

// the same idea works for CC messages:
channels[0].cc0( 64 )
channels[0].cc0.seq( [0, 64, 127], 1/8 )

// If you experimented with running multiple variations of the midinote 
// sequences you might have noticed that only one runs at a time. For example,
// if you run these two lines:

channels[0].midinote.seq( 72, 1/4 )
channels[0].midinote.seq( 48, 1/4 )

// ...you'll notice only the second one actually triggers. By default, gibberwocky
// will replace an existing sequence with a new one running on the same channel. If
// you want to run multiple sequences of notes, you can place them on different channels:

channels[0].midinote.seq( 72, 1/4 )
channels[1].midinote.seq( 48, 1/4 )

// Alternatively, you can pass an ID number as a third argument to calls to .seq() 
// In the examples of sequencing we've seen so far, no ID has been given, which means
// gibberwocky is assuming a default ID of 0 for each sequence. When you launch a sequence
// on a channel that has the same ID as another running sequence, the older sequence is stopped.
// If the sequences have different IDs they run concurrently. Note this makes it really
// easy to create polyrhythms.

channels[0].midinote.seq( 48, 1 ) // assumes ID of 0
channels[0].midinote.seq( 60, 1/2, 1 ) 
channels[0].midinote.seq( 72, 1/3, 2 ) 
channels[0].midinote.seq( 84, 1/7, 3 ) 

// We can also sequence calls to midichord. You might remember from the first tutorial
// that we pass midichord an array of values, where each value represents one note. This
// means we need to pass an array of arrays in order to move between different chords.

channels[0].midichord.seq( [[60,64,68], [62,66,72]], 1/2 )

// Even we're only sequencing a single chord, we still need to pass a 2D array. Of course,
// specifying arrays of MIDI values is not necessarily an optimal representation for chords.
// Move on to tutorial #3 to learn more about how to leverage music theory in gibberwocky.
`,

  'tutorial 3: harmony':`
/* gibberwocky.midi - tutorial #3: Harmony
 *
 * This tutorial covers the basics of using harmony in gibberwocky.midi. It assumes you
 * know the basics of sequencing (tutorial #2) and have an appropriate MIDI output setup.
 *
 * In the previous tutorials we looked at using raw MIDI values to send messages. However,
 * using MIDI note numbers is not an ideal representation. gibberwocky includes knoweldge of
 * scales, chords, and note names to make musical sequencing easier and more flexible. In this
 * tutorial, instead of using channel.midinote() and channel.midichord() we'll be using 
 * channel.note() and channel.chord(). These methods use gibberwocky's theory objects to
 * determine what MIDI notes are eventually outputted.
 */

// In our previous tutorial, we sent out C in the fourth octave by using MIDI number 60:
channels[0].midinote( 60 )

// We can also specify notes with calls to the note() method by passing a name and octave.
channels[0].note( 'c4' )
channels[0].note( 'fb3' )

channels[0].note.seq( ['c4','e4','g4'], 1/8 )

// remember, Ctrl+. stops all running sequences.

// In gibberwocky, the default scale employed is C minor, starting in the fourth octave. 
// This means that if we pass 0 as a value to note(), C4 will also be played.
channels[0].note( 0 )

// sequence C minor scale, starting in the fourth octave:
channels[0].note.seq( [0,1,2,3,4,5,6,7], 1/8 )

// negative scale indices also work:
channels[0].note.seq( [-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7], 1/8 )

// there is a global Scale object we can use to change the root and mode
// for all scales. Run the lines below individually  with the previous note sequence running.
Scale.root( 'd4' )
Scale.mode( 'lydian' )

Scale.root( 'g2' )
Scale.mode( 'phrygian' )

// We can also sequence changes to the root / mode:
Scale.root.seq( ['c2','d2','f2,'g2'], 2 )
Scale.mode.seq( ['lydian', 'ionian', 'locrian'], 2 )

// We can also define our own scales using chromatic scale indices. Unfortunately, 
// microtuning with MIDI is very diffcult, so only the standard eleven notes of 
// Western harmony are supported. Scales can have arbtrary numbers of notes.
Scale.modes[ 'my mode' ] = [ 0,1,2,3,5,6,10 ]
Scale.mode( 'my mode' )

Scale.modes[ 'another mode' ] = [0,1]
Scale.mode( 'another mode' )

Scale.mode.seq( ['my mode', 'another mode'], 4 )

/******** chords **********/
// Last but not least there are a few different ways to specify chords in gibberwocky.
// First, we can use note names:

channels[0].chord( ['c4','eb4','gb4','a4'] )

// Or we can use scale indices:
channels[0].chord( [0,2,4,5] )

channels[0].chord.seq( [[0,2,4,5], [1,3,4,6]], 1 )

// We can also use strings that identify common chord names.
channels[0].chord( 'c4maj7' )
channels[0].chord( 'c#4sus7b9' )

channels[0].chord.seq( ['c4dim7', 'bb3maj7', 'fb3aug7'], 2 )

// OK, that's harmony in a nutshell. Next learn a bit about patterns and
// pattern manipulation in gibberwocky in tutorial #4.
 `,
 
  default : `/* 
 * BEFORE DOING ANYTHING, MAKE SURE YOU CHOOSE
 * A MIDI OUTPUT IN THE MIDI TAB. If you want to accept MIDI Clock sync,
 * make sure you also select a MIDI input port.  These MIDI settings will be remembered
 * from one gibberwocky.midi session to the next.
 *
 * If you're using external clock sync, stop your sync source, rewind your transport, 
 * and restart playback to establish the sync. 
 * After this initial stopping / starting you should be able to start and
 * stop the transport at will in your DAW and maintain sync in gibberwocky.midi
 *
 * Last but not least, setup some MIDI channel to control to some type of
 * melodic instrument (at least for this tutorial). This might mean plugging
 * your MIDI interface into a hardware synth, or instantiating a soft-synth
 * in your DAW.
 *
 * And now we're ready to start :)
 */

// To run any line of code below, place your cursor on the line and hit Ctrl+Enter.
// Change the MIDI channel number as needed.

// play a note identified by name
channels[0].note( 'c4' ) // ... or d4, fb2, e#5 etc.

// play a note identified by number. The number represents a
// position in gibberwocky's master scale object. By default the master
// scale is set to a root of C4 and the aeolian mode. Notes can have
// negative indices.
channels[0].note( 0 )

// Change master scale root
Scale.master.root( 'e4' )
channels[0].note( 0 )

// You can also send raw midi note messages without using
// gibberwocky.midi's internal scale with calls to midinote instead
// of note.
channels[0].midinote( 64 )

// You can change velocity...
channels[0].velocity( 20 )
channels[0].midinote( 64 )

channels[0].velocity( 100 )
channels[0].midinote( 64 )

// ... and you can set duration in milliseconds
channels[0].duration( 2000 )
channels[0].midinote( 64 )
channels[0].duration( 50 )
channels[0].midinote( 64 )

// sequence calls to the note method every 1/16 note. An optional
// third argument assigns an id# to the sequencer; by
// default this id is set to 0 if no argument is passed.
// Assigning sequences to different id numbers allows them
// to run in parallel.
channels[0].note.seq( [0,1,2,3,4,5,6,7], 1/8 )

// sequence velocity to use random values between 10-127 (midi range)
channels[0].velocity.seq( Rndi( 10,127), 1/16 )

// sequence duration of notes in milliseconds
channels[0].duration.seq( [ 50, 250, 500 ].rnd(), 1/16 )

// sequence the master scale to change root every measure
Scale.root.seq( ['c4','d4','f4','g4'], 1 )

// sequence the master scale to change mode every measure
Scale.mode.seq( ['aeolian','lydian', 'wholeHalf'], 1 )

// stop the sequence with id# 0 from running
channels[0].note[ 0 ].stop()

// stop scale sequencing
Scale.mode[ 0 ].stop()
Scale.root[ 0 ].stop()

// set scale mode
Scale.mode( 'Lydian' )
Scale.root( 'c3' )

// Create an arpegctor by passing notes of a chord, 
// number of octaves to play, and style. Possible styles 
// include 'up', 'down', and 'updown'

a = Arp( [0,2,3,5], 4, 'updown' )

// create sequencer using arpeggiator and 1/16 notes
channels[0].note.seq( a, 1/16 )

// transpose the notes in our arpeggio by one scale degree
a.transpose( 1 )

// sequence transposition of one scale degree every measure
a.transpose.seq( 1,1 )

// reset the arpeggiator every 8 measures 
// (removes transposition)
a.reset.seq( 1, 8 )

// stop sequence
channels[0].note[ 0 ].stop()

// creates sequencer at this.note[1] (0 is default)
channels[0].note.seq( [0,1,2,3], [1/4,1/8], 1 )

// parallel sequence at this.note[2] with 
// random note selection  (2 is last arg)
channels[0].note.seq( [5,6,7,8].rnd(), 1/4, 2 )

// Every sequence contains two Pattern functions. 
// The first, 'values',determines the output of the 
// sequencer. The second, 'timings', determines when the 
// sequencer fires.

// sequence transposition of this.note[2]
channels[0].note[ 2 ].values.transpose.seq( [1,2,3,-6], 1 )

// stop note[1] sequence
channels[0].note[ 1 ].stop()

// restart note[1] sequence
channels[0].note[ 1 ].start()

// stop everything running on the channel
channels[0].stop()`,


['modulating with genish.js'] : `/* gen~ is an extension for Max for Live for synthesizing audio/video signals.
In gibberwocky.midi, we can use a JavaScript port of gen~, genish.js to create complex modulation graphs outputting
CC messages. LFOs, ramps, stochastic signals... genish can create a wide variety of modulation sources for
exploration.

As we saw in the paramter sequencing tutorial (look at that now if you haven't yet, or you'll be a
bit lost here), most ugens from genish.js are available for scripting in gibberwocky.
Perhaps the most basic modulation is a simple ramp. In your target application / MIDI hardware device setup
a synthesis parameter to be controlled by CC0. To send a repeating ramp to signal to CC0 on channel 0 we
would use:*/

channels[0].cc0( phasor( 1 ) )

/* This ramp repeats regularly at 1 Hz. All graphs in genish.js typically output to a range of {-1,1} (or sometimes {0,1}),
however, for MIDI we want to ensure that we have an output signal in the range of {0,127}. Thus, by default, the {-1,1}
signal will automatically be transformed to {0,127}. You can turn this off by passing a value of false as the second
paramter to the CC function. The example below is designed to automatically travel between 32 and 96, so we pass false
to ensure that no additional transformation is applied: */

channels[0].cc0( 
  add( 
    32, 
    mul(  
      64, 
      phasor( 1, 0, { min:0 } ) 
    ) 
  ), 
  false 
)

/* Another common ugen used for modulation is the sine oscillator; in
gen~ this is the cycle() ugen. The cycle() accepts one parameter, the frequency that it operates at.
So we can do the following:*/

channels[0].cc0( cycle( .5 ) )

/* Often times we want to specify a center point (bias) for our sine oscillator, in addition to 
a specific amplitude and frequency. The lfo() function provides a simpler syntax for doing this:*/

// frequency, amplitude, bias
channels[0].cc0( lfo( 2, .2, .7 ) )

// We can also easily sequence parameters of our LFO XXX CURRENTLY BROKEN:

mylfo.frequency.seq( [ .5,1,2,4 ], 2 )

/* ... as well as sequence any other parameter in Live controlled by a genish.js graph. Although the lfo()
ugen provides named properties for controlling frequency, amplitude, and centroid, there is a more
generic way to sequence any aspect of a gen~ ugen by using the index operator ( [] ). For example,
cycle() contains a single inlet that controls its frequency, to sequence it we would use: */

mycycle = cycle( .25 )

mycycle[ 0 ].seq( [ .25, 1, 2 ], 1 )

channels[0].cc0( add( .5, div( mycycle, 2 ) ) )

/*For other ugens that have more than one argument (see the genish.js random tutorial for an example) we
simply indicate the appropriate index... for example, mysah[ 1 ] etc. For documentation on the types of
ugens that are available, see the genish.js website: http://charlie-roberts.com/genish/docs/index.html */`,

[ 'using the Score() object' ]  : `// Scores are lists of functions with associated
// relative time values. In the score below, the first function has
// a time value of 0, which means it begins playing immediately. The
// second has a value of 1, which means it beings playing one measure
// after the previously executed function. The other funcions have
// timestamps of two, which means they begins playing two measures after
// the previously executed function. Scores have start(), stop(),
// loop(), pause() and rewind() methods.

s = Score([
  0, ()=> channels[0].note.seq( -14, 1/4 ),
 
  1, ()=> channels[1].note.seq( [0], Euclid(5,8) ),
 
  2, ()=> {
    arp = Arp( [0,1,3,5], 3, 'updown2' )
    channels[ 2 ].velocity( 8 )
    channels[ 2 ].note.seq( arp, 1/32 )
  },
 
  2, ()=> arp.transpose( 1 ),
 
  2, ()=> arp.shuffle()
])

// Scores can also be stopped automatically to await manual retriggering.

s2 = Score([
  0, ()=> channels[ 0 ].note( 0 ),
  1/2, ()=> channels[ 0 ].note( 1 ),
  Score.wait, null,
  0, ()=> channels[0].note( 2 )
])

// restart playback
s2.next()

// CURRENTLY BROKEN
/* The loop() method tells a score to... loop. An optional argument specifies
 * an amount of time to wait between the end of one loop and the start of the next.*/

s3 = Score([
  0, ()=> channels[ 0 ].note.seq( 0, 1/4 ),
  1, ()=> channels[ 0 ].note.seq( [0,7], 1/8 ),
  1, ()=> channels[ 0 ].note.seq( [0, 7, 14], 1/12 )
])

s3.loop( 1 )
`,

['using the Steps() object (step-sequencer)'] : `/* Steps() creates a group of sequencer objects. Each
 * sequencer is responsible for playing a single note,
 * where the velocity of each note is determined by
 * a hexadecimal value (0-f), where f is the loudest note.
 * A value of '.' means that no MIDI note message is sent
 * with for that particular pattern element.
 *
 * The lengths of the patterns found in a Steps object can
 * differ. By default, the amount of time for each step in
 * a pattern equals 1 divided by the number of steps in the
 * pattern. In the example below, most patterns have sixteen
 * steps, so each step represents a sixteenth note. However,
 * the first two patterns (60 and 62) only have four steps, so
 * each is a quarter note. 
 *
 * The individual patterns can be accessed using the note
 * numbers they are assigned to. So, given an instance with
 * the name 'a' (as below), the pattern for note 60 can be
 * accessed at a[60]. Note that you have to access with brackets
 * as a.60 is not valid JavaScript.
 *
 * The second argument to Steps is the channel to target.  
 */ 

steps = Steps({
  [60]: 'ffff',
  [62]: '.a.a',
  [64]: '........7.9.c..d',
  [65]: '..6..78..b......',
  [67]: '..c.f....f..f..3',  
  [71]: '.e.a.a...e.a.e.a',  
  [72]: '..............e.',
}, channels[0] )

// rotate one pattern (assigned to midinote 71)
// in step sequencer  every measure
steps[71].rotate.seq( 1,1 )

// reverse all steps each measure
stpes.reverse.seq( 1, 2 )`,

}

module.exports = Examples//stepsExample2//simpleExample//genExample//exampleScore4//exampleScore4 //'this.note.seq( [0,1], Euclid(5,8) );' //exampleCode
