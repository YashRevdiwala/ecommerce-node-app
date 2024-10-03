const createQuery = (tableQuery) => {
  const query = "INSERT INTO " + tableQuery
  return query.toString()
}

const getQuery = (tableQuery) => {
  return `SELECT * FROM ${tableQuery}`
}

const getByFieldQuery = (tableQuery, parameter) => {
  return `SELECT * FROM ${tableQuery} WHERE ${parameter}`
}

const updateQuery = (tableQuery, values) => {
  return `UPDATE ${tableQuery} SET ${values}`
}

const deleteQuery = (tableQuery) => {
  return `DELETE FROM ${tableQuery}`
}

module.exports = {
  createQuery,
  getQuery,
  getByFieldQuery,
  updateQuery,
  deleteQuery,
}
