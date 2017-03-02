//require( 'babel-polyfill' )

let Gibber = require( './gibber.js' ),
    useAudioContext = false,
    count = 0
   
window.addEventListener( 'load', ()=> {
  Gibber.init()
  window.Gibber = Gibber
})
