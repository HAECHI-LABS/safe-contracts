import { expect } from "chai";
import { deployments, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { deployContract, getFactory, getMock, getSafeWithOwners } from "../utils/setup";
import {
  safeSignMessage,
  buildSafeTransaction,
  buildSignatureBytes
} from "../../src/utils/execution";
import { Contract } from "ethers";

const txParams = {
  to: "0x",
  value: 0,
  data: "0x",
  operation: 0, // Enum.Operation.Call (0) 또는 Enum.Operation.DelegateCall (1)
  safeTxGas: 0,
  baseGas: 0,
  gasPrice: 0,
  gasToken: "0x0000000000000000000000000000000000000000",
  refundReceiver: "0x0000000000000000000000000000000000000000",
  nonce: 0
};

describe("GnosisSafeHenesis", async () => {

  const wallets = waffle.provider.getWallets();
  const [user1, user2, user3, user4, user5] = wallets;
  const owners = [user1, user2, user3];
  const threshold = 2;
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
      safe: await getSafeWithOwners(owners.map(o => o.address), threshold), // 2 of 3
      factory: await getFactory(),
      mock: await getMock(),
      singleton
    };
  });

  describe("setupOwners", async() => {
    it('increase M', async() => {
      const { safe } = await setupTests();
      const newOwners = [user1.address, user2.address, user3.address, user4.address];
      const newThreshold = 2;
      await setupOwners(safe, [user1, user2], newOwners, newThreshold);

      const owners = [...await safe.getOwners()]; // read only라서 deep copy 진행
      const threshold = await safe.getThreshold();
      expect(owners.sort()).to.be.deep.equal(newOwners.sort());
      expect(threshold).to.be.deep.equal(newThreshold);
    });

    it('decrease M - same owners', async() => {
      const { safe } = await setupTests();
      const newOwners = [user1.address, user2.address];
      const newThreshold = 2;
      await setupOwners(safe, [user1, user2], newOwners, newThreshold);

      const owners = [...await safe.getOwners()]; // read only라서 deep copy 진행
      const threshold = await safe.getThreshold();
      expect(owners.sort()).to.be.deep.equal(newOwners.sort());
      expect(threshold).to.be.deep.equal(newThreshold);
    });

    it('decrease M - same owners + new owners', async() => {
      const { safe } = await setupTests();
      const newOwners = [user2.address, user4.address];
      const newThreshold = 2;
      await setupOwners(safe, [user1, user2], newOwners, newThreshold);

      const owners = [...await safe.getOwners()]; // read only라서 deep copy 진행
      const threshold = await safe.getThreshold();
      expect(owners.sort()).to.be.deep.equal(newOwners.sort());
      expect(threshold).to.be.deep.equal(newThreshold);
    });

    it('decrease M - new owners', async() => {
      const { safe } = await setupTests();
      const newOwners = [user4.address, user5.address];
      const newThreshold = 2;
      await setupOwners(safe, [user1, user2], newOwners, newThreshold);

      const owners = [...await safe.getOwners()]; // read only라서 deep copy 진행
      const threshold = await safe.getThreshold();
      expect(owners.sort()).to.be.deep.equal(newOwners.sort());
      expect(threshold).to.be.deep.equal(newThreshold);
    });

    it('increase N', async() => {
      const { safe } = await setupTests();
      const newOwners = [user1.address, user2.address, user3.address];
      const newThreshold = 3;
      await setupOwners(safe, [user1, user2], newOwners, newThreshold);

      const owners = [...await safe.getOwners()]; // read only라서 deep copy 진행
      const threshold = await safe.getThreshold();
      expect(owners.sort()).to.be.deep.equal(newOwners.sort());
      expect(threshold).to.be.deep.equal(newThreshold);
    });

    it('decrease N', async() => {
      const { safe } = await setupTests();
      const newOwners = [user1.address, user2.address, user3.address];
      const newThreshold = 1;
      await setupOwners(safe, [user1, user2], newOwners, newThreshold);

      const owners = [...await safe.getOwners()]; // read only라서 deep copy 진행
      const threshold = await safe.getThreshold();
      expect(owners.sort()).to.be.deep.equal(newOwners.sort());
      expect(threshold).to.be.deep.equal(newThreshold);
    });

    it('random N of M', async() => {
      const { safe } = await setupTests();
      const testCount = 100;
      let prevOwners = owners;
      let prevThreshold = threshold
      for (let i = 0; i < testCount; i++) {
        const M = getRandomInt(1, wallets.length);
        const newOwners = getRandomSubset(wallets, M);
        const newThreshold = getRandomInt(1, M);
        console.log(`setupOwners from ${prevThreshold} of ${prevOwners.length} to ${newThreshold} of ${newOwners.length}`);
        await setupOwners(safe, prevOwners, newOwners.map(o => o.address), newThreshold);

        const owners = [...await safe.getOwners()]; // read only라서 deep copy 진행
        const threshold = await safe.getThreshold();
        expect(owners.sort()).to.be.deep.equal(newOwners.map(o => o.address).sort());
        expect(threshold).to.be.deep.equal(newThreshold);

        prevOwners = newOwners;
        prevThreshold = newThreshold;
      }
    });
  });
});

async function setupOwners(safe: Contract, signers: any[], newOwners: string[], newThreshold: number) {
  const data = safe.interface.encodeFunctionData("setupOwners", [newOwners, newThreshold]);
  txParams.to = safe.address;
  txParams.data = data;
  txParams.nonce = getRandomInt(0, Number.MAX_SAFE_INTEGER);

  const tx = buildSafeTransaction(txParams)
  const sigs = await Promise.all(signers.map((signer) => safeSignMessage(signer, safe, tx)))
  const signatureBytes = buildSignatureBytes(sigs)
  await safe.execTransaction(txParams, signatureBytes)
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSubset(arr: any[], count: number): any[] {
  const copyArr = [...arr];
  const result = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = getRandomInt(0, copyArr.length - 1);
    result.push(copyArr.splice(randomIndex, 1)[0]);
  }

  return result;
}
