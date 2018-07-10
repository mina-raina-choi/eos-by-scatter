import { Component, Renderer2, OnInit } from '@angular/core';
import { ScatterService } from './services/scatter.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Decimal } from 'decimal.js';
import { EosService } from './services/eos.service';

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

  transferForm: FormGroup;
  errorMsg: string = '';
  successTransfer: string = '';
  isTranferring: boolean = false;

  formByEosjs: FormGroup;
  errorMsg2: string = '';
  successTransfer2: string = '';
  isTranferring2: boolean = false;

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
      'privateKey': [''],
      'toAccount': ['', Validators.required],
      'toAmount': ['', Validators.required],
      'toMemo': ['']
    })
  }

  ngOnInit() {
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
}
