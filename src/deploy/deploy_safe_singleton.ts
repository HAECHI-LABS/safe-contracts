import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";

const deploy: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  await deploy("GnosisSafe", {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: true,
    gasPrice: ethers.utils.parseUnits("150", "gwi") // klaytn
  });
};

deploy.tags = ['singleton', 'main-suite']
export default deploy;
