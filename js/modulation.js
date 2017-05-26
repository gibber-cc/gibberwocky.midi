const genish = require( 'genish.js' )

module.exports = function( Gibber ) {

let Gen  = {
  sr: 60,
  __solo: null,

  init() {
    Gen.genish.gen.samplerate = Gen.sr

    const update = ()=> {
      Gibber.Environment.animationScheduler.add( update, 1000/Gen.genish.gen.samplerate )
      Gen.runWidgets()
    }

    //Gibber.Environment.animationScheduler.add( update )

    //Gibber.Environment.codeMarkup.updateWidget( 1, Gibber.Environment.codeMarkup.genWidgets[1].gen() )

    Gen.wrapGenish()

  },

  wrapGenish() {
    const doNotInclude = [ 'export', 'gen', 'utilities', 'history' ]
    for( let ugenName in Gen.genish ) {
      if( doNotInclude.includes( ugenName ) ) continue
      
      Gen.wrappedGenish[ ugenName ] = Gen.create.bind( Gen, ugenName ) 
    }
    //for( let ugenName in Gen.genish ) {
    //  if( doNotInclude.includes( ugenName ) ) continue
      
    //  Gen.wrappedGenish[ ugenName ] = Gen.create.bind( Gen, ugenName ) 
    //}
  },

  solo( channel=0, ccnum=0 ) {
    if( Gen.__solo === null ) {
      Gen.__solo = { channel, ccnum }
    }else{
      Gen.__solo = null
    }
  },

  runWidgets: function () {
    for( let id in Gibber.Environment.codeMarkup.genWidgets ) {
      if( id === 'dirty' ) continue

      const widget = Gibber.Environment.codeMarkup.genWidgets[ id ]
      const value = widget.gen() 

      Gibber.Environment.codeMarkup.updateWidget( id, value )
      
      if( Gen.__solo === null || ( Gen.__solo.channel === widget.gen.channel && Gen.__solo.ccnum === widget.gen.ccnum) ) {
        Gibber.MIDI.send([ 0xb0 + widget.gen.channel, widget.gen.ccnum, value ]) 
      }
    }
  },

  genish,
  wrappedGenish: {},

  names:[],
  connected: [],

  // if property is !== ugen (it's a number) a Param must be made using a default
  create( name, ...inputArgs  ) {
    console.log( inputArgs, name )

    const parameters = []

    const spec = Gen.spec[ name ]
    
    let i;
    for( i = 0; i < spec.length; i++ ) {
      let arg = inputArgs[ i ]

      if( typeof arg === undefined ) {
        arg = spec[ i ]  
      }

      switch( typeof arg ) {
        // wrap all number arguments in param ugens for sequencing
        case 'number':
          parameters.push( Gen.genish.param( arg ) )
          break;
        
        // do not wrap ugens passed as parameters
        case 'object':
          parameters.push( arg )
          break;
      }
    }

    // if properties dictionary is also passed to ugen constructor...
    if( i <= inputArgs.length - 1 ) { parameters.push( inputArgs[ i ] ) }

    const ugen = Gen.genish[ name ]( ...parameters )

    for( let j = 0; j < parameters.length; j++ ) {
      const input = parameters[ j ]

      if( input.basename === 'param' ) {
        ugen[ j ] = v => {
          if( v === undefined ) {
            return input.value
          }else{
            input.value = v
          }
        }

        Gibber.addSequencingToMethod( ugen, j )
      }
    }

    return ugen
    /*
    let obj = Object.create( this ),
        count = 0,
        params = Array.prototype.slice.call( arguments, 1 )
    
    obj.name = name
    obj.active = false
    
    for( let key of Gen.functions[ name ].properties ) { 

      let value = params[ count++ ]
      obj[ key ] = ( v ) => {
        if( v === undefined ) {
          return value
        }else{
          value = v
          if( obj.active ) {
            //onsole.log( `${obj.track} genp ${obj.paramID} ${obj[ key ].uid} ${v}` )
            Gibber.Communication.send( `genp ${obj.paramID} ${obj[ key ].uid} ${v}` ) 
          }
        }
      }
      obj[ key ].uid = Gen.getUID()

      Gibber.addSequencingToMethod( obj, key )
    }

    return obj*/
  },
  

  assignTrackAndParamID: function( graph, channel, ccnum ) {
    graph.ccnum = ccnum
    graph.channel = channel

    let count = 0, param
    while( param = graph[ count++ ] ) {
      if( typeof param() === 'object' ) {
        Gen.assignTrackAndParamID( param(), channel, ccnum )
      }
    }
  },

  clear() {
    Gen.connected.length = 0
  },

  _count: 0,

  getUID() {
    return 'p' + Gen._count++
  },

  time: 'time',

  composites: { 
    lfo( frequency = .1, amp = 1, center = 0 ) {
      let _cycle = cycle( frequency ),
          _mul   = mul( _cycle, amp ),
          _add   = add( center, _mul ) 
       
      _add.frequency = (v) => {
        if( v === undefined ) {
          return _cycle[ 0 ]()
        }else{
          _cycle[0]( v )
        }
      }

      _add.amp = (v) => {
        if( v === undefined ) {
          return _mul[ 1 ]()
        }else{
          _mul[1]( v )
        }
      }

      _add.center = (v) => {
        if( v === undefined ) {
          return _add[ 0 ]()
        }else{
          _add[0]( v )
        }
      }

      Gibber.addSequencingToMethod( _add, 'frequency' )
      Gibber.addSequencingToMethod( _add, 'amp' )
      Gibber.addSequencingToMethod( _add, 'center' )

      _add.isGen = true

      return _add
    },

    fade( time = 1, from = 1, to = 0 ) {
      let fade, amt, beatsInSeconds = time * ( 60 / Gibber.Scheduler.bpm )
     
      if( from > to ) {
        amt = from - to

        fade = gtp( sub( from, accum( div( amt, mul(beatsInSeconds, Gen.samplerate ) ), 0 ) ), to )
      }else{
        amt = to - from
        fade = add( from, ltp( accum( div( amt, mul( beatsInSeconds, Gen.samplerate ) ), 0 ), to ) )
      }
      
      // XXX should this be available in ms? msToBeats()?
      let numbeats = time / 4
      fade.shouldKill = {
        after: numbeats, 
        final: to
      }
      
      fade.isGen = true
      return fade
    },
    
    beats( num ) {
      const r = rate( 'in1', num )
      r.isGen = true
      
      /*window.btof = function( b ) {
        Gibber.Audio.context.sampleRate / (b *(60/Clock.bpm) * Gibber.Audio.context.sampleRate)
      }*/

      const frequency = Gibber.Utility.beatsToFrequency( num )
      
      const ugen = Gen.wrappedGenish[ 'phasor' ]( frequency, 0, { min:0, max:1 } )
      const storedAssignmentFunction = ugen[0]

      ugen[0] = v => {
        if( v === undefined ) {
          return storedAssignmentFunction()
        }else{
          const freq = Gibber.Utility.beatsToFrequency( v )
          storedAssignmentFunction( freq )
        }
      }
      
      Gibber.addSequencingToMethod( ugen, '0' )

      return ugen
      // beat( n ) => rate(in1, n)
      // final string should be rate( in1, num )
    }
  },

  export( obj ) {
    //genish.export( obj )
    Object.assign( obj, this.wrappedGenish )
    Object.assign( obj, this.composites )
  },

  spec : {
    accum:[ 0, 0 ],
    abs:[ 0 ],
    add:[ 0,0 ],
    and:[0,0],
    atan:[0,0],
    asin:[ 0 ],
    acos:[ 0 ],
    ad: [ 44100, 44100 ],
    adsr:[ 44, 22050, 44100, .6, 44100 ], 
    bang:[0],
    bool:[0],
    ceil:[0],
    clamp:[0,-1,1],
    counter:[1,0,Infinity,0,1],
    cos:[ 0 ],
    cycle:[ 1, 0 ],
    data:[],
    dcblock:[0],
    decay:[44100],
    delay:[0,256],
    delta:[0],
    div: [0,0],
    eq: [0,0],
    floor: [0],
    fold: [0,0,1],
    gate:[0,0],
    gt:[0,0],
    gte:[0,0],
    gtp:[0,0],
    lt:[0,0],
    lte:[0,0],
    ltp:[0,0],
    lfo: [0,0,0],
    max: [0,0],
    min: [0,0],
    mod: [0,0],
    mstosamps: [0],
    mtof: [0],
    mul: [0,0],
    neq: [0,0],
    noise:[],
    not:[0],
    pan:[0,0,.5],
    peek:[0,0],
    phasor:[1,0],
    poke:[],
    pow:[0,1],
    rate:[0,1],
    round:[0],
    sah:[0,0,0],
    sign:[0],
    selector:[],
    sin:[ 0 ],
    slide:[0,1,1],
    sub:[0,0],
    ternary:[0,1,0],
    t60:[0],
    tan:[0],
    tanh:[0],
    train:[440,.5],
    wrap:[0,0,1]
    
  },
}

Gen.init()

return Gen 

}


/*

a = LFO( .5, .25, .5 )
// lfo has frequency, amplitude and bias

->

// every array indicates presence of new ugen
a.graph = [ 'add', 'bias', [ 'mul', 'amp', [ 'cycle', 'frequency' ] ] ]
*/
