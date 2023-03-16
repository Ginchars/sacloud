const shell = require('shelljs')

const default_cluster = "cluster_stg_2";
const customerInput = process.argv.slice(3)[0];

clusterFromInput = () => {
    let cluster = default_cluster

    if (typeof customerInput === "undefined") {
        cluster = default_cluster
    } else {
        switch (true) {
            case customerInput.includes('stg'):
            case customerInput.includes('preprod'):
                break;
            case customerInput.includes('prd'):
            case customerInput.includes('prod'):
                cluster = "cluster_prod_1"
                break;
            case customerInput.includes('dev'):
                cluster = "cluster_dev_1"
                break;        
        }
    }

    return cluster
}

module.exports = {
    clusterFromInput
}