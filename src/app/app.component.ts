import { Component, Renderer2, OnInit } from '@angular/core';
import { ScatterService } from './services/scatter.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Decimal } from 'decimal.js';
import { EosService } from './services/eos.service';
import * as ecc from 'eosjs-ecc';

function pubkeyValidator(control: FormControl): { [s: string]: boolean }  {
  return  { invalidPubkey : !ecc.isValidPublic(control.value)} 
}

function privatekeyValidator(control: FormControl): { [s: string]: boolean }  {
  return  { invalidPrivatekey : !ecc.isValidPrivate(control.value)} 
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  noScatter: boolean = false;
  eosHash: string;
  eosPubKey: string;
  eosAccountName: string;
  eosAuthority: string;
  accountInfoByScatter: any;

  transferForm: FormGroup;
  errorMsg: string = '';
  successTransfer: string = '';
  isTranferring: boolean = false;

  formByEosjs: FormGroup;
  errorMsg2: string = '';
  successTransfer2: string = '';
  isTranferring2: boolean = false;

  formBalance: FormGroup;
  balanceBySearching: string;

  formAccountInfo: FormGroup;
  accountInfo: any;

  formNewaccount: FormGroup;
  isCreating: boolean = false;
  errNewaccount: string = '';
  successNewaccount: string = '';

  constructor(private scatterService: ScatterService, private renderer: Renderer2, fb: FormBuilder, private eosService: EosService) {
    renderer.listen('document', 'scatterLoaded', () => {
      this.scatterService.load();
      this.noScatter = true
    });

    this.transferForm = fb.group({
      'toAccount': ['', Validators.required],
      'toAmount': ['', Validators.required],
      'toMemo': ['']
    })

    this.formByEosjs = fb.group({
      'fromAccount': ['', Validators.required],
      'privateKey': ['', Validators.required, privatekeyValidator],
      'toAccount': ['', Validators.required],
      'toAmount': ['', Validators.required],
      'toMemo': ['']
    })

    this.formBalance = fb.group({
      'accountName': ['', Validators.required]
    })

    this.formAccountInfo = fb.group({
      'accountName': ['', Validators.required]
    })

    this.formNewaccount = fb.group({
      'name': ['', Validators.required],
      'creator': ['', Validators.required],
      'pubkey': ['', 
        Validators.compose([Validators.required, pubkeyValidator])],
      'privatekey': ['', 
        Validators.compose([Validators.required, privatekeyValidator])],
      'ram': ['', Validators.required],
      'stake_net_quantity': ['', Validators.required],
      'stake_cpu_quantity': ['', Validators.required],
    })
  }

  ngOnInit() {
    console.log("ecc", ecc)
  }


  // sscatter 관련

  login() {
    this.scatterService.login().then((identity) => {
      if (!identity) return false
      console.log("identity", identity);
      this.scatterService.scatter.useIdentity(identity)
      this.eosAccountName = identity.accounts[0].name;
      this.eosAuthority = identity.accounts[0].authority;
      this.eosHash = identity.hash;
      this.eosPubKey = identity.publicKey;
      this.getAccountInfo(this.eosAccountName, 2)
    }, error => {
      console.log("failed", error)
      // scatter에 연결된 계정이 없을 때
      // {type: "identity_rejected", message: "User rejected the provision of an Identity", code: 402, isError: true}
    })
  }

  logout() {
    this.scatterService.logout();
    this.eosHash = "";
    this.eosPubKey = "";
    this.eosAccountName = "";
    this.eosAuthority = "";
    this.accountInfoByScatter = null
  }

  async transfer(value) {
    this.errorMsg = '';
    this.successTransfer = ''
    value.toAmount = this.set4Decimal(value.toAmount)

    this.isTranferring = true;

    try {
      const transaction = await this.scatterService.transfer(value.toAccount, value.toAmount, value.toMemo)
      console.log("transfer", transaction)
      // {broadcast: true, transaction: {…}, transaction_id: "27c2e478f5fea7309042ec230c3529ceefd5bcd4adb4dad96bedcd83c623922f", processed: {…}, returnedFields: {…}}
      this.successTransfer = transaction.transaction_id
      this.isTranferring = false
      this.transferForm.reset();
    } catch (error) {
      console.log("transfer error", error)
      this.errorMsg = JSON.parse(error).error.what
      this.isTranferring = false
      // chainId mismatch error ==> https://github.com/EOSEssentials/Scatter/issues/87
      // pass chainId into the options parameter of scatter.eos(...,{chainId})
      // {"code":500,"message":"Internal Service Error","error":{"code":3090003,"name":"unsatisfied_authorization","what":"provided keys, permissions, and delays do not satisfy declared authorizations","details":[]}

      // deny 했을 경우
      // {type: "signature_rejected", message: "User rejected the signature request", code: 402, isError: true}

      // 수량을 1.0000 소수점 4자리까지 맞추지 않았을 때,
      // transfer error {"code":500,"message":"Internal Service Error","error":{"code":3050003,"name":"eosio_assert_message_exception","what":"eosio_assert_message assertion failure","details":[]}}

      // eosmetal.io로 post요청 보냈을 때, 아래 에러나서 eosnewyork으로 변경
      //  {"code":400,"message":"Bad Request","error":{"code":3040005,"name":"expired_tx_exception","what":"Expired Transaction","details":[]}}
    }
  }

  set4Decimal(value) {
    return new Decimal(value).mul(Math.pow(10, 4)).floor().div(Math.pow(10, 4)).toFixed(4)
  }

  async transferByEosjs(value) {
    this.isTranferring2 = true;
    try {
      const res: any = await this.eosService.transfer(value.fromAccount, value.toAccount, value.toAmount, value.toMemo, value.privateKey)
      console.log("transferByEosjs", res)
      this.successTransfer2 = res.transaction_id
      this.isTranferring2 = false
      this.formByEosjs.reset()
    } catch (error) {
      console.log("transferByEosjs error", error)
      this.errorMsg2 = error.toString()
      this.isTranferring2 = false
    }
  }

  async getBalanceBySearching(account) {
    try {
      this.balanceBySearching = await this.eosService.getBalance(account)
      this.formBalance.reset()
    } catch (err) {
      console.log("app.component.ts getBalanceBySearching error", err)
    }
  }

  async getAccountInfo(account, type) {
    try {
      const res = await this.eosService.getAccount(account)
      res.core_liquid_balance = res.core_liquid_balance.replace(" EOS", "")
      res.total_balance = res.core_liquid_balance
      res.staked = 0;
      res.refund = 0;
      if (res.voter_info) {
        if (res.voter_info.staked) {
          res.total_balance = new Decimal(res.voter_info.staked).div(Math.pow(10, 4)).add(res.core_liquid_balance)
          res.staked = new Decimal(res.voter_info.staked).div(Math.pow(10, 4))
        }

        if (res.voter_info.refund)
          res.refund = new Decimal(res.voter_info.refund).div(Math.pow(10, 4))
      }

      if (type === 1)
        this.accountInfo = res;
      else
        this.accountInfoByScatter = res
      console.log("getAccountInfo", res)
      return res;
    } catch (err) {
      console.log("getAccountInfo err", err)
    }
  }

  async createNewAccount(value) {
    try {
      this.isCreating = true;
      const res = await this.eosService.createNewAccount(value.name, value.creator, value.pubkey, value.privatekey,
        value.ram, value.stake_net_quantity, value.stake_cpu_quantity)
      console.log("createNewAccmount", res)
      this.successNewaccount = res.toString()
      this.isCreating = false;
    } catch (error) {
      console.log("createNewAccmount", error)
      this.errNewaccount = error.toString()
      this.isCreating = false;
    }
  }
}
