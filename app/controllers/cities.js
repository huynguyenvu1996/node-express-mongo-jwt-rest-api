const model = require('../models/city')
const { matchedData } = require('express-validator/filter')
const base = require('./base')

/*********************
 * Private functions *
 *********************/
const getAllItemsFromDB = async () => {
  return new Promise((resolve, reject) => {
    model.find(
      {},
      '-updatedAt -createdAt',
      {
        sort: {
          name: 1
        }
      },
      (err, items) => {
        if (err) {
          reject(base.buildErrObject(422, err.message))
        }
        resolve(items)
      }
    )
  })
}

const getItemsFromDB = async (req, query) => {
  const options = await base.listInitOptions(req)
  return new Promise((resolve, reject) => {
    model.paginate(query, options, (err, items) => {
      if (err) {
        reject(base.buildErrObject(422, err.message))
      }
      resolve(base.cleanPaginationID(items))
    })
  })
}

const cityExists = async name => {
  return new Promise((resolve, reject) => {
    model.findOne(
      {
        name
      },
      (err, item) => {
        if (err) {
          reject(base.buildErrObject(422, err.message))
        }
        if (item) {
          reject(base.buildErrObject(422, 'CITY_ALREADY_EXISTS'))
        }
        resolve(false)
      }
    )
  })
}

const cityExistsExcludingItSelf = async (id, name) => {
  return new Promise((resolve, reject) => {
    model.findOne(
      {
        name,
        _id: {
          $ne: id
        }
      },
      (err, item) => {
        if (err) {
          reject(base.buildErrObject(422, err.message))
        }
        if (item) {
          reject(base.buildErrObject(422, 'CITY_ALREADY_EXISTS'))
        }
        resolve(false)
      }
    )
  })
}

const createItemInDB = async req => {
  return new Promise((resolve, reject) => {
    model.create(req, (err, item) => {
      if (err) {
        reject(base.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

const getItemFromDB = async id => {
  return new Promise((resolve, reject) => {
    model.findById(id, (err, item) => {
      if (err) {
        reject(base.buildErrObject(422, err.message))
      }
      if (!item) {
        reject(base.buildErrObject(404, 'NOT_FOUND'))
      }
      resolve(item)
    })
  })
}

const updateItemInDB = async (id, req) => {
  return new Promise((resolve, reject) => {
    model.findByIdAndUpdate(
      id,
      req,
      {
        new: true
      },
      (err, item) => {
        if (err) {
          reject(base.buildErrObject(422, err.message))
        }
        if (!item) {
          reject(base.buildErrObject(404, 'NOT_FOUND'))
        }
        resolve(item)
      }
    )
  })
}

const deleteItemFromDB = async id => {
  return new Promise((resolve, reject) => {
    model.findByIdAndRemove(id, (err, item) => {
      if (err) {
        reject(base.buildErrObject(422, err.message))
      }
      if (!item) {
        reject(base.buildErrObject(422, 'NOT_FOUND'))
      }
      resolve(base.buildSuccObject('DELETED'))
    })
  })
}

/********************
 * Public functions *
 ********************/

exports.getAllItems = async (req, res) => {
  try {
    res.status(200).json(await getAllItemsFromDB())
  } catch (error) {
    base.handleError(res, error)
  }
}

exports.getItems = async (req, res) => {
  try {
    const query = await base.checkQueryString(req.query)
    res.status(200).json(await getItemsFromDB(req, query))
  } catch (error) {
    base.handleError(res, error)
  }
}

exports.getItem = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await base.isIDGood(req.id)
    res.status(200).json(await getItemFromDB(id))
  } catch (error) {
    base.handleError(res, error)
  }
}

exports.createItem = async (req, res) => {
  try {
    req = matchedData(req)
    const doesCityExists = await cityExists(req.name)
    if (!doesCityExists) {
      res.status(201).json(await createItemInDB(req))
    }
  } catch (error) {
    base.handleError(res, error)
  }
}

exports.updateItem = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await base.isIDGood(req.id)
    const doesCityExists = await cityExistsExcludingItSelf(id, req.name)
    if (!doesCityExists) {
      res.status(200).json(await updateItemInDB(id, req))
    }
  } catch (error) {
    base.handleError(res, error)
  }
}

exports.deleteItem = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await base.isIDGood(req.id)
    res.status(200).json(await deleteItemFromDB(id))
  } catch (error) {
    base.handleError(res, error)
  }
}