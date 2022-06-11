const hre = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  let owner = deployer.address;

  let goldFinchConfig  = await deployGoldFinchConfig(owner);
  let accountAddress = await deployAccountLib();

  let creditDesk = await deployCreditDesk(goldFinchConfig, accountAddress);
  await deployFakeUSDC(goldFinchConfig);
  let fixedLeverageRatioStrategy = await deploySeniorPoolStrategy(goldFinchConfig);
  let creditLine = await deployCreditLine(goldFinchConfig, accountAddress);
  await deployFidu(goldFinchConfig);
  let seniorPool = await deploySeniorPool(goldFinchConfig, accountAddress);
  await deployTranchedPoll(goldFinchConfig);
  await deployBorrow(goldFinchConfig);
  await deployPool(goldFinchConfig);
  await deployGoldFinFactory(owner, goldFinchConfig);

  // await creditDesk.initialize(owner, goldFinchConfig.address);
  // await fixedLeverageRatioStrategy.initialize(owner, goldFinchConfig.address);

  // await goldFinchFactory.initialize(owner, goldFinchConfig.address)
  await seniorPool.initialize(owner, goldFinchConfig.address)
  await seniorPool.deposit(100);
}

async function deployGoldFinchConfig(owner) {
  const GoldFinchConfig = await hre.ethers.getContractFactory('GoldfinchConfig');
  const goldFinchConfig = await GoldFinchConfig.deploy();
  await goldFinchConfig.deployed();
  console.log('config deployed to ', goldFinchConfig.address);
  await goldFinchConfig.initialize(owner);
  await goldFinchConfig.setTreasuryReserve(owner);
  await goldFinchConfig.setAddress(7, owner)

  //check ConfigOptions for number orders
  let configNumbers = [
    500000,
    2000000,
    2000000,
    10,
    200,
    30,
    120,
    86400,
    365,
    4000000,
  ];
  for (let i = 0; i < configNumbers.length; i++) {
    await goldFinchConfig.setNumber(i, configNumbers[i]);
  }
  return goldFinchConfig;
}

async function deployFakeUSDC(goldFinchConfig) {
  const TestERC20 = await hre.ethers.getContractFactory('TestERC20');
  const testERC20 = await TestERC20.deploy(100000000, 6);
  await testERC20.deployed();
  await goldFinchConfig.setAddress(5, testERC20.address)

  console.log('TestERC20 deployed to ', testERC20.address);
}

async function deployCreditDesk(goldFinchConfig, accountAddress) {
  const CreditDesk = await hre.ethers.getContractFactory('CreditDesk', {
    libraries: {
      Accountant: accountAddress,
    },
  });

  const creditDesk = await CreditDesk.deploy();
  await creditDesk.deployed();
  await goldFinchConfig.setAddress(3, creditDesk.address)
  console.log('CreditDesk deployed to ', creditDesk.address);

  return creditDesk;
}

async function deploySeniorPoolStrategy(goldFinchConfig) {
  const FixedLeverageRatioStrategy = await hre.ethers.getContractFactory('FixedLeverageRatioStrategy');
  const fixedLeverageRatioStrategy = await FixedLeverageRatioStrategy.deploy();
  await fixedLeverageRatioStrategy.deployed();
  await goldFinchConfig.setSeniorPoolStrategy(fixedLeverageRatioStrategy.address);

  console.log('FixedLeverageRatioStrategy deployed to ', fixedLeverageRatioStrategy.address);
  return fixedLeverageRatioStrategy;
}

async function deployAccountLib() {
  const Accountant = await hre.ethers.getContractFactory('Accountant');
  const accountant = await Accountant.deploy();
  await accountant.deployed();
  console.log('Accountant deployed to ', accountant.address);
  return accountant.address;
}

async function deployCreditLine(goldFinchConfig, accountAddress) {
  const CreditLine = await hre.ethers.getContractFactory('CreditLine', {
    libraries: {
      Accountant: accountAddress,
    },
  });

  const creditLine = await CreditLine.deploy();
  await creditLine.deployed();
  await goldFinchConfig.setCreditLineImplementation(creditLine.address);

  console.log('CreditLine deployed to ', creditLine.address);
  return creditLine;
}

async function deployFidu(goldFinchConfig) {
  const Fidu = await hre.ethers.getContractFactory('Fidu');

  const fidu = await Fidu.deploy();
  await fidu.deployed();
  await goldFinchConfig.setAddress(4, fidu.address)

  console.log('Fidu deployed to ', fidu.address);
}

async function deploySeniorPool(goldFinchConfig, accountAddress) {
  const SeniorPool = await hre.ethers.getContractFactory('SeniorPool', {
    libraries: {
      Accountant: accountAddress,
    },
  });

  const seniorPool = await SeniorPool.deploy();
  await seniorPool.deployed();
  goldFinchConfig.setAddress(14,  seniorPool.address);

  console.log('SeniorPool deployed to ', seniorPool.address);
  return seniorPool;
}

async function deployTranchedPoll(goldFinchConfig, accountAddress) {
  const TranchedPool = await hre.ethers.getContractFactory('TranchedPool');
  const tranchedPool = await TranchedPool.deploy();
  await tranchedPool.deployed();
  await goldFinchConfig.setAddress(13,  tranchedPool.address);

  console.log('TranchedPool deployed to ', tranchedPool.address);
}

async function deployBorrow(goldFinchConfig) {
  const Borrower = await hre.ethers.getContractFactory('Borrower');
  const borrower = await Borrower.deploy();
  await borrower.deployed();
  await goldFinchConfig.setAddress(17, borrower.address)

  console.log('Borrower deployed to ', borrower.address);
}

async function deployPool(goldFinchConfig) {
  const Pool = await hre.ethers.getContractFactory('Pool');
  const pool = await Pool.deploy();
  await pool.deployed();
  await goldFinchConfig.setAddress(0, pool.address)

  console.log('Pool deployed to ', pool.address);
}

async function deployGoldFinFactory(){
  const GoldfinchFactory = await hre.ethers.getContractFactory('GoldfinchFactory');
  const goldfinchFactory = await GoldfinchFactory.deploy();
  await goldfinchFactory.deployed();

  console.log('GoldfinchFactory deployed to ', goldfinchFactory.address);
  return goldfinchFactory;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
