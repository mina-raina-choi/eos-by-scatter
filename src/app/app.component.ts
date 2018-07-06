import { Component, Renderer2, OnInit } from '@angular/core';
import { ScatterService } from './services/scatter.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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

  constructor(private scatterService: ScatterService, private renderer: Renderer2, fb: FormBuilder) {
    renderer.listen('document', 'scatterLoaded', () => {
      this.scatterService.load();
      this.noScatter = true
    });

    this.transferForm = fb.group({
      'toAccount': ['', Validators.required],
      'toAmount': ['', Validators.required],
      'toMemo': ['']
    })
  }

  ngOnInit() {
  }

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

  transfer(value) {
    this.scatterService.transfer(value.toAccount, value.toAmount, value.toMemo ).then(transaction => {
      console.log("transfer", transaction)
    }, error => {
      console.log("transfer error", error)
      // chainId mismatch error ==> https://github.com/EOSEssentials/Scatter/issues/87
      // {"code":500,"message":"Internal Service Error","error":{"code":3090003,"name":"unsatisfied_authorization","what":"provided keys, permissions, and delays do not satisfy declared authorizations","details":[]}
      // deny 했을 경우
      // {type: "signature_rejected", message: "User rejected the signature request", code: 402, isError: true}
      // transfer error {"code":500,"message":"Internal Service Error","error":{"code":3050003,"name":"eosio_assert_message_exception","what":"eosio_assert_message assertion failure","details":[]}}
    });
  }

  getInfo() {
    this.scatterService.getInfo().then((res)=> {
      console.log("getInfo", res)
    }, error => {
      console.log("getInfo error", error)
    })
  }
}
