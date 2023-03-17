#! /usr/bin/env node
const { program } = require('commander')
const chalk = require('chalk')
const { dbpass, createDbDump } = require('./commands/db')
const { projectPods, sshProjectPods } = require('./commands/pods')
const { executeCliCommand } = require('./commands/mcli')

process.on('SIGINT', function() {
        process.exit();
});

program
    .command('db-pass')
    .arguments('<projectName>')
    .usage(`${chalk.green('<projectName>')}`)
    .description('Get DB Pass')
    .action(dbpass);

program
    .command('db-dump')
    .arguments('<projectName>')
    .option('-f, --full-dump', 'Do full DB dump')
    .option('-n, --new-dump', 'Create a new dump file even if there is one')
    .option('-v, --verbose', 'Verbose - will print kube commands executed')
    .usage(`${chalk.green('<projectName>')} [options -f|--full-dump -n|--new-dump]`)
    .combineFlagAndOptionalValue(true)
    .description('Get DB Dump')
    .action(createDbDump);

program
    .command('pod-list')
    .arguments('<projectName>')
    .option('-t, --type <type>', 'Get Specific Pods')
    .option('-v, --verbose', 'Verbose - will print kube commands executed')
    .usage(`${chalk.green('<projectName>')} [options -t|--type <type>]`)
    .description('Get Project Pod List')
    .action(projectPods);

program
    .command('ssh-pods')
    .arguments('<projectName>')
    .option('-t, --type <type>', 'SSH In specific project pods', 'web')
    .option('-v, --verbose', 'Verbose - will print kube commands executed')
    .usage(`${chalk.green('<projectName>')} [options -t|--type <type>|default:web]`)
    .description('SSH in projects pods - defaults to web')
    .action(sshProjectPods);

program
    .command('m-cli')
    .arguments('<projectName>')
    .option('-c, --command <command>', 'Magento CLI command')
    .usage(`${chalk.green('<projectName>')} [options -c|--command <command>]`)
    .description('Execute Magento CLI command on project cron pod')
    .action(executeCliCommand);

program
    .usage('Example usage for commands\n1. sacloud db-pass jdgroup-m23-stg => gives projects DB pass\n2. sacloud db-dump jdgroup-m23-stg [--full-dump|--new-dump] => Creates and downloads projects DB\n3. sacloud pod-list jdgroup-m23-stg [-t|--type] => Returns list of all or filtered pods for project\n4. sacloud ssh-pods jdgroup-m23-stg [-t|--type] => SSH in to pod(s)\n5. sacloud m-cli jdgroup-m23-stg -c|--command indexer:status => Returns magneto cli output')
    .parse()