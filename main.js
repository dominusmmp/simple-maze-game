import { Engine, Render, Runner, World, Bodies, Body, Events, Mouse, MouseConstraint, Composites } from 'matter-js'

// Level 1-30
const level = parseInt(localStorage.getItem('maze-level')) || 1

// Cells Variable
const levels = {
  1: 0.4,
  2: 0.5,
  3: 0.6,
  4: 0.7,
  5: 0.8,
  6: 0.9,
  7: 1,
  8: 1.1,
  9: 1.2,
  10: 1.3,
  11: 1.4,
  12: 1.5,
  13: 1.6,
  14: 1.7,
  15: 1.8,
  16: 1.9,
  17: 2,
  18: 2.1,
  19: 2.2,
  20: 2.3,
  21: 2.4,
  22: 2.5,
  23: 2.6,
  24: 2.7,
  25: 2.8,
  26: 2.9,
  27: 3,
  28: 3.1,
  29: 3.2,
  30: 3.3,
}
const levelCells = level => {
  return [Math.floor(16 * level), Math.floor(9 * level)]
}
const cells = levelCells(levels[level])

// Computed Variables
const width = window.innerWidth
const height = window.innerHeight
const isWidthMax = Math.max(width, height) === width
const cellsHorizontal = isWidthMax ? Math.max(cells[0], cells[1]) : Math.min(cells[0], cells[1])
const cellsVertical = isWidthMax ? Math.min(cells[0], cells[1]) : Math.max(cells[0], cells[1])
const unitLengthX = width / cellsHorizontal
const unitLengthY = height / cellsVertical

const wallsProperties = {
  horizontal: {
    width: unitLengthX + ((width >= 768) ? (level <= 10) ? 2 : 1 : (level <= 10) ? 0.5 : 0),
    height: (width >= 768) ? (level <= 10) ? 4 : 2 : (level <= 10) ? 2 : 1
  },
  vertical: {
    width: (width >= 768) ? (level <= 10) ? 4 : 2 : (level <= 10) ? 2 : 1,
    height: unitLengthY + ((width >= 768) ? (level <= 10) ? 2 : 1 : (level <= 10) ? 0.5 : 0)
  }
}

// Game Engine Initialize
const engine = Engine.create()
engine.gravity.y = 0
const { world } = engine
const { rectangle, circle } = Bodies
const add = element => World.add(world, element)
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
    background: 'WhiteSmoke'
  }
})
Render.run(render)
Runner.run(Runner.create(), engine)

// add mouse control
const mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.002,
      render: {
        visible: false
      },
      damping: 1
    }
  });
add(mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// Walls
add([
  rectangle(width / 2, 0, width, 2, { isStatic: true }),
  rectangle(width / 2, height, width, 2, { isStatic: true }),
  rectangle(0, height / 2, 2, height, { isStatic: true }),
  rectangle(width, height / 2, 2, height, { isStatic: true }),
])

// Maze Generation
const shuffle = arr => {
  let counter = arr.length

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter)
    counter--
    const temp = arr[counter]
    arr[counter] = arr[index]
    arr[index] = temp
  }

  return arr
}

const grid = Array(cellsVertical).fill(null)
  .map(() => Array(cellsHorizontal).fill(false))

const verticals = Array(cellsVertical).fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false))

const horizontals = Array(cellsVertical - 1).fill(null)
  .map(() => Array(cellsHorizontal).fill(false))

const startRow = Math.floor(Math.random() * cellsVertical)
const startColumn = Math.floor(Math.random() * cellsHorizontal)

const recurse = (row, column) => {
  // Check if already visited the cell at [row, column] then return
  if (grid[row][column]) { return }

  // Mark the current cell as being visited
  grid[row][column] = true

  // Assemble randomly-ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ])

  // For each neighbor
  for (const neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor

    // Check if neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) { continue }

    // Check if neighbor has already been visited
    if (grid[nextRow][nextColumn]) { continue }

    // Remove a wall from either horizontals or verticals
    if (direction === 'left') { verticals[row][column - 1] = true }
    else if (direction === 'right') { verticals[row][column] = true }
    else if (direction === 'up') { horizontals[row - 1][column] = true }
    else if (direction === 'down') { horizontals[row][column] = true }

    recurse(nextRow, nextColumn)
  }
}

