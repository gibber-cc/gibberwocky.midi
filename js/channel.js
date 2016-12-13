module.exports = function( Gibber ) {

const noteon  = 0x90,
      noteoff = 0x80,
      cc = 0x70
      
let Channel = {
  create( number ) {

    let channel = {    
      number,
		  sequences:{},
      sends:[],
      __velocity: 127,
      __duration: 1000,

      note( ...args ) {
        args[0] = Gibber.Theory.Note.convertToMIDI( args[0] )
        
        let msg = [ 0x90 + number, args[0], channel.__velocity ]
        Gibber.MIDI.send( msg, 0 )
        msg[0] = 0x80 + number
        Gibber.MIDI.send( msg, window.performance.now() + channel.__duration )
      },

      midinote( ...args ) {
        let msg = [ 0x90 + number, args[0], channel.__velocity ]
        Gibber.MIDI.send( msg, 0 )
        msg[0] = 0x80 + number
        Gibber.MIDI.send( msg, window.performance.now() + channel.__duration )
      },
      
      duration( value ) {
        channel.__duration = value
      },
      
      velocity( value ) {
        channel.__velocity = value 
      },

      cc( ccnum, value ) {
        let msg =  `${channel.id} cc ${ccnum} ${value}`
        Gibber.MIDI.send( msg )
      },

      mute( value ) {
        let msg =  `${channel.id} mute ${value}`
        Gibber.MIDI.send( msg )
      },

      solo( value ) {
        let msg =  `${channel.id} solo ${value}`
        Gibber.MIDI.send( msg )
      },

      chord( chord, velocity='', duration='' ) {
        let msg = []
        
        if( typeof chord  === 'string' ){
          chord = Gibber.Theory.Chord.create( chord ).notes
          chord.forEach( v => channel.midinote( v ) )
        }else{
          chord.forEach( v => channel.note( v ) )
        }
      },

      midichord( chord, velocity='', duration='' ) {
        let msg = []
        for( let i = 0; i < chord.length; i++ ) {
          msg.push( `${channel.id} note ${chord[i]} ${velocity} ${duration}`.trimRight() )
        }

        Gibber.MIDI.send( msg )
      },

      stop() {
        for( let key in this.sequences ) {
          for( let seq of this.sequences[ key ] ) {
            if( seq !== undefined ) {
              seq.stop()
            }
          }
        }
      },

      start() {
        for( let key in this.sequences ) {
          for( let seq of this.sequences[ key ] ) {
            if( seq !== undefined ) {
              seq.start()
            }
          }
        }
      },
      select() {
        Gibber.MIDI.send( `select_channel ${channel.id}` )
      }
    }

    Gibber.Environment.codeMarkup.prepareObject( channel ) 
    Gibber.addSequencingToMethod( channel, 'note' )
    Gibber.addSequencingToMethod( channel, 'cc' )
    Gibber.addSequencingToMethod( channel, 'chord' )
    Gibber.addSequencingToMethod( channel, 'velocity', 1 )
    Gibber.addSequencingToMethod( channel, 'duration', 1 )
    Gibber.addSequencingToMethod( channel, 'midinote' )

    return channel
  },
}

return Channel.create.bind( Channel )

}
