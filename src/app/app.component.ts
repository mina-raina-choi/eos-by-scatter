import { Component, Renderer2, OnInit } from '@angular/core';
import { ScatterService } from './services/scatter.service';

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

  constructor(private scatterService: ScatterService, private renderer: Renderer2) {
    renderer.listen('document', 'scatterLoaded', () => {
      this.scatterService.load();
      this.noScatter = true
    }
    );
  }

  ngOnInit() {
    if (typeof (<any>window).scatter === "undefined") {

    }
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

  async logout() {
    this.scatterService.logout();
    this.eosHash = "";
    this.eosPubKey = "";
    this.eosAccountName = "";
    this.eosAuthority = "";
  }
}
