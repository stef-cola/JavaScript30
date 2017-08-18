const video = document.querySelector('.player')
const canvas = document.querySelector('.photo')
const ctx = canvas.getContext('2d')
const strip = document.querySelector('.strip')
const snap = document.querySelector('.snap')
const greenScreenSelector = document.querySelector('.rgb')

let filter = ''

function getVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      video.src = window.URL.createObjectURL(localMediaStream)
      video.play()
    })
    .catch(err => {
      console.error(`OH NO!!!`, err)
    })
}

function paintToCanvas() {
  const width = video.videoWidth
  const height = video.videoHeight
  canvas.width = width
  canvas.height = height

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height)
    //take the pixels out of the image
    let pixels = ctx.getImageData(0, 0, width, height)
    switch (filter) {
      case 'red':
        pixels = redEffect(pixels)
        ctx.globalAlpha = 1
        greenScreenSelector.classList.add('hidden')
        break
      case 'green':
        pixels = greenEffect(pixels)
        ctx.globalAlpha = 1
        greenScreenSelector.classList.add('hidden')
        break
      case 'blue':
        pixels = blueEffect(pixels)
        ctx.globalAlpha = 1
        greenScreenSelector.classList.add('hidden')
        break
      case 'ghost':
        pixels = rgbSplit(pixels)
        ctx.globalAlpha = 0.1
        greenScreenSelector.classList.add('hidden')
        break
      case 'green-screen':
        pixels = greenScreen(pixels)
        ctx.globalAlpha = 1
        greenScreenSelector.classList.remove('hidden')
        break
      default:
        pixels = pixels
        ctx.globalAlpha = 1
        greenScreenSelector.classList.add('hidden')
    }
    ctx.putImageData(pixels, 0, 0)
  }, 16)
}

function takePhoto() {
  snap.currentTime = 0
  snap.play()

  const data = canvas.toDataURL('image/jpeg')
  const link = document.createElement('a')
  link.href = data
  link.setAttribute('download', 'awesome')
  link.textContent = 'Download Image'
  link.innerHTML = `<img src="${data}" alt="Awesome Screenshot">`
  strip.insertBefore(link, strip.firsChild)
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i] + 100 //red value
    pixels.data[i + 1] = pixels.data[i + 1] - 50 //green value
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5 //blue value
  }
  return pixels
}
function greenEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i] - 200 //red value
    pixels.data[i + 1] = pixels.data[i + 1] + 100 //green value
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5 //blue value
  }
  return pixels
}
function blueEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i] * 0.5 //red value
    pixels.data[i + 1] = pixels.data[i + 1] - 50 //green value
    pixels.data[i + 2] = pixels.data[i + 2] + 100 //blue value
  }
  return pixels
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i] //red value
    pixels.data[i + 100] = pixels.data[i + 1] //green value
    pixels.data[i - 550] = pixels.data[i + 2] //blue value
  }
  return pixels
}

function greenScreen(pixels) {
  //object to hold min & max 'green'
  const levels = {}

  //grab the sliders from the HTML
  document.querySelectorAll('.rgb input').forEach(input => {
    levels[input.name] = input.value
  })

  //massive for loop. If it's between the min/max values then set the alpha to 0
  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0]
    green = pixels.data[i + 1]
    blue = pixels.data[i + 2]
    alpha = pixels.data[i + 3]

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // take it out!
      pixels.data[i + 3] = 0
    }
  }

  return pixels
}

function setFilter(filterSet) {
  filter = filterSet
  return filter
}

getVideo()
video.addEventListener('canplay', paintToCanvas)
