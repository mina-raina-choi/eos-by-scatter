import { Injectable } from "@angular/core";
import * as Eos from 'eosjs';

@Injectable()
export class EosService {
    eos: any;

    constructor() {
    }

    transfer(fromAccount, toAccount, toAmount, toMemo, privateKey) {
        try {
            const config = {
                chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
                keyProvider: [privateKey],
                httpEndpoint: 'https://api.eosnewyork.io:443',
                expireInSeconds: 60,
                broadcast: true,
                verbose: false, // API activity
                sign: true
            }

            this.eos = Eos(config)
            console.log("this.eos", this.eos, )
            const DecimalPad = Eos.modules.format.DecimalPad
            const precision = 4

            console.log("eos.service", fromAccount, toAccount, DecimalPad(toAmount, precision) + ' EOS', toMemo)

            return this.eos.transfer(fromAccount, toAccount, DecimalPad(toAmount, precision) + ' EOS', toMemo)
        } catch (error) {
            const err = error.toString().replace("AssertionError ", "")
            console.log("eos.service", err, error)
            throw err
        }
    }

    getInfo() {
        this.eos.getInfo({}).then(res => {
            console.log("getInfo", res)
        }, error => {
            console.log("getInfo error", error)
        })
    }
}