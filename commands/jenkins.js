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
        https.get('https://jsonplaceholder.typicode.com/users', res => {
  let data = [];
  const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
  console.log('Status Code:', res.statusCode);
  console.log('Date in Response header:', headerDate);

  res.on('data', chunk => {
    data.push(chunk);
  });

  res.on('end', () => {
    console.log('Response ended: ');
    const users = JSON.parse(Buffer.concat(data).toString());

    for(user of users) {
      console.log(`Got user with id: ${user.id}, name: ${user.name}`);
    }
  });
}).on('error', err => {
  console.log('Error: ', err.message);
});
    }
}

module.exports = {
    projectBuild
}