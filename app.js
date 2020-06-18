/*------------------------------------------------------------------------------------------------------
--------------------------------Author : Liam Bloor-----------------------------------------------------
--------------------------------Built upon from "basic-tetris" by Ania Kubow----------------------------
------------------------------------------------------------------------------------------------------*/




/*------------------------------------------------------------------------------------------------------
---------------------------------------Initialise Variables---------------------------------------------
------------------------------------------------------------------------------------------------------*/




  document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  let arrows = Array.from(document.querySelectorAll('.speed-bar div'))
  const scoreDisplay = document.querySelector("#score")
  const startBtn = document.querySelector("#start-button")
  const volDown = document.querySelector("#vol-down")
  const muteBtn = document.querySelector("#mute")
  const volUp = document.querySelector("#vol-up")
  const width = 10
  let nextRandom = 0
  let timerId
  let score = 0
  let counter = 0
  let bucket = 0
  let n = 0
  let timedOut = false
  let directionEntered = false
  var isPlaying = false
  var speed = 1000
  let clickCount = 1
  let vol = 0.3
  let muted = false
  let gameLost = false

  /*-------------------------------------Initialise Audio---------------------------------------------*/
  var backgroundSound = document.createElement("audio")//set up for background music
  backgroundSound.src = "sound.mp3" //Source : Youtube Audio library : Powerup! Jeremy Blake
  backgroundSound.volume = vol
  backgroundSound.loop = true

  /*-------------------------------------Initialise Tetromino colors----------------------------------*/
  const colors = [
    "#ffa82d", //orange
    "#db1103", //red
    "#c417c7", //purple
    "#ffff00", //yellow
    "#16bac9",  //cyan
    "#02cc02", //green
    "#260bd1" //blue
  ]

  /*-------------------------------------Initialise Tetromino shapes----------------------------------*/
  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2]
  ]
  const zTetromino = [
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1]
  ]
  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1]
  ]
  const sqTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
  ]
  const slTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ]
  const zRTetromino = [
    [width, width + 1, width * 2 + 1, width * 2 + 2],
    [1, width, width + 1, width * 2],
    [width, width + 1, width * 2 + 1, width * 2 + 2],
    [1, width, width + 1, width * 2]
  ]
  const lRTetromino = [
    [1, width + 2, width * 2 + 2, 2],
    [width * 2, width * 2 + 1, width * 2 + 2, width + 2],
    [0, width, width * 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2]
  ]
  const theTetrominos = [lTetromino, zTetromino, tTetromino, sqTetromino, slTetromino, zRTetromino, lRTetromino]

  /*-------------------------------------Randomly select tetromino------------------------------------*/
  let currentPosition = 4
  let currentRotation = 0
  let random = Math.floor(Math.random()*theTetrominos.length)
  let current = theTetrominos[random][currentRotation]





  /*----------------------------------------------------------------------------------------------------
  ---------------------------------------Movement functions---------------------------------------------
  ----------------------------------------------------------------------------------------------------*/





  /*-------------------------------------Draw the tetromino-------------------------------------------*/
  function draw () {
    current.forEach(index => {
      squares[currentPosition + index].classList.add("tetromino")
      squares[currentPosition + index].style.backgroundColor = colors[random]
    })
  }

  /*-------------------------------------Undraw the tetromino-----------------------------------------*/
  function undraw () {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove("tetromino")
      squares[currentPosition + index].style.backgroundColor = ""
    })
  }

  setSpeed(0) //Initialise speed and speed bar

  /*-----------------------moveDown causes the tetromino to move down each timestep-------------------*/
  function moveDown() {
    undraw()
    currentPosition += width
    checkMoveDown()
    draw()
    freeze()
    checkMoveDown()
  }

  /*-------------freeze checks on each moveDown if the current tetromino needs to be frozen-----------*/
  function freeze() {
    //if a there is a tetromino below, wait 0.5s
    if(current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) {
      clearInterval(timerId)
      timerId = null

      setTimeout(function(){
      timedOut = true
      //if a direction is NOT entered in those 0.5s, freeze current tetromino and create new one
      if(!directionEntered) {
        if(current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) {
        current.forEach(index => squares[currentPosition + index].classList.add("taken"))
        //Start new teromino falling
        random = nextRandom
        nextRandom = Math.floor(Math.random() * theTetrominos.length)
        currentRotation = 0
        current = theTetrominos[random][currentRotation]
        currentPosition = 4
        timerId = setInterval(moveDown, speed)
        displayShape()
        addScore()
        gameOver()
        draw()
      }else{
        //else continue moveDown without freezing
        timerId = setInterval(moveDown, speed)
      }
    }else{
        timerId = setInterval(moveDown, speed)
      }
    }, 500)
        directionEntered = false
    }
  }

  /*---------Checks if the tetromino can be moved down further after direction input in freeze()------*/
  function checkMoveDown() {
    if(current.some(index => squares[currentPosition + index].classList.contains("taken"))){
      currentPosition -= width
    }
    if(current.every(index => squares[currentPosition + index + width].classList.contains(""))){
      currentPosition -= width
    }
  }

