import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, hardhatArguments, getNamedAccounts } = hre;
  const { deployer, salt } = await getNamedAccounts();
  const { deploy } = deployments;

  await deploy("CreateCall", {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: salt,
  });

  await deploy("MultiSend", {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: salt,
  });

  await deploy("MultiSendCallOnly", {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: salt,
  });
};

deploy.tags = ['libraries', 'l2-suite', 'main-suite']
export default deploy;
