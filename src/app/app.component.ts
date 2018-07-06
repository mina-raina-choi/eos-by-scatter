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
    this.scatterService.login(() => {
      console.log("success",  this.scatterService.identity)
      this.eosAccountName = this.scatterService.identity.accounts[0].name;
      this.eosAuthority = this.scatterService.identity.accounts[0].authority;
      this.eosHash = this.scatterService.identity.hash;
      this.eosPubKey = this.scatterService.identity.publicKey;
    }, () => {
      console.log("failed")
    })
  }

  logout() {
    this.scatterService.logout();
  }
}
