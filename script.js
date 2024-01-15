const btn = document.querySelector(".record-btn")
const pause = document.getElementById("pause-btn")
const file_name = document.querySelector("#file_name")
const timerDOM = document.querySelector("#timer")

document.addEventListener("DOMContentLoaded", async (event) => {
  let videoStream = null

  let mediaRecorder = null
  let timer = 0
  let interval = null
  let isPause = false

  btn.addEventListener("click", async function () {
    if (btn.innerText == "Record") {

      videoStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      // WHEN STREAM ENDS, CLOSES STOP SHARING BBAR
      videoStream.getVideoTracks()[0].addEventListener('ended', () => {
        videoStream.getTracks().forEach(track => track.stop())
        endCountDown()
      })



      //needed for better browser support
      const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9") 
      ? "video/webm; codecs=vp9" 
      : "video/webm"
      mediaRecorder = new MediaRecorder(videoStream, {
        mimeType: mime
      })
      
      document.getElementById("pause-btn").className = "pause-btn"
      let chunks = []
      mediaRecorder.addEventListener('dataavailable', function(e) {
        chunks.push(e.data)
      })

      mediaRecorder.addEventListener('error', function(e) {
        //ERROR EVENT HANDLING
        alert("Error, please refresh and try again")
      })
  
      mediaRecorder.addEventListener('stop', function(){
        btn.innerText = "Record"
        let blob = new Blob(chunks, {
            type: chunks[0].type
        })
        let url = URL.createObjectURL(blob)
  
        // let video = document.querySelector("video")
        // video.src = url
  
        let a = document.createElement('a')
        a.href = url
        a.download = file_name.value || 'video.webm'
        a.click()
      })
      
  
      //we have to start the recorder manually
      mediaRecorder.start()
      btn.innerText = "Stop"
      interval = setInterval(()=>{
        if (isPause) {

        } else {
          timer += 1
          timerDOM.innerText = intervalToString(timer)
        }
      }, 1000)
    } else if (btn.innerText == "Stop") {

      document.getElementById("pause-btn").className = "pause-btn hidden"
      mediaRecorder.stop()
      endCountDown()

      videoStream.getTracks().forEach(track => track.stop())
    }
  })

  pause.addEventListener("click", async function () {
    if (pause.innerText == "Pause") {
      mediaRecorder.pause();
      btn.className = "record-btn hidden"
      pause.innerText = "Resume"
      isPause = true
    } else {
      mediaRecorder.resume();
      btn.className = "record-btn"
      pause.innerText = "Pause"
      isPause = false
    }
  });

  function endCountDown() {
    clearInterval(interval)
    timer = 0
  }

});

function secondsToHourMinSeconds(seconds) {
  return [
    Math.floor(seconds / (60 * 60)),
    Math.floor((seconds / (60 * 60) ) % 1 * 60),
    Math.round(((seconds / (60 * 60))  % 1 * 60) % 1 * 60)
  ]
}

function intervalToString(seconds) {
  const str = secondsToHourMinSeconds(seconds)
  return doubleDigitIt(str[0]) + ":" + doubleDigitIt(str[1]) + ":" + doubleDigitIt(str[2]) 
}

function doubleDigitIt(string) {
  if (string.toString().length < 2) {
    return "0" + string
  }
  return string
}