const shell = require('shelljs')
const chalk = require('chalk')
const { clusterFromInput } = require('../utils/cluster')
const { getProjectPodList } = require('./pods')
const yesno = require('yesno')

let _cluster = clusterFromInput()

const executeCliCommand = async (projectName, options) => {
    let cronPodName = getProjectPodList(projectName, 'cron').trim();
    
    if (!_validateOptions(options)) {
        console.log(chalk.redBright('Missing Magento CLI command'))
        process.exit()
    } else if (cronPodName === "") {
        console.log(chalk.redBright('Could not get pod to run CLI command'))
        process.exit()
    } else {
        const doCli = await yesno({question: `Do you want to execute ${options.command} on ${projectName} [y/yes, n/no]:`})

        if (doCli) {
            console.log(chalk.greenBright(`Executing`), options.command)
            _executeCliCommand(projectName, cronPodName, options.command)
        }
    }
}

const _executeCliCommand = (projectName, cronPodName, command) => {
    let baseCommand = `kubectl exec --context ${_cluster} --namespace ${projectName} -it ${cronPodName}`
    let cliCommand = `${baseCommand} -- /bin/bash -c "clear; sudo -u www-data bin/magento ${command}"`
    let output = shell.exec(cliCommand, {async:false, silent:true}).stdout

    console.log(output)
}

const _validateOptions = (options) => {
    let isValid = false
    isValid = (typeof options.command !== "undefined" && options.command !== "")

    return isValid;
}

module.exports = {
    executeCliCommand
}