import { Component, Renderer2 } from '@angular/core';
import { ScatterService } from './services/scatter.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  eosHash: string;
  eosPubKey: string;
  eosAccountName: string;
  eosAuthority: string;

  constructor(private scatterService: ScatterService, private renderer: Renderer2) {
    renderer.listen('document', 'scatterLoaded', () => {
        this.scatterService.load();
      }
    );
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
