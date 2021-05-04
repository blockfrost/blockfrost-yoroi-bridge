import { txsUtxoForAddresses, accountRegistrationHistory } from './methods/txsUtxoForAddresses';
//accountRegistrationHistory

//export { a };

console.log('result:');
async function run1() {
  const result = await txsUtxoForAddresses([
    'addr1qxpslum9vwzqjsgfcfypd09xu36f3y4z2txwdswhzqqr2jf9k098h2llv0j7nct56hp9q7j8wxyrz0w7ajsznehn9d8scraf43',
  ]);

  console.log('Tralala', result);
  //accountRegistrationHistory(['stake1u9xzs8gkg8sdmn0ry28qkcjcmtv7jd7nnc8sxgz0sqkw48gkkngdt']);
  //accountRegistrationHistory(['stake1uxdeguk9wx7arnm9dpxmprmhjujqzkww99z0puzzvjpx34sy0nknh']);
}

async function run2() {
  const result = await accountRegistrationHistory([
    'addr1qxpslum9vwzqjsgfcfypd09xu36f3y4z2txwdswhzqqr2jf9k098h2llv0j7nct56hp9q7j8wxyrz0w7ajsznehn9d8scraf43',
  ]);

  console.log('Tralala', result);
  //accountRegistrationHistory(['stake1u9xzs8gkg8sdmn0ry28qkcjcmtv7jd7nnc8sxgz0sqkw48gkkngdt']);
  //accountRegistrationHistory(['stake1uxdeguk9wx7arnm9dpxmprmhjujqzkww99z0puzzvjpx34sy0nknh']);
}

run1();
run2();
