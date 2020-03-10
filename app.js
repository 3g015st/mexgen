#!/usr/bin/env node
const inquirer = require('inquirer');
const {from, of, Observable, throwError} = require('rxjs');
const {map, mergeMap, catchError, pluck, tap, mapTo} = require('rxjs/operators');
const fs = require('fs');

const FILE_FOLDER_LOOKUP = require('./references/file-folder-lookup');
const FILE_TEMPLATE_PATH_LOOKUP = require('./references/file-template-path-lookup');
const TEMPLATE_TRANSFORMATION_FUNC_LOOKUP = require('./references/template-transformation-func-lookup');

const promptMessage = (type, message, name, choices) => (from(inquirer.prompt([{type, message, name, choices}])));

const bindFilesToFileName = (files) => {
  return promptMessage('input', 'Enter a name for the file/s that will be generated : ', 'fileName')
    .pipe(
      pluck('fileName'),
      map(fileName => ({
        fileName,
        files
      }))
    )
};

const processFileProduction = (fileObject) => {
  return of(fileObject).pipe(
    mergeMap(handleDirectory),
    mergeMap(makeFile(fileObject.fileName))
  );
};

const isDirectoryAvailable = ({folderName, file}) => {
  const path = `./${folderName}`;
  return of({
    isAvailable: fs.existsSync(path) ? true : false,
    path,
    file
  });
};

const handleDirectory = ({files}) => {
  return from(files).pipe(
    map(file => ({folderName: FILE_FOLDER_LOOKUP[file], file})),
    mergeMap(isDirectoryAvailable),
    tap(({isAvailable, path}) => !isAvailable ? fs.mkdirSync(path) : ''),
    map(({path, file}) => ({path, file}))
  )
};

const rewriteTemplate = ({replacer, fileName}) => (templateData) => {
  const content = templateData.toString().replace(/<name>/g, replacer).replace(/<date-time>/g, new Date().toString());
  return of({content, fileName});
};

const processTemplateData = (fileName) => ({templatePath, file}) => {
  const transformFunction = TEMPLATE_TRANSFORMATION_FUNC_LOOKUP[file];
  const transformedData = transformFunction(fileName);

  const templateData = fs.readFileSync(templatePath, 'utf8');
  return of(templateData).pipe(
    mergeMap(rewriteTemplate(transformedData))
  )
};

const makeFile = (fileName) => ({path, file}) => {
    return of(file).pipe(
      map(file => ({
        templatePath: FILE_TEMPLATE_PATH_LOOKUP[file],
        file
      })),
      mergeMap(processTemplateData(fileName)),
      tap(templateData => fs.writeFileSync(`${path}/${templateData.fileName}.js`, templateData.content)),
      mapTo(`${file} file has been generated`)
    )
  }
;

const mainApplication = () => {
  return promptMessage('checkbox',
    'Choose the file/s that you want to generate for your project : ',
    'file',
    ['Model', 'Route', 'Controller', 'Action'])
    .pipe(
      pluck('file'),
      mergeMap(bindFilesToFileName),
      mergeMap(processFileProduction),
      catchError(err => of(`Main application error : ${err}`))
    );
};

mainApplication().subscribe(next => console.log(next));

