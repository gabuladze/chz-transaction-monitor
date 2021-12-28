module.exports = (err, req, res, next) => {
  console.log(err.stack)

  const response = { error: true, message: err.message }

  return res.status(500).json(response)
}
