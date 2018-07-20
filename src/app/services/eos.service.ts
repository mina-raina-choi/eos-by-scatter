import { Injectable } from "@angular/core";
import * as Eos from 'eosjs';
import Decimal from "decimal.js";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class EosService {
    eos: any;
    CONFIG = {
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
        httpEndpoint: 'https://api.eosnewyork.io:443',
        expireInSeconds: 60,
        broadcast: true,
        verbose: false, // API activity
        sign: true
    }

    constructor(private http: HttpClient) {
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
            const DecimalPad = Eos.modules.format.DecimalPad
            const precision = 4
            console.log("eos.service", fromAccount, toAccount, DecimalPad(toAmount, precision) + ' EOS', toMemo)

            return this.eos.transfer(fromAccount, toAccount, DecimalPad(toAmount, precision) + ' EOS', toMemo)
        } catch (error) {
            const err = error.toString().replace("AssertionError ", "")
            throw err
        }
    }

    getInfo() {
        this.connectNode(this.CONFIG)
        this.eos.getInfo({}).then(res => {
            console.log("getInfo", res)
        }, error => {
            console.log("getInfo error", error)
        })
    }

    getAccount(account_name) {
        this.connectNode(this.CONFIG)
        return this.eos.getAccount(account_name)
    }


    getKeyAccounts(pubKey) {
        this.connectNode(this.CONFIG)
        this.eos.getKeyAccounts({ "public_key": pubKey }).then(res => {
            console.log("getKeyAccounts", res, res.account_names[0])
        }, err => {
            console.log("getKeyAccounts", err)
        })
    }

    async getBalance(myaccount) {
        try {
            this.connectNode(this.CONFIG);
            const res = await this.eos.getCurrencyBalance({
                code: 'eosio.token',
                symbol: 'EOS',
                account: myaccount
            })
            console.log("getBalance", res)
            return res[0]
        } catch (error) {
            throw error
            //  this.eos.getCurrencyBalance(myaccount, myaccount, 'EOS')
            // {"code":500,"message":"Internal Service Error","error":{"code":3060003,"name":"contract_table_query_exception","what":"Contract Table Query Exception","details":[]}}

            // this.eos.getCurrencyBalance({ code: '', symbol: 'EOS', account: myaccount })
            // {"code":500,"message":"Internal Service Error","error":{"code":3060002,"name":"account_query_exception","what":"Account Query Exception","details":[]}}

            // this.eos.getCurrencyBalance({ code: 'EOS', symbol: 'EOS', account: myaccount })
            // {"code":500,"message":"Internal Service Error","error":{"code":3010001,"name":"name_type_exception","what":"Invalid name","details":[]}}
        }
    }

    createNewAccount(name, creator, pubKey, privateKey, ram, stake_net_quantity, stake_cpu_quantity) {
        const pubkey = pubKey
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

        const DecimalPad = Eos.modules.format.DecimalPad
        const precision = 4
        const ram_bytes = new Decimal(ram).mul(1024).toNumber()

        console.log("createNewAccount", name, creator, pubKey, privateKey, ram_bytes, DecimalPad(stake_net_quantity, precision), DecimalPad(stake_cpu_quantity, precision))
        return this.eos.transaction(tr => {
            console.log("tr", tr)
            tr.newaccount({
                creator: creator,
                name: name,
                owner: pubkey,
                active: pubkey
            })

            tr.buyrambytes({
                payer: creator,
                receiver: name,
                bytes: ram_bytes
            })

            tr.delegatebw({
                from: creator,
                receiver: name,
                stake_net_quantity: DecimalPad(stake_net_quantity, precision) + ' EOS',
                stake_cpu_quantity: DecimalPad(stake_cpu_quantity, precision) + ' EOS',
                transfer: 0
            })
        })
    }

    getTableRows() {
        this.connectNode(this.CONFIG)
        // this.eos.getAbi('eos2minachoi').then(res => {
        //     console.log("getAbi", res)
        // }, err => {
        //     console.log("getAbi err", err)
        // })

        // this.eos.getActions('eos2minachoi').then(res => {
        //     console.log("getActions", res)
        // }, err => {
        //     console.log("getActions err", err)
        // })

        // this.eos.getTransaction("002fe54855303655439e4a5c34630e1a842584a457d9c1c15536cc7e6ab9f558").then(res=> {
        //     console.log('getTx', res)
        // }, err => {
        //     console.log("getTx err", err)
        // })

        this.eos.getTableRows({
            // /opt/EOSmainNet/cleos.sh get table eosio eosio rammarket
            // code:'CONTRACT_NAME',
            // scope:'SCOPE_ACCOUNT (Normally contract)',
            // table:'TABLE_NAME',
            code:"eosio",
            scope: 'eosio',
            table:'rammarket',
            json: true,
        }).then(function(res) {
            console.log(res.rows[0]);
        }, err => {
            console.log(err)
        });
    }

    getTxInfo(txid) {
        this.connectNode(this.CONFIG)
        return this.eos.getTransaction(txid)
    }

    async getBalanceByNodejs(body) {
        const HEADERS = new HttpHeaders().set('Content-Type', 'application/json')
        let url = `http://localhost:4040/getCurrencyBalance`;
        let response = await this.http.post(url, JSON.stringify(body), { headers : HEADERS }).toPromise();;
        return response
    }
}