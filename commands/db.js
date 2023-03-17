const shell = require('shelljs')
const chalk = require('chalk')
const { clusterFromInput } = require('../utils/cluster')
const { generateDBDumpCommand } = require('../utils/db-dump')
const yesno = require('yesno')
const fs = require('fs')

let _dbPass = ''
let _dbPodName = ''
let _cluster = clusterFromInput()
let _noFile, _downloadFile = false;
let _localFilePath = '';
let _fullDump = false;
let _newDump = false;

/*
    DUMP PROJECT DB
*/
const createDbDump = async (projectName, options) => {
    _localFilePath = `${process.cwd()}/${projectName}.sql`
    const doDump = await yesno({question: `Do you want to download DB dump for project: ${projectName} [y/yes, n/no]:`})

    if (doDump) {
        console.log(chalk.greenBright(`Starting DB Dump Process (Project: ${projectName})`))
        // Init params
        _initDbDump(projectName, options)

        if (!_isValidFileAge(projectName) || _newDump) {
            console.log(chalk.redBright('0. Removing outdated external dump'))
            _removeOldDump(projectName)
            _noFile = true;
        }

        if (_noFile) { 
            console.log(chalk.whiteBright(`1. Creating external DB dump`))
            _createExternalDump(projectName)
            _downloadFile = true
        }

        if (_downloadFile || !_noFile) {
            let step = (_noFile) ? '2' : '1';
            console.log(chalk.whiteBright(`${step}. Downloading external DB Dump`))
            _downloadExternalDump(projectName)
        }

        if (fs.existsSync(`${_localFilePath}.gz`)) {
            let step = (_noFile) ? '3' : '2';
            console.log(chalk.whiteBright(`${step}. Extracting and fixing SQL File`))
            _extractAndFixFile()
        } else {
            console.log(chalk.redBright('Failed to download external DB Dump'))
        }

        if (fs.existsSync(_localFilePath)) {
            console.log(chalk.greenBright(`Successfully downloaded DB Dump for: ${projectName}`))
        }
    }
}

const _downloadExternalDump = (projectName) => {
    let dwnCommand = `kubectl --context ${_cluster} -n ${projectName} cp ${_dbPodName}:/tmp/${projectName}.sql.gz "${_localFilePath}.gz" --retries=200`

    shell.exec(dwnCommand, {async: false, silent: true})
}

const _extractAndFixFile = () => {
    let gunZip = `gunzip ${_localFilePath}.gz`
    let sedList = [
        "s/DEFINER=[^*]*\*/\*/g",
        "/@@GLOBAL.GTID_PURGED=/d",
        "s/utf8mb4_0900_ai_ci/utf8_general_ci/g",
        "s/CHARSET=utf8mb4/CHARSET=utf8/g",
        "s/utf8mb4_unicode_ci/utf8mb3_unicode_ci/g"
    ]

    shell.exec(gunZip, {async:false, silent:true})

    sedList.forEach(element => {
        shell.exec(`sed -i ${element} ${_localFilePath}`, {async:false, silent: true})
    });
}

const _createExternalDump = (projectName) => {
    let baseCommand = `kubectl exec --context ${_cluster} --namespace ${projectName} -it ${_dbPodName}`
    let mysqlDump = generateDBDumpCommand(projectName, _dbPass, _fullDump)
    let gzipFile = `gzip /tmp/${projectName}.sql`
    let dumpDbCommand = `${baseCommand} -- /bin/bash -c "${mysqlDump}"`
    let gzipFileCommand = `${baseCommand} -- /bin/bash -c "${gzipFile}"`

    let dumpOutcome = shell.exec(dumpDbCommand, {async: false, silent: true}).stdout
    let gzipOutcome = shell.exec(gzipFileCommand, {async: false, silent: true}).stdout  
}

const _initDbDump = (projectName, options) => {
    if (_dbPass === "") {
        _dbPass = getDBPassFromProject(projectName).trim()
    }

    if (_dbPodName === "") {
        _dbPodName = `moco-${projectName}-magento-0`
    }

    _fullDump = (typeof options.fullDump !== "undefined")
    _newDump = (typeof options.newDump !== "undefined")
}

const _isValidFileAge = (projectName) => {
    let fileAge = _getExportFileAge(projectName)
    let currentTime = parseInt(Date.now() / 1000)
    let isValid = (fileAge !== "")

    if (isValid) {
        let ageDays = parseInt(((currentTime - fileAge) / 86400))

        if (ageDays > 1) {
            isValid = false
        }
    }

    return isValid
}

const _removeOldDump = (projectName) => {
    let command = `kubectl exec --context ${_cluster} --namespace ${projectName} -it ${_dbPodName} -- /bin/bash -c "rm -rf /tmp/${projectName}.sql.gz"`

    shell.exec(command, {async: false, silent: true})
}

const _getExportFileAge = (projectName) => {
    let command = `kubectl exec --context ${_cluster} --namespace ${projectName} ${_dbPodName} -- stat -c %Y /tmp/${projectName}.sql.gz`
    let fileAge = shell.exec(command, {async: false, silent: true}).stdout

    return fileAge.trim()
}

/*
    GET PROJECT DB PASS
*/
const dbpass = (projectName) => {
    if (typeof projectName === "undefined") {
        console.log(
            chalk.red.bold('Missing project name')
        );
    } else {
        console.log(chalk.greenBright('Fetching ' + projectName + ' DB Pass'))
        console.log(getDBPassFromProject(projectName))
    }
}

const getDBPassFromProject = (projectName) => {
    let command = `kubectl-moco credential -u moco-admin --context ${_cluster} --namespace ${projectName} ${projectName}-magento`
    let data = shell.exec(command, {async: false, silent: true}).stdout;

    return data
}

module.exports = {
    createDbDump,
    dbpass,
    getDBPassFromProject
}