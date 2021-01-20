const express = require('express')
const { spawn } = require('child_process')

const app = express()

app.get('/upgrade', (req, res) => {
  const update = spawn('sh', ['upgrade.sh'])
  update.stdout.on('data', data => {
    console.log(`stdout: ${data}`)
  })
  update.stderr.on('data', data => {
    console.error(`stderr: ${data}`)
  })
  update.on('close', code => {
    console.log(`update finished, exited with code ${code}`)
  })
  res.sendStatus(200)
})

const s = app.listen(3000, () => {
  console.log('server starting!!!')
})

const closeServer = () => {
  s.close()
}

process.on('SIGTERM', closeServer)
process.on('SIGINT', closeServer)