recurse(startRow, startColumn)

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) { return }

    add(rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      wallsProperties.horizontal.width,
      wallsProperties.horizontal.height,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'crimson'
        },
        density: 1,
      }
    ))
  })
})

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) { return }

    add(rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      wallsProperties.vertical.width,
      wallsProperties.vertical.height,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'crimson'
        },
        density: 1
      }
    ))
  })
})

// Goal
const goal = rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.6,
  unitLengthY * 0.6,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: 'darkcyan'
    }
  }
)
add(goal)

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 3
const ball = circle(
  unitLengthX / 2,
  unitLengthY / 2,
  ballRadius,
  {
    label: 'ball',
    render: {
      fillStyle: 'Goldenrod'
    },
    density: 0.0000000000000000000000001,
    frictionStatic: 10,
    frictionAir: 0.8
  },
)
add(ball)

// Keybord control (W,S,D,A, and Arrow Keys)
document.addEventListener('keydown', event => {
  const { x, y } = ball.velocity

  if (event.keyCode === 87 || event.keyCode === 38) {
    if (ball.velocity.y > -20) {
      Body.setVelocity(ball, { x, y: y - 30 });
    }
  }

  if (event.keyCode === 68 || event.keyCode === 39) {
    if (ball.velocity.x < 20) {
      Body.setVelocity(ball, { x: x + 30, y });
    }
  }

  if (event.keyCode === 83 || event.keyCode === 40) {
    if (ball.velocity.y < 20) {
      Body.setVelocity(ball, { x, y: y + 30 });
    }
  }

  if (event.keyCode === 65 || event.keyCode === 37) {
    if (ball.velocity.x > -20) {
      Body.setVelocity(ball, { x: x - 30, y });
    }
  }
})

// Controller
let interval;
const controller = (element, direction) => {
  clearInterval(interval)
  const { x, y } = ball.velocity

  const control = event => {
    if (direction === 'up') {
      interval = setInterval(() => {
        if (ball.velocity.y > -20) {
          Body.setVelocity(ball, { x, y: y - 20 });
        }
      }, 10)
    }

    if (direction === 'right') {
      interval = setInterval(() => {
        if (ball.velocity.x < 20) {
          Body.setVelocity(ball, { x: x + 20, y });
        }
      }, 10)
    }

    if (direction === 'down') {
      interval = setInterval(() => {
        if (ball.velocity.y < 20) {
          Body.setVelocity(ball, { x, y: y + 20 });
        }
      }, 10)
    }

    if (direction === 'left') {
      interval = setInterval(() => {
        if (ball.velocity.x > -20) {
          Body.setVelocity(ball, { x: x - 20, y });
        }
      }, 10)
    }
  }

  const el = document.querySelector(element)
  el.addEventListener('pointerdown', control)
  el.addEventListener('pointerup', () => clearInterval(interval))
  el.addEventListener('pointerleave', () => clearInterval(interval))
  // el.addEventListener('pointerout', () => clearInterval(interval))
}

controller('.up', 'up')
controller('.right', 'right')
controller('.down', 'down')
controller('.left', 'left')

Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach(collosion => {
    const labels = ['ball', 'goal']

    if (labels.includes(collosion.bodyA.label) &&
      labels.includes(collosion.bodyB.label)) {
      if (level === 30) {
        document.querySelector('#win-message').textContent = "Yay! You've finished all levels. Love You!"
      }
      if (level < 30) {
        document.querySelector('#next').style.display = 'flex'
      }
      document.querySelector('#win-box').style.display = 'flex'
      engine.gravity.y = 1
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          Body.setStatic(body, false)
        }
        if (body.label === 'ball') {
          Body.setStatic(body, true)
        }
        setTimeout(() => {
          if (body.label === 'wall') {
            Body.setStatic(body, true)
          }
        }, 2000)
      })
    }
  })
})

document.querySelector('#next').addEventListener('click', event => {
  event.preventDefault()
  localStorage.setItem('maze-level', level + 1)
  location.reload()
})

document.querySelector('#reply').addEventListener('click', event => {
  event.preventDefault()
  location.reload()
})

document.querySelector('#reset').addEventListener('click', event => {
  event.preventDefault()
  localStorage.clear()
  location.reload()
})

document.querySelector('#level').textContent = level
document.querySelector('#open-menu').addEventListener('click', () => {
  document.querySelector('#close-menu').style.display = 'flex'
  document.querySelector('#win-box').style.display = 'flex'
})
document.querySelector('#close-menu').addEventListener('click', () => {
  document.querySelector('#win-box').style.display = 'none'
  document.querySelector('#close-menu').style.display = 'none'
})