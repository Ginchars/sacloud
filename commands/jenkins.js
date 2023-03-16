const shell = require('shelljs')
const chalk = require('chalk')
const { readConfigFile, readAndValidateConfig, _configExists } = require('../utils/config')
const yesno = require('yesno')
const jenkins = require('node-jenkins-api')

const jenkinsUrl = 'https://ci.vaimo.com/'

const projectBuild = async (projectName, branch) => {
    if (!_configExists()) {
        console.log(chalk.redBright('Could not find configuration detail for cli command, please enter necessary details'))
    }

    let configData = await readAndValidateConfig()

    if (typeof configData.email !== "undefined" || typeof configData.token !== "undefined") {
        let jenkinsApi = jenkins.init(jenkinsUrl, {token: 'Z2ludHMuc3Rpa2Fuc0B2YWltby5jb206MTEyZWQ4MzA5MmYwNTBmOTZlYTQxMWQwMTUzZmU5ZGJkZA=='})

        jenkinsApi.last_build_info(projectName, {}, function (err, data) {
            if (err){ return console.log(err); }
            console.log(data)
        })
    }
}

module.exports = {
    projectBuild
}