export function setUserMedia(){
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }
  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented'));
      } else {
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    };
  }
}
