// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "../../common/Enum.sol";
import "../../base/GuardManager.sol";
import "../../GnosisSafe.sol";

contract DelegateCallTransactionGuard is Guard {
    address public immutable allowedTarget;

    constructor(address target) {
        allowedTarget = target;
    }

    // solhint-disable-next-line payable-fallback
    fallback() external {
        // We don't revert on fallback to avoid issues in case of a Safe upgrade
        // E.g. The expected check method might change and then the Safe would be locked.
    }

    function checkTransaction(
        GnosisSafe.TxLocalParams memory params,
        bytes memory,
        address
    ) external view override {
        require(params.operation != Enum.Operation.DelegateCall || params.to == allowedTarget, "This call is restricted");
    }

    function checkAfterExecution(bytes32, bool) external view override {}
}
