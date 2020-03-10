const {
  modelTransformation,
  routeTransformation,
  actionTransformation,
  controllerTransformation
} = require('../helpers/template-transformations');

module.exports = {
  'Model': modelTransformation,
  'Route': routeTransformation,
  'Action': actionTransformation,
  'Controller': controllerTransformation
}
