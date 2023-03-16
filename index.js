#! /usr/bin/env node
const { program } = require('commander')
const { dbpass, createDbDump } = require('./commands/db')
const { projectPods, sshProjectPods } = require('./commands/pods')
const { executeCliCommand } = require('./commands/mcli')

process.on('SIGINT', function() {
        process.exit();
});

program
    .command('db-pass')
    .arguments('<projectName>')
    .description('Get DB Pass')
    .action(dbpass);

program
    .command('db-dump')
    .arguments('<projectName>')
    .description('Get DB Dump')
    .action(createDbDump);

program
    .command('pod-list')
    .arguments('<projectName>')
    .option('-t, --type <type>', 'Get Specific Pods')
    .description('Get Project Pod List')
    .action(projectPods);

program
    .command('ssh-pods')
    .arguments('<projectName>')
    .option('-t, --type <type>', 'SSH In specific project pods', 'web')
    .description('SSH in project pods')
    .action(sshProjectPods);

program
    .command('m-cli')
    .arguments('<projectName>')
    .option('-c, --command <command>', 'Magento CLI command')
    .description('Execute Magento CLI command on project cron pod')
    .action(executeCliCommand);

program.parse()