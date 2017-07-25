module.exports = function( Gibber ) {
  
'use strict'

const WavePattern = {
  create( graph, values ) {

    let pattern

    const patternOutputFnc = function() {
      patternOutputFnc.run()

      const signalValue = pattern.signalOut()
      const scaledSignalValue = signalValue * ( pattern.values.length )
      const adjustedSignalValue = scaledSignalValue < 0 ? pattern.values.length + scaledSignalValue : scaledSignalValue
      const roundedSignalValue  = Math.floor( adjustedSignalValue )
      const outputBeforeFilters = pattern.values[ roundedSignalValue ]

      const output = pattern.runFilters( outputBeforeFilters, 0 )[ 0 ]

      //console.log( signalValue, scaledSignalValue, adjustedSignalValue, roundedSignalValue, outputBeforeFilters )

      if( patternOutputFnc.update && patternOutputFnc.update.value ) patternOutputFnc.update.value.unshift( output )

      if( output === patternOutputFnc.DNR ) output = null

      return output
    }

    patternOutputFnc.wavePattern = true

    pattern = Gibber.Pattern( patternOutputFnc, ...values )

    Object.assign( pattern, {
      graph,
      signalOut: Gibber.Gen.genish.gen.createCallback( graph ), 
      out() {
        return this.signalOut()
      },
      adjust: this.adjust,
      phase:0,
      run: this.run,
      initialized:false
    })

    return pattern
  },

  run( ) {
    const now = Gibber.Scheduler.currentTimeInMs 

    if( this.initialized === true ) {
      const adjustment =  now - this.phase 
      this.adjust( this.graph, adjustment )
    }else{
      this.initialized = true
    }

    this.phase = now
  },

  adjust( ugen, amount ) {
    if( ugen.name !== undefined && ( ugen.name.indexOf( 'accum' ) > -1 || ugen.name.indexOf( 'phasor' ) > -1 ) )  {
      if( ugen.name.indexOf( 'accum' ) > -1 ) {
        ugen.value += amount * ugen.inputs[0].value
      }else{
        ugen.value += amount * ( ugen.inputs[0].inputs[0].value  * ugen.inputs[0].inputs[1] )
      }

      //console.log( ugen.value, amount )
      // wrap or clamp accum value manuallly
      if( ugen.shouldWrap === true ) {
        if( ugen.value > ugen.max ) {
          while( ugen.value > ugen.max ) {
            ugen.value -= ugen.max - ugen.min
          }
        } else if( ugen.value < ugen.min ) {
          while( ugen.value < ugen.min ) {
            ugen.value += ugen.max - ugen.min
          }
        } 
      }else if( ugen.shouldClamp === true ) {
        if( ugen.value > ugen.max ) { 
          ugen.value = max
        }else if( ugen.value < ugen.min ) {
          ugen.value = min
        }
      }
    }

    if( typeof ugen.inputs !== 'undefined' ) {
      ugen.inputs.forEach( u => WavePattern.adjust( u, amount ) )
    }
  }
 
}

return WavePattern

}
