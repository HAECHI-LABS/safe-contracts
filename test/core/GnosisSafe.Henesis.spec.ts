import { expect } from "chai";
import { deployments, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { AddressZero } from "@ethersproject/constants";
import { getSafeTemplate, getSafeWithOwners } from "../utils/setup";
import { safeSignTypedData, executeTx, safeSignMessage, calculateSafeTransactionHash, safeApproveHash, buildSafeTransaction, logGas, calculateSafeDomainSeparator, preimageSafeTransactionHash, buildSignatureBytes } from "../../src/utils/execution";
import { chainId } from "../utils/encoding";

describe("GnosisSafeHenesis", async () => {

    const [user1, user2, user3, user4] = waffle.provider.getWallets()

    const setupTests = deployments.createFixture(async ({ deployments }) => {
        await deployments.fixture();
        return {
            safe: await getSafeWithOwners([user1.address])
        }
    })

    describe("execTransaction-twice", async () => {
        it('should fail when execTransasction with same nonce', async () => {
            const { safe } = await setupTests()
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
            }
            const tx = buildSafeTransaction(txParams);
            const message = await safeSignMessage(user1, safe, tx);
            await safe.execTransaction(txParams, message.data);
            await safe.execTransaction(txParams, message.data);
        })
    })
})