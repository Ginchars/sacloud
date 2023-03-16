const fs = require('fs')
const os = require('os')
const prompt = require('prompt')
const base64 = require('nodejs-base64-converter')
const configPath = `${os.homedir()}/.sacloud`
const configFile = `${configPath}/config.json`

const _configExists = () => {
    return (fs.existsSync(configFile) && fs.existsSync(configPath))
}

const readConfigFile = () => {
    let rawData = fs.readFileSync(configFile)

    return JSON.parse(rawData)
}

const writeConfigFile = (data) => {
    fs.writeFile(configFile, data, (err) => {
        return JSON.parse(data)
    })
}

const readAndValidateConfig = () => {
    if (!_configExists()) {
        if (!fs.existsSync(configPath)) {
            fs.mkdirSync(configPath)
        }

        prompt.start();
        prompt.get(['email','token'], function (err, result) {
            let configData = {
                'token': base64.encode(`${result.email}:${result.token}`)
            }
            return writeConfigFile(JSON.stringify(configData))
        });
    } else {
       return readConfigFile()
    }
}

module.exports = {
    readConfigFile,
    writeConfigFile,
    readAndValidateConfig,
    _configExists
}