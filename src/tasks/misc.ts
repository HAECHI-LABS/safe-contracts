import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import {
  buildSafeTransaction,
  buildSignatureBytes,
  calculateSafeTransactionHash, safeSignMessage
} from "../utils/execution";
import { ethers } from "ethers";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const SAFE_ADDRESS = "0x0000000000000000000000000000000000000000";
const SINGLETON_ADDRESS = "0x0000000000000000000000000000000000000000";
const PROXY_FACTORY_ADDRESS = "0x0000000000000000000000000000000000000000";
const FALLBACK_HANDLER_ADDRESS = "0x0000000000000000000000000000000000000000";

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

task("deploy-fallback-handler").setAction(async ({}, hre) => {
  const [deployer] = await hre.ethers.getSigners();
  const fallbackHandlerL2Factory = await hre.ethers.getContractFactory("CompatibilityFallbackHandler", deployer);
  const fallbackHandler = await fallbackHandlerL2Factory.connect(deployer).deploy();
  await fallbackHandler.deployed();
  console.log("fallbackHandler deployed to:", fallbackHandler.address);
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
      FALLBACK_HANDLER_ADDRESS,
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