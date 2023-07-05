import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import {
  buildSafeTransaction,
  buildSignatureBytes,
  calculateSafeTransactionHash, safeSignMessage
} from "../utils/execution";
import { ethers } from "ethers";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const SAFE_ADDRESS = "0x7dfcFe2a69e8d2D2b3d44b05AE8df41550C8F673";
const SINGLETON_ADDRESS = "0xD0E7FA58BF4A542ab4556d74a7028fC7b626456e";
// bora: 0xefCb880455965930caab77edE0B1454C2A749762
// cypress: 0xD0E7FA58BF4A542ab4556d74a7028fC7b626456e
// polygon mainnet: 0x597570EE4C33585a2687ACe9245cB598F77294a9

const PROXY_FACTORY_ADDRESS = "0x349Eb6c7f0e9C03534763dD19A4172BdB7f968E1";
// bora: 0xae04c601F48e449574310E9330ffA00403a759BA
// cypress : 0x349Eb6c7f0e9C03534763dD19A4172BdB7f968E1
// klaytn baobab: 0xc22834581ebc8527d974f8a1c97e1bea4ef910bc
// polygon mainnet: 0x2f2aD74C62D3F9A9d7d43b14b90dC6D7Feb2Ab23

const txParams = {
  to: "0x...",
  value: ethers.utils.parseUnits("1", "gwei"),
  data: "0x",
  operation: 0, // Enum.Operation.Call (0) 또는 Enum.Operation.DelegateCall (1)
  safeTxGas: 0,
  baseGas: 0,
  gasPrice: 0,
  gasToken: ZERO_ADDRESS,
  refundReceiver: ZERO_ADDRESS,
  nonce: 10
};

/*
  If you want to change the provider, do as below
  const provider = new ethers.providers.JsonRpcProvider('NODE_URL');
  const deployer = new ethers.Wallet('PK', provider);
 */

task("deploy-proxy-factory").setAction(async ({}, hre) => {
  const [deployer] = await hre.ethers.getSigners();
  const gnosisSafeProxyFactoryFactory = await hre.ethers.getContractFactory("GnosisSafeProxyFactory", deployer);
  const gnosisSafeProxy = await gnosisSafeProxyFactoryFactory.connect(deployer).deploy();
  await gnosisSafeProxy.deployed();
  console.log("gnosisSafeProxyFactoryFactory deployed to:", gnosisSafeProxy.address);
});

task("deploy-singleton").setAction(async ({}, hre) => {
  const [deployer] = await hre.ethers.getSigners();
  const gnosisSafeL2Factory = await hre.ethers.getContractFactory("GnosisSafeL2", deployer);
  const gnosisSafeL2 = await gnosisSafeL2Factory.connect(deployer).deploy();
  await gnosisSafeL2.deployed();
  console.log("gnosisSafeL2 deployed to:", gnosisSafeL2.address);
});

task("deploy-safe", "")
  .setAction(async (_, hre) => {
    const [deployer] = await hre.ethers.getSigners();
    const safe = await hre.ethers.getContractAt("GnosisSafeL2", SINGLETON_ADDRESS);
    const setupData = safe.interface.encodeFunctionData("setup", [
      ["owner"],
      1,
      ZERO_ADDRESS,
      "0x",
      ZERO_ADDRESS, // fallback handler
      // cypress: 0xf48f2b2d2a534e402487b3ee7c18c33aec0fe5e4
      // baobab: 0x017062a1de2fe6b99be3d9d37841fed19f573804
      // polygon mainnet: 0xf48f2b2d2a534e402487b3ee7c18c33aec0fe5e4
      ZERO_ADDRESS,
      0,
      ZERO_ADDRESS
    ]);
    const factory = await hre.ethers.getContractAt("GnosisSafeProxyFactory", PROXY_FACTORY_ADDRESS, deployer);
    const tx = await factory.createProxyWithNonce(
      SINGLETON_ADDRESS,
      setupData,
      (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString()
    );
    console.log("hash:", tx.hash);
  });

task("sign", "")
  .setAction(async (_, hre) => {
    const safe = await hre.ethers.getContractAt("GnosisSafeL2", SAFE_ADDRESS);
    const safeTxHash = await safe.getTransactionHash(
      txParams.to,
      txParams.value,
      txParams.data,
      txParams.operation,
      txParams.safeTxGas,
      txParams.baseGas,
      txParams.gasPrice,
      txParams.gasToken,
      txParams.refundReceiver,
      txParams.nonce
    );

    const [signer] = await hre.ethers.getSigners();

    const messageHash = hre.ethers.utils.hashMessage(safeTxHash);
    const signature = await signer.signMessage(hre.ethers.utils.arrayify(messageHash));

    const tx = buildSafeTransaction({
      to: txParams.to,
      value: txParams.value,
      nonce: txParams.nonce
    });
    const txHash = calculateSafeTransactionHash(safe, tx, 137);
    console.log(txHash);
    console.log(safeTxHash);
    console.log(signature);
    console.log(signature.replace(/1b$/, "1f").replace(/1c$/, "20"));
    console.log(buildSignatureBytes([{
      signer: await signer.getAddress(),
      data: signature.replace(/1b$/, "1f").replace(/1c$/, "20")
    }]));
    console.log((await signer.provider!!.getNetwork()).chainId);
    console.log(await safe.getOwners());
    console.log(await signer.getAddress());
  });

task("execute", "")
  .setAction(async (_, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const safe = await hre.ethers.getContractAt("GnosisSafeL2", SAFE_ADDRESS, signer);
    const tx = buildSafeTransaction(txParams);
    const message = await safeSignMessage(signer, safe, tx);
    console.log(message.data);
    await safe.connect(signer).execTransaction(txParams, message.data);
  });
export {};