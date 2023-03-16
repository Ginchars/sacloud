const shell = require('shelljs')
const chalk = require('chalk');
const { clusterFromInput } = require('../utils/cluster');
const _cluster = clusterFromInput()

/*
    GET PROJECT PODS
*/
const projectPods = (projectName, options) => {
    let message = `Fetching pod list for ${projectName}`
    let type = ''

    if (typeof options.type !== "undefined") {
        message += ` type: ${options.type}`
        type = options.type
    }

    console.log(chalk.greenBright(message))
    console.log(getProjectPodList(projectName, type))
}

const getProjectPodList = (projectName, type) => {
    let command = `kubectl get pods --namespace ${projectName} --context ${_cluster} -o=jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'`

    if (type !== "") {
        command += ` | grep ${type}`
    }

    let output = shell.exec(command, {async: false, silent: true}).stdout

    return output
}

/*
    SSH IN PODS
*/

const sshProjectPods = (projectName, options) => {
    let message = `Trying to ssh in ${projectName} ${options.type} pods`
    let podList = getProjectPodList(projectName, options.type)

    if (podList !== "") {
        podList = podList.split(/\r?\n/)

        podList.forEach(pod => {
            if (pod !== "") {
                console.log(chalk.greenBright('Opening tab for:'), pod)
                _sshInPod(projectName, pod)
            }
        });
    }
}

const _sshInPod = (projectName, pod) => {
    //kubectl exec --namespace $1 --cluster $CLUSTER -it ${project_pods[i]} -- /bin/bash
    let baseCommand = `gnome-terminal --tab -- /bin/bash -c`
    let command = `${baseCommand} "kubectl exec --namespace ${projectName} --cluster ${_cluster} -it ${pod} -- /bin/bash clear;"`

    shell.exec(command, {async: false, silent: false})
}

module.exports = {
    projectPods,
    getProjectPodList,
    sshProjectPods
}