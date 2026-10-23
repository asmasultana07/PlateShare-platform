function notFound(req, res) {
  res.status(404).json({ message: 'API route not found.' });
}

function errorHandler(error, req, res, next) {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request payload is too large.' });
  }
  if (error instanceof SyntaxError && error.status === 400 && error.body) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }
  console.error(error.message);
  res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : 'Something went wrong. Please try again.',
  });
}

module.exports = { notFound, errorHandler };
