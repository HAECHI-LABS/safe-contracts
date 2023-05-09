// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "./GnosisSafe.sol";

/// @title Gnosis Safe - A multisignature wallet with support for confirmations using signed messages based on ERC191.
/// @author Stefan George - <stefan@gnosis.io>
/// @author Richard Meissner - <richard@gnosis.io>
contract GnosisSafeL2 is GnosisSafe {
    event SafeMultiSigTransaction(
        address to,
        uint256 value,
        bytes data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes signatures,
    // We combine nonce, sender and threshold into one to avoid stack too deep
    // Dev note: additionalInfo should not contain `bytes`, as this complicates decoding
        bytes additionalInfo
    );

    event SafeModuleTransaction(address module, address to, uint256 value, bytes data, Enum.Operation operation);

    function execTransaction(
        TxLocalParams memory params,
        bytes memory signatures
    ) public payable override returns (bool) {
        bytes memory additionalInfo;
        {
            additionalInfo = abi.encode(params.nonce, msg.sender, threshold);
        }
        emit SafeMultiSigTransaction(
            params.to,
            params.value,
            params.data,
            params.operation,
            params.safeTxGas,
            params.baseGas,
            params.gasPrice,
            params.gasToken,
            params.refundReceiver,
            signatures,
            additionalInfo
        );
        return super.execTransaction(params, signatures);
    }

    /// @dev Allows a Module to execute a Safe transaction without any further confirmations.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation
    ) public override returns (bool success) {
        emit SafeModuleTransaction(msg.sender, to, value, data, operation);
        success = super.execTransactionFromModule(to, value, data, operation);
    }
}
