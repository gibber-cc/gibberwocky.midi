const Queue = require( './priorityqueue.js' )
const Big   = require( 'big.js' )

let Scheduler = {
  animationClock : require( './animationScheduler.js' ),
  phase: 0,
  msgs: [],
  delayed: [],
  bpm: 120,
  functionsToExecute: [],
  mockBeat: 0,
  mockInterval: null,
  currentBeat: 1,
  currentTime: 0,
  animationOffset:0,
  animationClockInitialized: false,
  lastBeat: 0,
  __sync__:false,

  queue: new Queue( ( a, b ) => {
    if( a.time.eq( b.time ) ) {
      return b.priority - a.priority
    }else{
      return a.time.minus( b.time )
    }
  }),

  sync( mode = 'internal' ) {
    const tempSync = this.__sync__

    this.__sync__ = mode === 'internal' ? false : true

    if( this.__sync__ === false ) {
      if( tempSync === true ) {
        this.run()
      }
    }else{
      if( tempSync === false ) {
        this.animationClockInitialized = false
      }
    }

    localStorage.setItem( 'midi.sync', mode )
  },

  init() {
    const sync = localStorage.getItem( 'midi.sync' )

    if( sync !== null && sync !== undefined ) { 
      this.sync( sync )
      if( sync === 'internal' ) {
        document.querySelector('#internalSyncRadio').setAttribute( 'checked', true )  
      }else{
        document.querySelector('#clockSyncRadio').setAttribute( 'checked', true )  
      }
    }
  },

  mockRun() {
    let seqFunc = () => {
      this.seq( this.mockBeat++ % 8 )
    } 
    this.mockInterval = setInterval( seqFunc, 500 )
  },

  run() {
    if( this.animationClockInitialized === false ) {
      this.animationClock.add( this.animationClockCallback, 0 )
    }
  },

  animationClockCallback( time ) {
    if( this.animationClockInitialized === false ) {
      this.animationOffset = this.lastBeat = time
      this.animationClockInitialized = true
    }
    
    this.beatCallback( time )
  },

  beatCallback( time ) {
    const timeDiff = time - this.lastBeat
    if( timeDiff >= 500 ) {
      this.advanceBeat()
      this.lastBeat = time - (timeDiff - 500) // preserve phase remainder
    }

    if( this.__sync__ === false ) {
      this.animationClock.add( this.beatCallback, 1 )
    }
  },

  // all ticks take the form of { time:timeInSamples, seq:obj }
  advance( advanceAmount, beat ) {
    let end = this.phase + advanceAmount,
        nextTick = this.queue.peek(),
        shouldEnd = false,
        beatOffset

    this.currentBeat = beat

    if( this.queue.length && parseFloat( nextTick.time.toFixed(6) ) < end ) {
      beatOffset = nextTick.time.minus( this.phase ).div( advanceAmount )

      // remove tick
      this.queue.pop()

      this.currentTime = nextTick.time

      // execute callback function for tick passing schedule, time and beatOffset
      // console.log( 'next tick', nextTick.shouldExecute )
      nextTick.seq.tick( this, beat, beatOffset, nextTick.shouldExecute )

      // recursively call advance
      this.advance( advanceAmount, beat ) 
    } else {
      if( this.msgs.length ) {      // if output messages have been created
        this.outputMessages()       // output them
        this.msgs.length = 0        // and reset the contents of the output messages array
      }

      this.phase += advanceAmount   // increment phase
      this.currentTime = this.phase
    }
  },

  addMessage( seq, time, shouldExecute=true, priority=0 ) {
    if( typeof time === 'number' ) time = Big( time )
    // TODO: should 4 be a function of the time signature?
    time = time.times( 4 ).plus( this.currentTime )

    this.queue.push({ seq, time, shouldExecute, priority })
  },

  outputMessages() {
    this.msgs.forEach( msg => {
      if( Array.isArray( msg ) ) { // for chords etc.
        msg.forEach( Gibber.Communication.send )
      }else{
        if( msg !== 0 ) { // XXX why are we getting these zero msgs?
          Gibber.Communication.send( msg )
        }
      }
    })
  },

  advanceBeat() {
    this.currentBeat = ( ++this.currentBeat ) % 4
    this.seq( this.currentBeat )
  },

  seq( beat ) {
    beat = parseInt( beat )

    if( beat === 0 ) {
      for( let func of Scheduler.functionsToExecute ) {
        try {
          func()
        } catch( e ) {
          console.error( 'error with user submitted code:', e )
        }
      }
      Scheduler.functionsToExecute.length = 0
    }

    Scheduler.advance( 1, beat )
    
    Scheduler.outputMessages()
  },

}

Scheduler.animationClockCallback = Scheduler.animationClockCallback.bind( Scheduler )
Scheduler.beatCallback = Scheduler.beatCallback.bind( Scheduler )

module.exports = Scheduler
