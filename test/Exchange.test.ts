import { expect } from 'chai';
import { describe } from 'mocha';
import { ethers, upgrades, web3 } from 'hardhat';
import {
  WyvernExchange,
  WyvernExchange__factory,
  WyvernTokenTransferProxy,
  WyvernTokenTransferProxy__factory,
  MockERC721,
  MockERC721__factory,
  WyvernProxyRegistry__factory,
  WyvernProxyRegistry,
} from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signers';
import { BigNumber, constants, Contract } from 'ethers';
import { hashOrder, makeOrder } from './utils';
import { Interface } from 'ethers/lib/utils';
const assert = require("assert");
const replacementPatternFrom =
  '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

const replacementPatternTo =
  '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000';

const replacementPatternBundleBuy =
  '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

const replacementPatternBundleSell =
  '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

describe('Exchange Test Suite', () => {
  let WyvernExchange: WyvernExchange;
  let ProxyRegistry: WyvernProxyRegistry;
  let TokenTransferProxy: WyvernTokenTransferProxy;
  let [owner, user1, user2]: SignerWithAddress[] = [];
  let EstNFT: MockERC721;
  let WyvernAtomicizer: Contract;
  const WyvernAtomicizerInterface = new Interface([
    'function atomicize(address[] calldata addrs, uint256[] calldata values, uint256[] calldata calldataLengths, bytes calldata calldatas)',
  ]);
  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();
  });
  beforeEach(async () => {
    // Deploy Est NFT
    const EstNFTFactory: MockERC721__factory = await ethers.getContractFactory('MockERC721');
    EstNFT = await EstNFTFactory.deploy();
    await EstNFT.mint(user1.address, '1');

    // Deploy Wyvern Atomicizer
    const WyvernAtomicizerFactory = await ethers.getContractFactory('WyvernAtomicizer');
    WyvernAtomicizer = await WyvernAtomicizerFactory.deploy();
    // const AtomMockFactory: AtomicizerMock__factory = await ethers.getContractFactory('AtomicizerMock');
    // AtomMock = await AtomMockFactory.deploy();

    // Deploy Proxy Registry
    const ProxyRegistryFactory: WyvernProxyRegistry__factory = await ethers.getContractFactory('WyvernProxyRegistry');
    ProxyRegistry = (await upgrades.deployProxy(ProxyRegistryFactory, [1], {
      initializer: '__WyvernProxyRegistry_init',
    })) as WyvernProxyRegistry;
    // Deploy Token Transfer Proxy
    const TokenTransferProxyFactory: WyvernTokenTransferProxy__factory = await ethers.getContractFactory(
      'WyvernTokenTransferProxy',
    );
    TokenTransferProxy = await TokenTransferProxyFactory.deploy(ProxyRegistry.address);

    // Deploy Wyvern Exchange
    const WyvernExchangeFactory: WyvernExchange__factory = await ethers.getContractFactory('WyvernExchange');
    WyvernExchange = (await upgrades.deployProxy(
      WyvernExchangeFactory,
      [ProxyRegistry.address, TokenTransferProxy.address, owner.address, user1.address],
      { initializer: '__WyvernExchange_init' },
    )) as WyvernExchange;
    await ProxyRegistry.startGrantAuthentication(WyvernExchange.address);
  });
  it('should properly upgrade exchange contract', async () => {
    const ExchangeV2Facotry = await ethers.getContractFactory('ExchangeUpgradeV2');
    // console.log('Exchange Address 1:', WyvernExchange.address);
    const ExchangeV2 = await upgrades.upgradeProxy(WyvernExchange.address, ExchangeV2Facotry);
    await ExchangeV2.createTest('shouldBeSaved');
    const testMappingResultV2 = await ExchangeV2.testMapping('shouldBeSaved');
    expect(testMappingResultV2).to.equal(true);
    // console.log('Exchange Address 2:', ExchangeV2.address);
    const ExchangeV3Facotry = await ethers.getContractFactory('ExchangeUpgradeV3');
    const ExchangeV3 = await upgrades.upgradeProxy(WyvernExchange.address, ExchangeV3Facotry);
    // console.log('Exchange Address 3:', ExchangeV3.address);
    const testMappingResultV3 = await ExchangeV3.testMapping('shouldBeSaved');
    expect(await ExchangeV3.uselessFunction()).to.equal(2);
    expect(testMappingResultV3).to.equal(true);
  });
  it('owner should be deployer', async () => {
    expect(await WyvernExchange.owner()).to.equal(owner.address);
  });
  it('should be deployed properly', async () => {
    expect(await WyvernExchange.name()).to.equal('Project Wyvern Exchange');
  });
  it('should match order hash', async () => {
    const accounts = await ethers.getSigners();
    const buy = makeOrder(WyvernExchange.address, true, accounts, ProxyRegistry.address, '0x', '0x');
    const hash = hashOrder(buy);
    const hashFromContract = await WyvernExchange.hashOrder_(
      [buy.exchange, buy.maker, buy.taker, buy.feeRecipient, buy.target, buy.staticTarget, buy.paymentToken],
      [
        buy.makerRelayerFee,
        buy.takerRelayerFee,
        buy.makerProtocolFee,
        buy.takerProtocolFee,
        buy.basePrice,
        buy.extra,
        buy.listingTime,
        buy.expirationTime,
        buy.salt,
      ],
      buy.feeMethod,
      buy.side,
      buy.saleKind,
      buy.howToCall,
      buy.calldata,
      buy.replacementPattern,
      buy.staticExtradata,
    );
    expect(hash).to.equal(hashFromContract);
  });

  describe('Offer and Accept Offer', () => {
    it('should match order', async () => {
      const accounts = await ethers.getSigners();
      EstNFT.connect(user1).setApprovalForAll(WyvernExchange.address, true);

      const buyCalldata = EstNFT.interface.encodeFunctionData('transferFrom', [
        constants.AddressZero,
        user2.address,
        '1',
      ]);
      const sellCaldata = EstNFT.interface.encodeFunctionData('transferFrom', [
        user1.address,
        constants.AddressZero,
        '1',
      ]);

      const buy = makeOrder(
        WyvernExchange.address,
        true,
        accounts,
        ProxyRegistry.address,
        buyCalldata,
        replacementPatternFrom,
      );
      buy.maker = user2.address;
      buy.taker = constants.AddressZero;
      buy.target = EstNFT.address;
      buy.makerRelayerFee = 850;
      buy.feeMethod = 1;

      const sell = makeOrder(
        WyvernExchange.address,
        false,
        accounts,
        ProxyRegistry.address,
        sellCaldata,
        replacementPatternTo,
      );
      sell.maker = user1.address;
      sell.taker = user2.address;
      sell.side = 1;
      sell.target = EstNFT.address;
      sell.feeMethod = 1;
      const buyHash = hashOrder(buy);
      const sellHash = hashOrder(sell);
      const buySig = await web3.eth.sign(buyHash, user2.address);
      const sellSig = await web3.eth.sign(sellHash, user1.address);
      const splitBuySig = ethers.utils.splitSignature(buySig);
      const splitSellSig = ethers.utils.splitSignature(sellSig);
      await expect(
        WyvernExchange.atomicMatch_(
          [
            buy.exchange,
            buy.maker,
            buy.taker,
            buy.feeRecipient,
            buy.target,
            buy.staticTarget,
            buy.paymentToken,
            sell.exchange,
            sell.maker,
            sell.taker,
            sell.feeRecipient,
            sell.target,
            sell.staticTarget,
            sell.paymentToken,
          ],
          [
            buy.makerRelayerFee,
            buy.takerRelayerFee,
            buy.makerProtocolFee,
            buy.takerProtocolFee,
            buy.basePrice,
            buy.extra,
            buy.listingTime,
            buy.expirationTime,
            buy.salt,
            sell.makerRelayerFee,
            sell.takerRelayerFee,
            sell.makerProtocolFee,
            sell.takerProtocolFee,
            sell.basePrice,
            sell.extra,
            sell.listingTime,
            sell.expirationTime,
            sell.salt,
          ],
          [
            buy.feeMethod,
            buy.side,
            buy.saleKind,
            buy.howToCall,
            sell.feeMethod,
            sell.side,
            sell.saleKind,
            sell.howToCall,
          ],
          buy.calldata,
          sell.calldata,
          buy.replacementPattern,
          sell.replacementPattern,
          buy.staticExtradata,
          sell.staticExtradata,
          [splitBuySig.v, splitSellSig.v],
          [splitBuySig.r, splitBuySig.s, splitSellSig.r, splitSellSig.s, constants.HashZero],
        ),
      ).to.emit(WyvernExchange, 'OrdersMatched');
    });

    it('should not validate order with invalid saleKind / expiration', async () => {
      const accounts = await ethers.getSigners();
      EstNFT.connect(user1).setApprovalForAll(WyvernExchange.address, true);
      const sellCaldata = EstNFT.interface.encodeFunctionData('transferFrom', [
        user1.address,
        constants.AddressZero,
        '1',
      ]);
      const sell = makeOrder(
        WyvernExchange.address,
        false,
        accounts,
        ProxyRegistry.address,
        sellCaldata,
        replacementPatternTo,
      );
      sell.maker = user1.address;
      sell.taker = user2.address;
      sell.side = 1;
      sell.saleKind = 1;
      sell.target = EstNFT.address;
      sell.feeMethod = 1;
      const sellHash = hashOrder(sell);
      const sellSig = await web3.eth.sign(sellHash, user1.address);
      const splitSellSig = ethers.utils.splitSignature(sellSig);
      let ret;
      ret = await WyvernExchange.validateOrder_(
         [
            sell.exchange,
            sell.maker,
            sell.taker,
            sell.feeRecipient,
            sell.target,
            sell.staticTarget,
            sell.paymentToken
          ],
          [
            sell.makerRelayerFee,
            sell.takerRelayerFee,
            sell.makerProtocolFee,
            sell.takerProtocolFee,
            sell.basePrice,
            sell.extra,
            sell.listingTime,
            sell.expirationTime,
            sell.salt
          ],
            sell.feeMethod,
            sell.side,
            sell.saleKind,
            sell.howToCall,
            sell.calldata,
            sell.replacementPattern,
            sell.staticExtradata,
            splitSellSig.v, splitSellSig.r, splitSellSig.s
      );
      assert.equal(ret, false, 'Order with invalid parameters validated');
    });
  });

  describe('listing and buy listing', async () => {
    it('should match order', async () => {
      const accounts = await ethers.getSigners();
      EstNFT.connect(user1).setApprovalForAll(WyvernExchange.address, true);

      const buyCalldata = EstNFT.interface.encodeFunctionData('transferFrom', [
        constants.AddressZero,
        user2.address,
        '1',
      ]);
      const sellCaldata = EstNFT.interface.encodeFunctionData('transferFrom', [
        user1.address,
        constants.AddressZero,
        '1',
      ]);

      const buy = makeOrder(
        WyvernExchange.address,
        false,
        accounts,
        ProxyRegistry.address,
        buyCalldata,
        replacementPatternFrom,
      );
      buy.maker = user2.address;
      buy.taker = user1.address;
      buy.target = EstNFT.address;
      buy.makerRelayerFee = 850;
      buy.feeMethod = 1;

      const sell = makeOrder(
        WyvernExchange.address,
        true,
        accounts,
        ProxyRegistry.address,
        sellCaldata,
        replacementPatternTo,
      );
      sell.maker = user1.address;
      sell.taker = constants.AddressZero;
      sell.side = 1;
      sell.makerRelayerFee = 850;
      sell.target = EstNFT.address;
      sell.feeMethod = 1;

      const buyHash = hashOrder(buy);
      const sellHash = hashOrder(sell);
      const buySig = await web3.eth.sign(buyHash, user2.address);
      const sellSig = await web3.eth.sign(sellHash, user1.address);
      const splitBuySig = ethers.utils.splitSignature(buySig);
      const splitSellSig = ethers.utils.splitSignature(sellSig);
      await expect(
        WyvernExchange.atomicMatch_(
          [
            buy.exchange,
            buy.maker,
            buy.taker,
            buy.feeRecipient,
            buy.target,
            buy.staticTarget,
            buy.paymentToken,
            sell.exchange,
            sell.maker,
            sell.taker,
            sell.feeRecipient,
            sell.target,
            sell.staticTarget,
            sell.paymentToken,
          ],
          [
            buy.makerRelayerFee,
            buy.takerRelayerFee,
            buy.makerProtocolFee,
            buy.takerProtocolFee,
            buy.basePrice,
            buy.extra,
            buy.listingTime,
            buy.expirationTime,
            buy.salt,
            sell.makerRelayerFee,
            sell.takerRelayerFee,
            sell.makerProtocolFee,
            sell.takerProtocolFee,
            sell.basePrice,
            sell.extra,
            sell.listingTime,
            sell.expirationTime,
            sell.salt,
          ],
          [
            buy.feeMethod,
            buy.side,
            buy.saleKind,
            buy.howToCall,
            sell.feeMethod,
            sell.side,
            sell.saleKind,
            sell.howToCall,
          ],
          buy.calldata,
          sell.calldata,
          buy.replacementPattern,
          sell.replacementPattern,
          buy.staticExtradata,
          sell.staticExtradata,
          [splitBuySig.v, splitSellSig.v],
          [splitBuySig.r, splitBuySig.s, splitSellSig.r, splitSellSig.s, constants.HashZero],
        ),
      ).to.emit(WyvernExchange, 'OrdersMatched');
    });
  });

  describe('Aunction and Bid', async () => {
    it('should match order', async () => {
      const accounts = await ethers.getSigners();
      EstNFT.connect(user1).setApprovalForAll(WyvernExchange.address, true);

      const buyCalldata = EstNFT.interface.encodeFunctionData('transferFrom', [
        constants.AddressZero,
        user2.address,
        '1',
      ]);
      const sellCaldata = EstNFT.interface.encodeFunctionData('transferFrom', [
        user1.address,
        constants.AddressZero,
        '1',
      ]);

      const buy = makeOrder(
        WyvernExchange.address,
        true,
        accounts,
        ProxyRegistry.address,
        buyCalldata,
        replacementPatternFrom,
      );
      buy.maker = user2.address;
      buy.taker = user1.address;
      buy.target = EstNFT.address;
      buy.makerRelayerFee = 850;
      buy.feeMethod = 1;

      const sell = makeOrder(
        WyvernExchange.address,
        false,
        accounts,
        ProxyRegistry.address,
        sellCaldata,
        replacementPatternTo,
      );
      sell.maker = user1.address;
      sell.taker = user2.address;
      sell.side = 1;
      sell.makerRelayerFee = 850;
      sell.target = EstNFT.address;
      sell.feeMethod = 1;

      const buyHash = hashOrder(buy);
      const sellHash = hashOrder(sell);
      const buySig = await web3.eth.sign(buyHash, user2.address);
      const sellSig = await web3.eth.sign(sellHash, user1.address);
      const splitBuySig = ethers.utils.splitSignature(buySig);
      const splitSellSig = ethers.utils.splitSignature(sellSig);
      await expect(
        WyvernExchange.atomicMatch_(
          [
            buy.exchange,
            buy.maker,
            buy.taker,
            buy.feeRecipient,
            buy.target,
            buy.staticTarget,
            buy.paymentToken,
            sell.exchange,
            sell.maker,
            sell.taker,
            sell.feeRecipient,
            sell.target,
            sell.staticTarget,
            sell.paymentToken,
          ],
          [
            buy.makerRelayerFee,
            buy.takerRelayerFee,
            buy.makerProtocolFee,
            buy.takerProtocolFee,
            buy.basePrice,
            buy.extra,
            buy.listingTime,
            buy.expirationTime,
            buy.salt,
            sell.makerRelayerFee,
            sell.takerRelayerFee,
            sell.makerProtocolFee,
            sell.takerProtocolFee,
            sell.basePrice,
            sell.extra,
            sell.listingTime,
            sell.expirationTime,
            sell.salt,
          ],
          [
            buy.feeMethod,
            buy.side,
            buy.saleKind,
            buy.howToCall,
            sell.feeMethod,
            sell.side,
            sell.saleKind,
            sell.howToCall,
          ],
          buy.calldata,
          sell.calldata,
          buy.replacementPattern,
          sell.replacementPattern,
          buy.staticExtradata,
          sell.staticExtradata,
          [splitBuySig.v, splitSellSig.v],
          [splitBuySig.r, splitBuySig.s, splitSellSig.r, splitSellSig.s, constants.HashZero],
        ),
      ).to.emit(WyvernExchange, 'OrdersMatched');
    });
  });

  describe('Bundle and buy', async () => {
    it('should match order', async () => {
      const accounts = await ethers.getSigners();
      EstNFT.mint(user1.address, '2');
      EstNFT.connect(user1).setApprovalForAll(WyvernExchange.address, true);
      EstNFT.connect(user1).setApprovalForAll(WyvernAtomicizer.address, true);

      const buyCalldata1 = EstNFT.interface.encodeFunctionData('transferFrom', [
        constants.AddressZero,
        user2.address,
        '1',
      ]);
      const buyCalldata2 = EstNFT.interface
        .encodeFunctionData('transferFrom', [constants.AddressZero, user2.address, '2'])
        .slice(2);

      const sellCaldata1 = EstNFT.interface.encodeFunctionData('transferFrom', [
        user1.address,
        constants.AddressZero,
        '1',
      ]);
      const sellCaldata2 = EstNFT.interface
        .encodeFunctionData('transferFrom', [user1.address, constants.AddressZero, '2'])
        .slice(2);

      const combinedBuyCalldata = buyCalldata1.concat(buyCalldata2);
      const combinedSellCaldata = sellCaldata1.concat(sellCaldata2);

      const buyCalldata = WyvernAtomicizerInterface.encodeFunctionData('atomicize', [
        [EstNFT.address, EstNFT.address],
        [0, 0],
        [100, 100],
        combinedBuyCalldata,
      ]);

      const sellCaldata = WyvernAtomicizerInterface.encodeFunctionData('atomicize', [
        [EstNFT.address, EstNFT.address],
        [0, 0],
        [100, 100],
        combinedSellCaldata,
      ]);

      const buy = makeOrder(
        WyvernExchange.address,
        true,
        accounts,
        ProxyRegistry.address,
        buyCalldata,
        replacementPatternBundleBuy,
      );
      buy.maker = user2.address;
      buy.taker = user1.address;
      buy.target = WyvernAtomicizer.address;
      buy.makerRelayerFee = 850;
      buy.feeMethod = 1;

      const sell = makeOrder(
        WyvernExchange.address,
        false,
        accounts,
        ProxyRegistry.address,
        sellCaldata,
        replacementPatternBundleSell,
      );
      sell.maker = user1.address;
      sell.taker = user2.address;
      sell.side = 1;
      sell.makerRelayerFee = 850;
      sell.target = WyvernAtomicizer.address;
      sell.feeMethod = 1;
      const buyHash = hashOrder(buy);
      const sellHash = hashOrder(sell);
      const buySig = await web3.eth.sign(buyHash, user2.address);
      const sellSig = await web3.eth.sign(sellHash, user1.address);
      const splitBuySig = ethers.utils.splitSignature(buySig);
      const splitSellSig = ethers.utils.splitSignature(sellSig);
      await expect(
        WyvernExchange.atomicMatch_(
          [
            buy.exchange,
            buy.maker,
            buy.taker,
            buy.feeRecipient,
            buy.target,
            buy.staticTarget,
            buy.paymentToken,
            sell.exchange,
            sell.maker,
            sell.taker,
            sell.feeRecipient,
            sell.target,
            sell.staticTarget,
            sell.paymentToken,
          ],
          [
            buy.makerRelayerFee,
            buy.takerRelayerFee,
            buy.makerProtocolFee,
            buy.takerProtocolFee,
            buy.basePrice,
            buy.extra,
            buy.listingTime,
            buy.expirationTime,
            buy.salt,
            sell.makerRelayerFee,
            sell.takerRelayerFee,
            sell.makerProtocolFee,
            sell.takerProtocolFee,
            sell.basePrice,
            sell.extra,
            sell.listingTime,
            sell.expirationTime,
            sell.salt,
          ],
          [
            buy.feeMethod,
            buy.side,
            buy.saleKind,
            buy.howToCall,
            sell.feeMethod,
            sell.side,
            sell.saleKind,
            sell.howToCall,
          ],
          buy.calldata,
          sell.calldata,
          buy.replacementPattern,
          sell.replacementPattern,
          buy.staticExtradata,
          sell.staticExtradata,
          [splitBuySig.v, splitSellSig.v],
          [splitBuySig.r, splitBuySig.s, splitSellSig.r, splitSellSig.s, constants.HashZero],
        ),
      ).to.emit(WyvernExchange, 'OrdersMatched');

      expect(EstNFT.connect(user2).ownerOf('1'));
      expect(EstNFT.connect(user2).ownerOf('2'));
    });
  });
});
