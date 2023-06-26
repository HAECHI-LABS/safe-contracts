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
// cypress: 0xD0E7FA58BF4A542ab4556d74a7028fC7b626456e
// polygon mainnet: 0x597570EE4C33585a2687ACe9245cB598F77294a9

const PROXY_FACTORY_ADDRESS = "0x349Eb6c7f0e9C03534763dD19A4172BdB7f968E1"
// cypress : 0x349Eb6c7f0e9C03534763dD19A4172BdB7f968E1
// klaytn baobab: 0xc22834581ebc8527d974f8a1c97e1bea4ef910bc
// polygon mainnet: 0x2f2aD74C62D3F9A9d7d43b14b90dC6D7Feb2Ab23

const txParams = {
    to: "0x1BB39eaf6494A692B306B7cE2A9313516869804C",
    value: ethers.utils.parseUnits("10", "gwei"),
    data: "0x",
    operation: 0, // Enum.Operation.Call (0) 또는 Enum.Operation.DelegateCall (1)
    safeTxGas: 0,
    baseGas: 0,
    gasPrice: 0,
    gasToken: ZERO_ADDRESS,
    refundReceiver: ZERO_ADDRESS,
    nonce: 0
}

task('deploy-proxy-factory').setAction(async ({}, hre) => {
  const [deployer] = await hre.ethers.getSigners()
  const gnosisSafeProxyFactoryFactory = await hre.ethers.getContractFactory("GnosisSafeProxyFactory");
  const gnosisSafeProxy = await gnosisSafeProxyFactoryFactory.connect(deployer).deploy({
    gasPrice: ethers.utils.parseUnits("160", "gwei"),
    gasLimit: 10000000,
  });
  await gnosisSafeProxy.deployed();
  console.log("gnosisSafeProxyFactoryFactory deployed to:", gnosisSafeProxy.address);
});

task('deploy-singleton').setAction(async ({}, hre) => {
    const [deployer] = await hre.ethers.getSigners()
    const gnosisSafeL2Factory = await hre.ethers.getContractFactory("GnosisSafeL2");
    const gnosisSafeL2 = await gnosisSafeL2Factory.connect(deployer).deploy({
        // gasPrice: ethers.utils.parseUnits("250", "gwei"), // klaytn
        gasLimit: 10000000,
    });
    await gnosisSafeL2.deployed();
    console.log("gnosisSafeL2 deployed to:", gnosisSafeL2.address);
});

task("deploy-safe", "")
    .setAction(async (_, hre) => {
        const safe = await hre.ethers.getContractAt("GnosisSafe", SINGLETON_ADDRESS);
        const setupData = safe.interface.encodeFunctionData('setup', [
            ['0x1BB39eaf6494A692B306B7cE2A9313516869804C'],
            1,
            ZERO_ADDRESS,
            "0x",
            "0xf48f2b2d2a534e402487b3ee7c18c33aec0fe5e4",
            // cypress: 0xf48f2b2d2a534e402487b3ee7c18c33aec0fe5e4
            // baobab: 0x017062a1de2fe6b99be3d9d37841fed19f573804
            // polygon mainnet: 0xf48f2b2d2a534e402487b3ee7c18c33aec0fe5e4
            ZERO_ADDRESS,
            0,
            ZERO_ADDRESS
        ]);
        const factory = await hre.ethers.getContractAt("GnosisSafeProxyFactory", PROXY_FACTORY_ADDRESS);
        const saltNonce = (Date.now() * 1000 + Math.floor(Math.random() * 1000)).toString();
        const tx = await factory.createProxyWithNonce(
            SINGLETON_ADDRESS,
            setupData,
            saltNonce,
            {
                gasPrice: ethers.utils.parseUnits("250", "gwei"),
            }
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

        const [signer] = await hre.ethers.getSigners()

        const messageHash = hre.ethers.utils.hashMessage(safeTxHash);
        const signature = await signer.signMessage(hre.ethers.utils.arrayify(messageHash));

        const tx = buildSafeTransaction({
            to: txParams.to,
            value: txParams.value,
            nonce: txParams.nonce
        });
        const txHash = calculateSafeTransactionHash(safe, tx, 137)
        console.log(txHash)
        console.log(safeTxHash);
        console.log(signature);
        console.log(signature.replace(/1b$/, "1f").replace(/1c$/, "20"));
        console.log(buildSignatureBytes([{
            signer: await signer.getAddress(),
            data: signature.replace(/1b$/, "1f").replace(/1c$/, "20"),
        }]));
        console.log((await signer.provider!!.getNetwork()).chainId);
        console.log(await safe.getOwners());
        console.log(await signer.getAddress())
    });

task("execute", "")
    .setAction(async (_, hre) => {
        const safe = await hre.ethers.getContractAt("GnosisSafeL2", SAFE_ADDRESS);
        const [signer] = await hre.ethers.getSigners();

        const tx = buildSafeTransaction(txParams);
        const message = await safeSignMessage(signer, safe, tx);

        console.log(message.data)
        await safe.connect(signer).execTransaction(txParams, message.data);
    });

task("version", "")
    .setAction(async (_, hre) => {
        const safe = await hre.ethers.getContractAt("GnosisSafe", "0xfb1bffC9d739B8D520DaF37dF666da4C687191EA");
        const code = await hre.ethers.provider.getCode("0x3E5c63644E683549055b9Be8653de26E0B4CD36E");
        console.log(code);

        // console.log(await safe.VERSION())
        // await safe.connect(signer).execTransaction(txParams, message.data);
    });

export { }