/*--------------------Move the tetromino left, unless at a wall or into a tetromino------------------*/
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    if(!isAtLeftEdge) currentPosition -=1
    if(current.some(index => squares[currentPosition + index].classList.contains("taken"))){
      currentPosition += 1
    }
    draw()
  }
/*-----------------Move the tetromino right, unless at a wall or into a tetromino--------------------*/
  function moveRight() {
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
    if(!isAtRightEdge) currentPosition +=1
    if(current.some(index => squares[currentPosition + index].classList.contains("taken"))){
      currentPosition -= 1
    }
    draw()
  }





/*------------------------------------------------------------------------------------------------------
---------------------------------------Rotation functions-----------------------------------------------
------------------------------------------------------------------------------------------------------*/





  /*-----------------------------------Rotate the tetromino right-------------------------------------*/
  function rotateRight() {
    undraw()
    rotateEdge(1)
    currentRotation ++
    if(currentRotation === current.length) {
      currentRotation = 0;
    }
    current = theTetrominos[random][currentRotation]
    rotateTaken(1, 1)
    draw()
  }

  /*-----------------------------------Rotate the tetromino left-------------------------------------*/
  function rotateLeft() {
    undraw()
    rotateEdge(0)
    currentRotation --
    if(currentRotation < 0) {
      currentRotation = current.length - 1
    }
    current = theTetrominos[random][currentRotation]
    rotateTaken(1, 0)
    draw()
  }

  /*--------------------Check if trying to rotate into an existing tetromino------------------------*/

  /* When a tetromino is rotated it might rotate into another tetromino. This function moves the
    tetromino to the left or right if it is rotated into an existing tetromino. If there is nowhere
    for the tetromino to move, then rotation is cancelled */
  function rotateTaken(direction, leftRight) {
    if(current.some(index => squares[currentPosition + index].classList.contains("taken"))){
        counter += 1 //If, for example, rotating left, and a tetromino exists there, move right
        currentPosition += direction
        if(current.some(index => squares[currentPosition + index].classList.contains("taken")) && (counter === 1)){
          counter += 1  //If we have moved left(counter === 1) and there is still a taken tetromino, move right 2 spaces
          rotateTaken(-2,leftRight) //counter will ===3 after this is called
        }
    }if(counter === 3){ //reset to original position and revert any rotation
      counter = 0
      currentPosition += 1
      if(leftRight === 0){
        currentRotation ++
      if(currentRotation === current.length) {
          currentRotation = 0;
        }
      }if(leftRight === 1) {
        currentRotation --
        if(currentRotation < 0) {
          currentRotation = current.length - 1
        }
      }
    }
    current = theTetrominos[random][currentRotation]
  }

  /*-----------------------------Check if trying to rotate over an edge-------------------------------*/

  /* This function works by knowing which tetrominos are problematic at edges and moving them left or
    right based on how much they rotate over the edge*/
  function rotateEdge(leftRight) {
    const rotatedOnLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    const rotatedOneFromLeft = current.some(index => (currentPosition + index) % width === 1)
    const rotatedTwoFromLeft = current.some(index => (currentPosition + index) % width === 2)
    const rotatedOnRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
    const rotatedOneFromRight = current.some(index => (currentPosition + index) % width === width - 2)
    const rotatedTwoFromRight = current.some(index => (currentPosition + index) % width === width - 3)

    if(rotatedOnRightEdge && (
        (random === 1 && currentRotation === 1) || //all problematic tetrominos at right edge rotations
        (random === 2 && currentRotation === 3) ||
        (random === 0 && (currentRotation === 2 || currentRotation === 0)) ||
        (random === 5 && currentRotation === 1) ||
        (random === 5 && currentRotation === 3) ||
        (random === 6 && (currentRotation === 2 || currentRotation === 0)))){
          currentPosition -= 1
          blockRotation(leftRight, 1)
      }
    if((rotatedOnRightEdge || rotatedOnLeftEdge) && ( //block wide forms of L and T tetromino when surrounded by taken and edge
        (random === 0 && (currentRotation === 1 || currentRotation === 3)) ||
        (random === 2 && (currentRotation === 0 || currentRotation === 2)) ||
        (random === 6 && (currentRotation === 1 || currentRotation === 3)))){
          blockRotation(leftRight, 0)

    }else if(rotatedOnRightEdge && (
        (random === 4 && currentRotation === 0) || //straight line tetrominos need to be moved two squares when rotated along the right edge
        (random === 4 && currentRotation === 2))) {
          currentPosition  -= 3
          blockRotation(leftRight, 3)

    }else if(rotatedOneFromRight && (
        (random === 4 && currentRotation === 0) || //straight line tetrominos need to be moved two squares when rotated along the right edge
        (random === 4 && currentRotation === 2))) {
          currentPosition  -= 2
          blockRotation(leftRight, 2)

    }else if(rotatedTwoFromRight && (
        (random === 4 && currentRotation === 0) || //straight line tetrominos need to be moved two squares when rotated along the right edge
        (random === 4 && currentRotation === 2))) {
          currentPosition  -= 1
          blockRotation(leftRight, 1)

    }else if(rotatedOnLeftEdge && (
        (random === 2 && currentRotation === 1) || //all problematic tetrominos at left edge rotations
        (random === 0 && currentRotation === 0) ||
        (random === 4 && currentRotation === 0) ||
        (random === 4 && currentRotation === 2) ||
        (random === 6 && currentRotation === 0))) {
          currentPosition += 1
          blockRotation(leftRight, -1)
    }
    else if(rotatedOnLeftEdge && (
        (random === 4 && currentRotation === 0) || //straight line tetrominos need to be moved two squares when rotated along the left edge
        (random === 4 && currentRotation === 2))) {
          currentPosition  += 2
          blockRotation(leftRight, -2)

    }else if(rotatedOneFromLeft && (
        (random === 4 && currentRotation === 0) || //straight line tetrominos need to be moved one square when rotated one from left edge
        (random === 4 && currentRotation === 2))) {
          currentPosition  += 1
          blockRotation(leftRight, -1)

    }else if(rotatedTwoFromLeft && (
        (random === 4 && currentRotation === 0) || //straight line tetrominos dont need to be moved when rotated two from left edge
        (random === 4 && currentRotation === 2))) {
          blockRotation(leftRight, 0)
    }
  }

  /*-----------------------------Block rotations on edges with taken sqaures adjacent-------------------------------*/
  function blockRotation(leftRight, move){
    if(current.some(index => squares[currentPosition + index].classList.contains("taken"))){
      currentPosition += move
      if(leftRight === 0){
        currentRotation ++
        if(currentRotation === current.length) {
          currentRotation = 0;
        }
      }
      if(leftRight === 1) {
          currentRotation --
          if(currentRotation < 0) {
            currentRotation = current.length - 1
          }
        }
      }

      if((current.some(index => (currentPosition + index) % width === 0) &&
        current.some(index => (currentPosition + index) % width === width - 1))){
        currentPosition -= move
        if(leftRight === 0){
          currentRotation --
          if(currentRotation === current.length) {
            currentRotation = 0;
          }
        }
        if(leftRight === 1) {
            currentRotation ++
            if(currentRotation < 0) {
              currentRotation = current.length - 1
            }
          }

    }
  }



  /*------------------------------------------------------------------------------------------------------
  ---------------------------------------Next tetromino grid----------------------------------------------
  ------------------------------------------------------------------------------------------------------*/





  /*-----------------------------Show next tetromino in the mini grid-----------------------------------*/
  const displaySquares = document.querySelectorAll(".mini-grid div")
  const displayWidth = 4
  const displayIndex = 0

  /*----------------------------------Tetrominos without rotations--------------------------------------*/
  const upNextTetromino = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], // L tetromino
    [displayWidth + 1, displayWidth + 2, displayWidth * 2, displayWidth * 2 + 1], //Z tetromino
    [displayWidth + 1, displayWidth * 2, displayWidth * 2 + 1, displayWidth * 2 + 2], // t  tetromino
    [displayWidth + 1, displayWidth + 2, displayWidth * 2 + 1, displayWidth * 2 + 2], // sq  tetromino
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], // sl tetromino
    [displayWidth, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2 + 2], // zR tetromino
    [1, displayWidth + 2, displayWidth * 2 + 2, 2] // lR tetromino
  ]

  /*-----------------------------------Display the next tetromino---------------------------------------*/
  function displayShape() {
    displaySquares.forEach(square => {
      square.classList.remove("tetromino")
      square.style.backgroundColor = ""
    })
    upNextTetromino[nextRandom].forEach(index => {
      displaySquares[displayIndex + index].classList.add("tetromino")
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
    })
  }





  /*------------------------------------------------------------------------------------------------------
  ---------------------------------------User controls----------------------------------------------------
  ------------------------------------------------------------------------------------------------------*/






  /*----------------------Assign movement and rotations functions to keys-------------------------------*/
  function control(e){
    if(e.keyCode === 37) {
      moveLeft()
    }else if(e.keyCode === 68) {
      rotateRight()
    }else if(e.keyCode === 65) {
      rotateLeft()
    }else if(e.keyCode === 39) {
      moveRight()
    }
  }

  document.addEventListener("keyup", control)
  document.addEventListener("keydown", lR)
  document.addEventListener("keydown", (event) => { //Tetromino speeds down on key press and hold
    if(event.repeat && event.keyCode === 40) {
      if(timerId) {
        clearInterval(timerId)
        timerId = null
        speed = speed / 3 * 2
        timerId = setInterval(moveDown, speed)
        speed = speed / 2 * 3
        moveDown()
      }
    }
  })

  document.addEventListener("keyup", (event) => { //Upon key release stop speeding and continue moveDown()
    if(event.keyCode === 40) {
      if(timerId) {
        clearInterval(timerId)
        timerId = null
        timerId = setInterval(moveDown, speed)
      }
    }
  })

  /*---------------------Checking if a direction is entered : See freeze()-------------------------------*/
  function lR(x) {
    if(x.keyCode === 37) {
      directionEntered = true
    }
    if(x.keyCode === 39) {
      directionEntered = true
    }else {
      directionEntered = false
    }
  }


  /*-----------------------------Start button functionality---------------------------------------------*/
  startBtn.addEventListener("click", () => {
      clickCount += 1
      if (gameLost){
        startBtn.src = "reset-blue.png"
        reset()
        setTimeout(function(){  //flash blue for a 0.1s
          startBtn.src = "blank.png"
        }, 100)
      }else if (clickCount === 2){
        draw()
        timerId = setInterval(moveDown, speed)
        displayShape()
        toggleBackgroundSound()
        startBtn.src = "play-blue.png"
        setTimeout(function(){  //flash blue for a 0.1s
        startBtn.src = "blank.png"
        }, 100)
      }
  })

  /*-----------------------------Volume down button functionality---------------------------------------*/
  volDown.addEventListener("click", () => {
    if(vol > 0){
      vol = (vol - 0.1).toFixed(1)
      backgroundSound.volume = vol
    }
    volDown.src = "minus-blue.png"
    setTimeout(function(){  //flash blue for a 0.1s
      volDown.src = "minus.png"
    }, 100)
  })

  /*-----------------------------Volume up button functionality-----------------------------------------*/
  volUp.addEventListener("click", () => {
    if(vol < 1){
      volUp.src = ""
      vol = (parseFloat(vol) + 0.1).toFixed(1)
      backgroundSound.volume = vol
    }
    volUp.src = "add-blue.png"
    setTimeout(function(){  //flash blue for a 0.1s
      volUp.src = "add.png"
    }, 100)
  })

  /*-----------------------------Volume mute button functionality---------------------------------------*/
  muteBtn.addEventListener("click", () => {
    if(muted === false) {
      muted = true
      vol = 0
      backgroundSound.volume = vol
      muteBtn.src = "unmute-blue.png"
      setTimeout(function(){  //flash blue for a 0.1s
        muteBtn.src = "mute.png"
      }, 100)
    }else if(muted === true){
      muted = false
      vol = 0.3
      backgroundSound.volume = vol
      muteBtn.src = "mute-blue.png"
      setTimeout(function(){  //flash blue for a 0.1s
        muteBtn.src = "unmute.png"
      }, 100)
    }
  })







  /*------------------------------------------------------------------------------------------------------
  ---------------------------------------Gameplay mechanics-----------------------------------------------
  ------------------------------------------------------------------------------------------------------*/





  /*-----------------------Add score on row clear, more rows = more score-------------------------------*/
  function addScore() {
    let counter = 0
    for(let i = 0; i < 199; i += width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

      if(row.every(index => squares[index].classList.contains("taken"))) {
        counter += 1
        score += 10
        bucket += 10
        row.forEach(index => {
          squares[index].classList.remove("taken")
          squares[index].classList.remove("tetromino")
          squares[index].style.backgroundColor = ""
        })
        //full rows are removed from the taken class, removed from the bottom of the grid and added to top
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
      }
    }
    const element = document.querySelector(".plus-score")

    /*counter stores how many rows are cleared at once, and more score is awarded for the more rows that
    are cleared at once. bucket is used to detect when the player achieves every 100 score , which calls
    the setSpeed() function, increasing difficulty*/
    if(counter === 1){
      header.innerText = "+10"
      scoreDisplay.innerHTML = score
      showHideScore()
    }else if(counter === 2){ // add bonus score for multiple lines
      score += 5
      bucket += 5
      header.innerText = "+25"
      scoreDisplay.innerHTML = score
      showHideScore()
    }else if(counter === 3){
      score += 15
      bucket += 15
      header.innerText = "+45"
      scoreDisplay.innerHTML = score
      showHideScore()
    }else if(counter === 4){
      score += 40
      bucket += 40
      header.innerText = "+80"
      scoreDisplay.innerHTML = score
      showHideScore()
    }
    if (counter > 0){
      scoreSound() //play sound when row cleared
    }
    if(bucket > 100){
      n += 1
      setSpeed(n) //n increases every 100 score, increasing speed: See setSpeed()
      bucket = bucket % 100
    }
  }

  /*--------------------------------When top of grid reached, gameover----------------------------------*/
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
      scoreDisplay.innerHTML = " " + score + " Gamer over."
      clearInterval(timerId) //stop moving
      toggleBackgroundSound() //stop music
      gameOverSound() //play gameover sound
      startBtn.src = "reset.png"
      gameLost = true
    }
  }
  /*--------------------When score is added, show the user via fade in and out--------------------------*/
  function showHideScore(){
    header.classList.add("show-score")
    setTimeout(function(){
      header.classList.remove("show-score")
      header.classList.add("hide-score")
    }, 1000)  //Show the score for 1s
    header.classList.remove("hide-score")
  }

  /*--------Every 100 score decrease speed variable (which increases the "speed" of the game)-----------*/
  function setSpeed(x){
    speed = 1000
    speed = speed - (x * 80) // x denotes the number of 100's of scores the player has achieved
    if(speed < 200){ //cap speed
      speed = 200
    }
    fasterSound()
    for(let j = 0; j <= x; j++){
      arrows[j].style.borderLeftColor = "#aaffe7" // set the speed bar arrows to blue
    }
  }

  /*--------Clear the grid of taken and tetromino squares, reset score and start new teromino-----------*/
  function reset(){
    score = 0
    scoreDisplay.innerHTML = score
    bucket = 0
    for(let i = 0; i <= 199; i ++) {
      if(squares[i].classList.contains("taken") || squares[i].classList.contains("tetromino")) {
        squares[i].classList.remove("taken")
        squares[i].classList.remove("tetromino")
        squares[i].style.backgroundColor = ""
      }
    }

    random = Math.floor(Math.random()*theTetrominos.length)
    current = theTetrominos[random][currentRotation]
    random = nextRandom
    nextRandom = Math.floor(Math.random() * theTetrominos.length)
    draw()
    timerId = setInterval(moveDown, speed)
    displayShape()
    toggleBackgroundSound()
  }




  /*------------------------------------------------------------------------------------------------------
  ---------------------------------------Audio------------------------------------------------------------
  ------------------------------------------------------------------------------------------------------*/






  /*------------------------When button is pressed, toggle background song------------------------------*/
  function toggleBackgroundSound(){
    if (isPlaying){
      backgroundSound.pause()
    }else{
      backgroundSound.play()
    }
    backgroundSound.onplaying = function() {
      isPlaying = true;
    };
    backgroundSound.onpause = function() {
      isPlaying = false;
    };
  }

  /*---------------------Play a short +score sound when score is added----------------------------------*/
  function scoreSound(){
    var audio = document.createElement("audio")
    audio.src = "line-remove.mp3" //Source : Youtube Audio library : Crash
    audio.addEventListener("ended", function () {
        document.removeChild(this)
    }, false)
    audio.volume = vol
    audio.play()
}

  /*--------------------Play a short "getting faster" sound when speed is added-------------------------*/
  function fasterSound(){
    var audio = document.createElement("audio")
    audio.src = "faster.mp3" //Source : Youtube Audio library : Slide whistle
    audio.addEventListener("ended", function () {
        document.removeChild(this)
    }, false)
    audio.volume = 1
    audio.play()
  }

  /*---------------------Play a short gameover sound when player loses----------------------------------*/
  function gameOverSound(){
    var audio = document.createElement("audio")
    audio.src = "gameover.mp3" //Source : Youtube Audio library : Slide Whistle to Drum
    audio.addEventListener("ended", function () {
        document.removeChild(this)
    }, false)
    audio.volume = vol
    audio.play()
  }

















})
