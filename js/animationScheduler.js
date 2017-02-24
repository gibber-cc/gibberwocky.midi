const Queue = require( './priorityqueue.js' )

let Scheduler = {
  currentTime : null,
  queue: new Queue( ( a, b ) => a.time - b.time ),
  animationOffset: 0,

  init() {
    window.requestAnimationFrame( this.onAnimationFrame ) 
  },
  
  add( func, offset=0, idx ) {
    let time = this.currentTime + offset + this.animationOffset
    //console.log( time )
    this.queue.push({ func, time })

    return time
  },

  run( timestamp ) {
    let nextEvent = this.queue.peek()

    if( this.queue.length !== 0 && nextEvent.time <= timestamp ) {

      // remove event
      this.queue.pop()

      try{
        nextEvent.func( nextEvent.time )
      }catch( e ) {
        Gibber.Environment.error( 'annotation error:', e.toString() )
      }
      // call recursively
      this.run( timestamp  )
    }

    if( Gibber.Environment.codeMarkup.genWidgets.dirty === true ) {
      Gibber.Environment.codeMarkup.drawWidgets()
    }
  },

  onAnimationFrame( timestamp ) {
    this.currentTime = timestamp

    this.run( timestamp + this.animationOffset )    

    window.requestAnimationFrame( this.onAnimationFrame )
  }

}

Scheduler.onAnimationFrame = Scheduler.onAnimationFrame.bind( Scheduler )

module.exports = Scheduler
