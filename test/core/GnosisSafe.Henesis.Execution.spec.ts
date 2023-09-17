import { expect } from "chai";
import { deployments, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { deployContract, getFactory, getMock, getSafeWithOwners } from "../utils/setup";
import { safeSignMessage, buildSafeTransaction } from "../../src/utils/execution";
import { calculateProxyAddress } from "../../src";

describe("GnosisSafeHenesis", async () => {

  const [user1] = waffle.provider.getWallets();
  const SINGLETON_SOURCE = `
    contract Test {
        address _singleton;
        address public creator;
        bool public isInitialized;
        constructor() payable {
            creator = msg.sender;
        }
        function init() public {
            require(!isInitialized, "Is initialized");
            creator = msg.sender;
            isInitialized = true;
        }
        function masterCopy() public pure returns (address) {
            return address(0);
        }
        function forward(address to, bytes memory data) public returns (bytes memory result) {
            (,result) = to.call(data);
        }
    }`;

  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture();
    const singleton = await deployContract(user1, SINGLETON_SOURCE);
    return {
      safe: await getSafeWithOwners([user1.address]),
      factory: await getFactory(),
      mock: await getMock(),
      singleton
    };
  });

  describe("execTransaction-twice", async () => {
    it("should fail when execTransasction with same nonce", async () => {
      const { safe } = await setupTests();
      const txParams = {
        to: "0x1BB39eaf6494A692B306B7cE2A9313516869804C",
        value: 0,
        data: "0x",
        operation: 0, // Enum.Operation.Call (0) 또는 Enum.Operation.DelegateCall (1)
        safeTxGas: 0,
        baseGas: 0,
        gasPrice: 0,
        gasToken: "0x0000000000000000000000000000000000000000",
        refundReceiver: "0x0000000000000000000000000000000000000000",
        nonce: 123
      };
      const tx = buildSafeTransaction(txParams);
      const message = await safeSignMessage(user1, safe, tx);
      await safe.execTransaction(txParams, message.data);
      await expect(
        safe.execTransaction(txParams, message.data)
      ).to.be.revertedWith('USED NONCE');
    });

    it("should emit event without initializing", async () => {
      const { factory, singleton } = await setupTests();
      const initCode = "0x";
      const saltNonce = 42;
      const proxyAddress = await calculateProxyAddress(factory, singleton.address, initCode, saltNonce);
      await expect(
        await factory.predictProxyAddress(singleton.address, initCode, saltNonce)
      ).to.be.eq(proxyAddress);
    });
  });
});