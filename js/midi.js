let Gibber = null

const MIDI = {
  channels: [],

  init( _Gibber ) {
    Gibber = _Gibber

    const midiPromise = navigator.requestMIDIAccess()
      .then( midiAccess => {
        MIDI.midiAccess = MIDI.onMIDIAccess
        MIDI.createInputAndOutputLists( midiAccess )
      }, ()=> console.log('access failure') )

    this.midiInputList = document.querySelector( '#midiInputSelect' )
    this.midiOutputList = document.querySelector( '#midiOutputSelect' )

    this.createChannels()
  },

  createChannels() {
    for( let i = 0; i < 16; i++ ) {
      this.channels.push( Gibber.Channel( i ) )
    }
  },

  createInputAndOutputLists( midiAccess ) {
    let optin = document.createElement( 'option' )
    optin.text = 'none'
    let optout = document.createElement( 'option' )
    optout.text = 'none'
    MIDI.midiInputList.add( optin )
    MIDI.midiOutputList.add( optout )

    MIDI.midiInputList.onchange = MIDI.selectInput
    MIDI.midiOutputList.onchange = MIDI.selectOutput
    
    const inputs = midiAccess.inputs
    for( let input of inputs.values() ) {
      const opt = document.createElement( 'option' )
      opt.text = input.name
      opt.input = input
      MIDI.midiInputList.add( opt )
    }

    const outputs = midiAccess.outputs
    for( let output of outputs.values() ) {
      const opt = document.createElement('option')
      opt.output = output
      opt.text = output.name
      MIDI.midiOutputList.add(opt)
    }

  },

  selectInput( e ) {
    if( e.target.selectedIndex !== 0 ) { // does not equal 'none'
      const opt = e.target[ e.target.selectedIndex ]
      const input = opt.input
      input.onmidimessage = MIDI.handleMsg
      input.open()
      MIDI.input = input
      console.log( 'input:', input )   
    }
  
  },

  selectOutput( e ) {
    console.log( e )
    
    if( e.target.selectedIndex !== 0 ) { // does not equal 'none'
      const opt = e.target[ e.target.selectedIndex ]
      const output = opt.output
      output.open()
      MIDI.output = output
      console.log( 'OUTPUT', output )   
    }

  },

  send( msg, timestamp ) {
    MIDI.output.send( msg, timestamp )
  },

  handleMsg( msg ) {
    // msg.data, msg.timestamp
    //console.log( 'midi message:', msg )

    if( msg.data[0] === 248 ) { // MIDI beat clock
      if( MIDI.lastClockTime !== null ) {
        const clockTimeDiff = msg.timeStamp - MIDI.lastClockTime
        MIDI.lastClockTime = msg.timeStamp
        
        let bpm = (1000 / (clockTimeDiff * 24)) * 60
        Gibber.Scheduler.bpm = bpm
        //console.log( 'BPM:', bpm, clockTimeDiff, msg.timeStamp, MIDI.lastClockTime )
        if( MIDI.clockCount++ === 24 ) {
          Gibber.Scheduler.advanceBeat()
          MIDI.clockCount = 0
        }
        
      }else{
        MIDI.lastClockTime = msg.timeStamp
      }
    }

  },
  
  clockCount: 0,
  lastClockTime:null

}

module.exports = MIDI
