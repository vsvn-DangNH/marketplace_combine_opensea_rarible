import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signers';
import { BigNumber } from 'ethers';
import { web3 } from 'hardhat';
import { Address } from 'hardhat-deploy/dist/types';

const makeOrder = (
  exchange: Address,
  isMaker: boolean,
  accounts: SignerWithAddress[],
  target: Address,
  calldata: string,
  replacementPattern: string,
) => ({
  exchange: exchange,
  maker: accounts[0].address,
  taker: accounts[0].address,
  makerRelayerFee: 0,
  takerRelayerFee: 0,
  makerProtocolFee: 0,
  takerProtocolFee: 0,
  feeRecipient: isMaker ? accounts[0].address : '0x0000000000000000000000000000000000000000',
  feeMethod: 0,
  side: 0,
  saleKind: 0,
  target: target,
  howToCall: 0,
  calldata: calldata,
  replacementPattern: replacementPattern,
  staticTarget: '0x0000000000000000000000000000000000000000',
  staticExtradata: '0x',
  paymentToken: accounts[0].address,
  basePrice: BigNumber.from(0),
  extra: 0,
  listingTime: 0,
  expirationTime: 0,
  salt: BigNumber.from(Math.floor(Math.random() * 1000)),
});
type Order = ReturnType<typeof makeOrder>;

const hashOrder = (order: Order) => {
  const hash = web3.utils.soliditySha3(
    { type: 'address', value: order.exchange },
    { type: 'address', value: order.maker },
    { type: 'address', value: order.taker },
    { type: 'uint', value: BigNumber.from(order.makerRelayerFee).toString() },
    { type: 'uint', value: BigNumber.from(order.takerRelayerFee).toString() },
    { type: 'uint', value: BigNumber.from(order.takerProtocolFee).toString() },
    { type: 'uint', value: BigNumber.from(order.takerProtocolFee).toString() },
    { type: 'address', value: order.feeRecipient },
    { type: 'uint8', value: order.feeMethod.toString() },
    { type: 'uint8', value: order.side.toString() },
    { type: 'uint8', value: order.saleKind.toString() },
    { type: 'address', value: order.target },
    { type: 'uint8', value: order.howToCall.toString() },
    { type: 'bytes', value: order.calldata },
    { type: 'bytes', value: order.replacementPattern },
    { type: 'address', value: order.staticTarget },
    { type: 'bytes', value: order.staticExtradata },
    { type: 'address', value: order.paymentToken },
    { type: 'uint', value: BigNumber.from(order.basePrice).toString() },
    { type: 'uint', value: BigNumber.from(order.extra).toString() },
    { type: 'uint', value: BigNumber.from(order.listingTime).toString() },
    { type: 'uint', value: BigNumber.from(order.expirationTime).toString() },
    { type: 'uint', value: order.salt.toString() },
  );
  if (hash) {
    return hash.toString();
  } else {
    throw new Error('Failed to hash');
  }
};

export { makeOrder, hashOrder };
