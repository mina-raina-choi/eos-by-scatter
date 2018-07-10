import { Injectable } from "@angular/core";
import * as Eos from 'eosjs';

@Injectable()
export class EosService {
    eos: any;

    constructor() {
    }

    connectNode(config) {
        this.eos = Eos(config)
        console.log("this.eos", this.eos, )
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

            this.connectNode(config)

            // this.eos = Eos(config)
            // console.log("this.eos", this.eos, )
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

    async getBalance(myaccount) {
        const config = {
            chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
            httpEndpoint: 'https://api.eosnewyork.io:443',
            expireInSeconds: 60,
            broadcast: true,
            verbose: false, // API activity
            sign: true
        }
        try {
            this.connectNode(config);
            const res = await this.eos.getCurrencyBalance({
                code: 'eosio.token',
                symbol: 'EOS',
                account: myaccount
            })
            console.log("getBalance", res)
            return res[0]
        } catch (error) {
            console.log("getBalance error", error)

            //  this.eos.getCurrencyBalance(myaccount, myaccount, 'EOS')
            // {"code":500,"message":"Internal Service Error","error":{"code":3060003,"name":"contract_table_query_exception","what":"Contract Table Query Exception","details":[]}}

            // this.eos.getCurrencyBalance({ code: '', symbol: 'EOS', account: myaccount })
            // {"code":500,"message":"Internal Service Error","error":{"code":3060002,"name":"account_query_exception","what":"Account Query Exception","details":[]}}

            // this.eos.getCurrencyBalance({ code: 'EOS', symbol: 'EOS', account: myaccount })
            // {"code":500,"message":"Internal Service Error","error":{"code":3010001,"name":"name_type_exception","what":"Invalid name","details":[]}}
        }
    }
}