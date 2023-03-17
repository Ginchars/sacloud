#!/bin/bash

reset='\033[0m'
BRed='\033[1;31m'
BGreen='\033[1;32m'

validateSystem() {
    echo -e "${BGreen}Checking system for dependencies${reset}"
    programList=("kubectl" "kubectl-moco" "kubectx" "node" "npm")

    for program in ${programList[@]}; do
        assertProgram $program
    done

    installTools
}

installTools() {
    if [[ ! -x "$(command -v sacloud)" ]]; then
        echo -e "${BGreen}Install tools.${reset} May require sudo password"
        sudo npm i -g
    else
        echo -e "${BGreen}Already installed.${reset}"
        echo "Usage: sacloud [command] <projectName> [options]"
    fi
}

assertProgram () {
    if [[ ! -x "$(command -v $1)" ]]; then
        echo -e "${BRed}$1${reset} missing, please install and try again"
        exit -1
    else
        echo -e "${BGreen}$1${reset} found"
    fi
}

validateSystem