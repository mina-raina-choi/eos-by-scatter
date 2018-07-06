import { Injectable } from "@angular/core";
import * as Eos from 'eosjs';
import { environment } from '../../environments/environment';

@Injectable()
export class ScatterService {
    identity: any;
    eos: any;
    scatter: any;
    network: any;


    load() {
        console.log(this.identity);
        this.scatter = (<any>window).scatter;
        if (this.identity) {
            this.scatter.useIdentity(this.identity.hash);
        }

        // eosmetal에서 제공하는 이오스 네트워크 => 우리 EOS 노드 네트워크 정보로 바꿔야겠지? 아니면 eosmetal을 사용?

        this.network = {
            blockchain: 'eos',
            host: environment.eosHost,
            port: environment.eosPort,
            chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
        };
        this.eos = this.scatter.eos(this.network, Eos, {}, environment.eosProtocol);
    }

    login(successCallback, errorCallbak) {
        const requirements = { accounts: [this.network] };
        this.scatter.getIdentity(requirements)
            .then(identity => {
                if (!identity) return errorCallbak(null)
                this.identity = identity;
                this.scatter.useIdentity(identity.hash);
                successCallback();
            }, error => {
                errorCallbak(error);
            })
    }

    logout() {
        console.log("logout this.scatter", this.scatter)
        console.log("getIdentity", this.scatter.getIdentity())
        try {
            this.scatter.forgetIdentity().then(() => { this.identity = null });
        } catch (error) {
            console.log("logout error", error)
        }
    }
}