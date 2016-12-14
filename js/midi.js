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
    }
  
  },

  selectOutput( e ) {
    if( e.target.selectedIndex !== 0 ) { // does not equal 'none'
      const opt = e.target[ e.target.selectedIndex ]
      const output = opt.output
      output.open()
      MIDI.output = output
    }

  },

  send( msg, timestamp ) {
    MIDI.output.send( msg, timestamp )
  },

  handleMsg( msg ) {
    if( msg.data[0] !== 248 ) {
      //console.log( 'midi message:', msg.data[0], msg.data[1] )
    }
    if( msg.data[0] === 0xf2 ) {
      MIDI.timestamps.length = 0
      MIDI.clockCount = 0
      MIDI.lastClockTime = null
    } else if (msg.data[0] === 0xfa ) {
      MIDI.running = true
    } else if (msg.data[0] === 0xfc ) {
      MIDI.running = false
    } else if( msg.data[0] === 248 && MIDI.running === true  ) { // MIDI beat clock

      if( MIDI.timestamps.length > 0 ) {
        const diff = msg.timeStamp - MIDI.lastClockTime
        MIDI.timestamps.unshift( diff )
        while( MIDI.timestamps.length > 10 ) MIDI.timestamps.pop()

        const sum = MIDI.timestamps.reduce( (a,b) => a+b )
        const avg = sum / MIDI.timestamps.length

        let bpm = (1000 / (avg * 24)) * 60
        Gibber.Scheduler.bpm = bpm
 
        if( MIDI.clockCount++ === 23 ) {
          Gibber.Scheduler.advanceBeat()
          MIDI.clockCount = 0
        }
        
      }else{
        if( MIDI.lastClockTime !== null ) {
          const diff = msg.timeStamp - MIDI.lastClockTime
          MIDI.timestamps.unshift( diff )
          MIDI.lastClockTime = msg.timeStamp
        }else{
          MIDI.lastClockTime = msg.timeStamp
        }
        MIDI.clockCount++
      }    
    }

  },
  
  clear() { 
    // This should only happen on a MIDI Stop message
    // this.timestamps.length = 0
    // this.clockCount = 0
    // this.lastClockTime = null
  },
  running: false,
  timestamps:[],
  clockCount: 0,
  lastClockTime:null

}

module.exports = MIDI
