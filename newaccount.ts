var Eos = require('eosjs')

const config = {
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906', 
    keyProvider: [ '5K5tuqh72toWzSLuQ4L6TCycUEGuh3d9XDciqSFytWaue5Qiyx3' ], 
    httpEndpoint: 'https://api.eosnewyork.io:443',
    verbose: false,
    broadcast: true,
    sign: true,
    expireInSeconds: 30
}

const eos = Eos(config)
// console.log("eos", eos)

// async function newAccount() {
//   const pubkey = 'EOS7MWUWTXRekhsY95LLnSrLMD2RcAVrnW9W1a3mhK1AmaWoiQzQd'
//   const creator = 'eos2minachoi'
//   const name = 'minaminamina'
//   const owner = pubkey
//   const active = pubkey

//   const res = await eos.newaccount(creator, name, owner, active);

//   const payer = 'eos2minachoi'
//   const receiver = 'minaminamina'
//   const bytes = 3072

//   const res1 = await eos.buyrambytes(payer, receiver, bytes)

//   const from = 'eos2minachoi'
//   const stake_net_quantity = '0.0100 EOS'
//   const stake_cpu_quantity = '0.0100 EOS'

//   const res2 = await eos.delegatebw(from, receiver, stake_net_quantity, stake_cpu_quantity)

//   console.log(res);
//   console.log(res1);
//   console.log(res2);
// }

const newAccount = async () => {
    try {
        const pubkey = 'EOS7MWUWTXRekhsY95LLnSrLMD2RcAVrnW9W1a3mhK1AmaWoiQzQd'
        const creator = 'eos2minachoi'
        const name = 'minaminamina'
        const owner = pubkey
        const active = pubkey
      
        const res = await eos.newaccount(creator, name, owner, active);
        console.log(res);
        const payer = 'eos2minachoi'
        const receiver = 'minaminamina'
        const bytes = 3072
      
        const res1 = await eos.buyrambytes(payer, receiver, bytes)
        console.log(res1);
        const from = 'eos2minachoi'
        const stake_net_quantity = '0.0100 EOS'
        const stake_cpu_quantity = '0.0100 EOS'
      
        const res2 = await eos.delegatebw(from, receiver, stake_net_quantity, stake_cpu_quantity)
        console.log(res2);
    
        return res2;
    } catch (err) {
        throw err
    }
}


const createNew = async () => {
    try {
        const res = await newAccount();
        console.log("res", res);
    } catch (error) {
        console.log("error", error)
    }
}

createNew()
