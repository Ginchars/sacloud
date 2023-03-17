const shell = require('shelljs')
const chalk = require('chalk')
const { readConfigFile, readAndValidateConfig, _configExists } = require('../utils/config')
const yesno = require('yesno')
const https = require('https')

const jenkinsUrl = 'https://ci.vaimo.com/'

const projectBuild = async (projectName, branch) => {
    if (!_configExists()) {
        console.log(chalk.redBright('Could not find configuration detail for cli command, please enter necessary details'))
    }

    let configData = await readAndValidateConfig()

    if (typeof configData.token !== "undefined") {
        // const jr = https.request({
        //     hostname: jenkinsUrl,
        //     path: `/job/project_${projectName}/buildWithParameters?BRANCH=${branch}`,
        //     headers: {
        //         Authorization: `Basic ${configData.token}`
        //     }
        // }, jres => {
        //     jres.on(data, chunk => {})
        // })
        // jr.write();
    }
}

module.exports = {
    projectBuild
}