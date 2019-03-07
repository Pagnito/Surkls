const gzip = require('gzip');
const path = require('path');
['a','b'].sort((a,b)=>{//sort alphabeticlly
  return a.toLowerCase().charCodeAt(0) - b.toLowerCase().charCodeAt(0)
})