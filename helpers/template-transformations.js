const slugify = require('slugify');

const removeSpaces = (fileName) => {
  return fileName.split(' ').join('');
};

exports.modelTransformation = (fileName) => ({
  replacer: removeSpaces(fileName).charAt(0).toLowerCase() + removeSpaces(fileName).slice(1),
  fileName: removeSpaces(fileName)
});
exports.routeTransformation = (fileName) => ({
  replacer: removeSpaces(fileName).charAt(0).toUpperCase() + removeSpaces(fileName).slice(1),
  fileName: slugify(fileName, {lower: true}) + '-routes'
});

exports.controllerTransformation = (fileName) => ({
  replacer: removeSpaces(fileName).charAt(0).toUpperCase() + removeSpaces(fileName).slice(1),
  fileName: removeSpaces(fileName) + 'Controller'
});

exports.actionTransformation = (fileName) => ({
  replacer: removeSpaces(fileName).charAt(0).toUpperCase() + removeSpaces(fileName).slice(1),
  fileName: slugify(fileName, {lower: true}) + '-actions'
});
