// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "../../common/Enum.sol";
import "../../base/GuardManager.sol";
import "../../GnosisSafe.sol";

/// @title Debug Transaction Guard - A guard that will emit events with extended information.
/// @notice This guard is only meant as a development tool and example
/// @author Richard Meissner - <richard@gnosis.pm>
contract DebugTransactionGuard is Guard {
    // solhint-disable-next-line payable-fallback
    fallback() external {
        // We don't revert on fallback to avoid issues in case of a Safe upgrade
        // E.g. The expected check method might change and then the Safe would be locked.
    }

    event TransactionDetails(
        address indexed safe,
        bytes32 indexed txHash,
        address to,
        uint256 value,
        bytes data,
        Enum.Operation operation,
        uint256 safeTxGas,
        bool usesRefund,
        uint256 nonce
    );

    event GasUsage(address indexed safe, bytes32 indexed txHash, uint256 indexed nonce, bool success);

    mapping(bytes32 => uint256) public txNonces;

    function checkTransaction(
        GnosisSafe.TxLocalParams memory params,
        bytes memory,
        address
    ) external override {
        uint256 nonce;
        bytes32 txHash;
        {
            GnosisSafe safe = GnosisSafe(payable(msg.sender));
            nonce = safe.nonce() - 1;
            txHash = safe.getTransactionHash(
                params
            );
        }
        emit TransactionDetails(msg.sender, txHash, params.to, params.value, params.data, params.operation, params.safeTxGas, params.gasPrice > 0, params.nonce);
        txNonces[txHash] = params.nonce;
    }

    function checkAfterExecution(bytes32 txHash, bool success) external override {
        uint256 nonce = txNonces[txHash];
        require(nonce != 0, "Could not get nonce");
        txNonces[txHash] = 0;
        emit GasUsage(msg.sender, txHash, nonce, success);
    }
}
