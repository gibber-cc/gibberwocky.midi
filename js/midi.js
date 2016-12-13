let Gibber = null

const MIDI = {
  channels: [],

  init( _Gibber ) {
    Gibber = _Gibber

    const midiPromise = navigator.requestMIDIAccess()
      .then( MIDI.onMIDIAccess, ()=> console.log('access failure') )

    this.midiInputList = document.querySelector( '#midiInputSelect' )
    this.midiOutputList = document.querySelector( '#midiOutputSelect' )

    this.createChannels()
  },

  createChannels() {
    for( let i = 0; i < 16; i++ ) {
      this.channels.push( Gibber.Channel( i ) )
    }
  },

  onMIDIAccess( midiAccess ) {
    MIDI.midiAccess = midiAccess
    
    let opt = document.createElement( 'option' )
    opt.text = 'none'
    MIDI.midiInputList.add( opt )
    MIDI.midiOutputList.add( opt )

    MIDI.midiInputList.onchange = MIDI.selectInput
    MIDI.midiOutputList.onchange = MIDI.selectOutput
    
    const inputs = midiAccess.inputs
    for( let input of inputs.values() ) {
      let opt = document.createElement('option')
      opt.text = input.name
      opt.input = input
      MIDI.midiInputList.add(opt)
    }

    const outputs = midiAccess.outputs
    for( let output of outputs.values() ) {
      let opt = document.createElement('option')
      opt.output = output
      opt.text = output.name
      MIDI.midiOutputList.add(opt)
    }

  },

  selectInput( e ) {
        
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

}

module.exports = MIDI
