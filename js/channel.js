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

      note( num, offset=null ) {
        const notenum = Gibber.Theory.Note.convertToMIDI( num )
        
        let msg = [ 0x90 + channel.number, notenum, channel.__velocity ]
        const baseTime = offset !== null ? window.performance.now() + offset : window.performance.now()

        console.log( offset, baseTime, channel.__duration )
        Gibber.MIDI.send( msg, baseTime )
        msg[0] = 0x80 + channel.number
        Gibber.MIDI.send( msg, baseTime + channel.__duration )
      },

      midinote( num, offset=null ) {
        let msg = [ 0x90 + channel.number, num, channel.__velocity ]
        const baseTime = offset !== null ? window.performance.now() + offset : 0

        Gibber.MIDI.send( msg, baseTime )
        msg[0] = 0x80 + channel.number
        Gibber.MIDI.send( msg, baseTime + channel.__duration )
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
