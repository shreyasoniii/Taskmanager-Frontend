const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaskAuditLog", function () {
  let contract, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TaskAuditLog");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  it("starts with zero entries", async () => {
    expect(await contract.totalEntries()).to.equal(0n);
  });

  it("logs a CREATED event and emits TaskEventLogged", async () => {
    const taskId = 42n;
    const hash = ethers.keccak256(ethers.toUtf8Bytes('{"id":42,"title":"Buy milk"}'));
    const EventType = { CREATED: 0 };

    await expect(contract.logEvent(taskId, EventType.CREATED, hash, "Task created"))
      .to.emit(contract, "TaskEventLogged");

    expect(await contract.totalEntries()).to.equal(1n);
  });

  it("stores full task history in order", async () => {
    const taskId = 7n;
    const EventType = { CREATED: 0, UPDATED: 1, COMPLETED: 2 };
    const h1 = ethers.keccak256(ethers.toUtf8Bytes("snap1"));
    const h2 = ethers.keccak256(ethers.toUtf8Bytes("snap2"));
    const h3 = ethers.keccak256(ethers.toUtf8Bytes("snap3"));

    await contract.logEvent(taskId, EventType.CREATED, h1, "created");
    await contract.logEvent(taskId, EventType.UPDATED, h2, "updated title");
    await contract.logEvent(taskId, EventType.COMPLETED, h3, "marked done");

    const history = await contract.getTaskHistory(taskId);
    expect(history.length).to.equal(3);
    expect(history[0].eventType).to.equal(EventType.CREATED);
    expect(history[1].eventType).to.equal(EventType.UPDATED);
    expect(history[2].eventType).to.equal(EventType.COMPLETED);
    expect(history[2].dataHash).to.equal(h3);
    expect(await contract.taskEventCount(taskId)).to.equal(3n);
  });

  it("verifies a correct hash and rejects a wrong one", async () => {
    const taskId = 1n;
    const EventType = { CREATED: 0 };
    const snap = '{"id":1,"title":"Test"}';
    const hash = ethers.keccak256(ethers.toUtf8Bytes(snap));

    await contract.logEvent(taskId, EventType.CREATED, hash, "");
    expect(await contract.verifyEntry(0n, hash)).to.be.true;
    expect(await contract.verifyEntry(0n, ethers.keccak256(ethers.toUtf8Bytes("wrong")))).to.be.false;
  });

  it("different users can log events for the same task", async () => {
    const taskId = 5n;
    const EventType = { CREATED: 0, UPDATED: 1 };
    const h1 = ethers.keccak256(ethers.toUtf8Bytes("owner-snap"));
    const h2 = ethers.keccak256(ethers.toUtf8Bytes("user-snap"));

    await contract.connect(owner).logEvent(taskId, EventType.CREATED, h1, "created by owner");
    await contract.connect(user).logEvent(taskId, EventType.UPDATED, h2, "updated by user");

    const history = await contract.getTaskHistory(taskId);
    expect(history[0].actor).to.equal(owner.address);
    expect(history[1].actor).to.equal(user.address);
  });
});
