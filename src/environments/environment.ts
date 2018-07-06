// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: '//localhost',
  eosHost: 'node2.liquideos.com',
  eosPort: 8883,
  eosProtocol: 'https',
};

// http://bp.cryptolions.io:8888
// https://api.eosnewyork.io:443
// https://api.eosdetroit.io:443
// https://node2.liquideos.com:8883