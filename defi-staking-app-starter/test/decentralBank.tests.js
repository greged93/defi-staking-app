const Tether = artifacts.require("Tether");
const RWD = artifacts.require("RWD");
const DecentralBank = artifacts.require("DecentralBank");


require("chai")
.use(require("chai-as-promised"))
.should()

contract("DecentralBank", ([owner, customer]) => {
    //All of the testing code will go here
    let tether,reward, decentralBank;
    function tokens(number) {
        return web3.utils.toWei(number, 'ether')
    }

    before(async () => {
        tether = await Tether.new();
        reward = await RWD.new();
        decentralBank = await DecentralBank.new(reward.address, tether.address);
        //Transfer 1e6 reward tokens to the decentral bank
        await reward.transfer(decentralBank.address, tokens('1000000'));
        //Transfer 100 tether to the investor
        //The {from:} allows us to specify the msg.sender
        await tether.transfer(customer, tokens('100'), {from: owner});
    })

    describe("Mock Tether Deployment", async () => {
        it("matches name successfully", async () => {
            const name = await tether.name();
            assert.equal(name, "Tether");
        })
    })

    describe("Reward Token deployment", async () => {
        it("matches name successfully", async () => {
            const name = await reward.name();
            assert.equal(name, "Reward Token");
        })
    })

    describe("Decentral Bank deployment", async () => {
        it("matches name successfully", async () => {
            const name = await decentralBank.name();
            assert.equal(name, "Decentral Bank");
        })

        it("contract has some tokens", async () => {
            let balance = await reward.balanceOf(decentralBank.address);
            assert.equal(balance, tokens('1000000'));
        })
    })

    describe('Yield farming', async () => {
        it('reward tokens for staking', async () => {
            let result;
            result = await tether.balanceOf(customer);
            assert.equal(result, tokens('100'), 'investor mock tether before staking')
        
            //Approve the decentralbank and Check the staking
            await tether.approve(decentralBank.address ,tokens('100'), {from:customer} );
            await decentralBank.depositTokens(tokens('100'), {from:customer});

            // Check updated balance of the customer
            result = await tether.balanceOf(customer);
            assert.equal(result, tokens('0'), 'tether customer after staking');

            //Check the updated balance of the decentralbank
            result = await tether.balanceOf(decentralBank.address);
            assert.equal(result, tokens('100'), 'decentral bank balance after staking');

            //Check that the customer is indeed staking right now
            result = await decentralBank.isStaking(customer);
            assert.equal(result, true, 'customer staking status is true');

            //Issue tokens from the owner
            await decentralBank.issueTokens({from:owner});

            //Ensure only the owner can issue tokens
            await decentralBank.issueTokens({from:customer}).should.be.rejected;

            //Ensure the token are being unstaked
            await decentralBank.unstakeToken({from:customer});

            //Check that the customer got his token back
            result = await tether.balanceOf(customer);
            assert.equal(result, tokens('100'), 'tether customer after unstaking');

            //Check the updated balance of the decentralbank
            result = await tether.balanceOf(decentralBank.address);
            assert.equal(result, tokens('0'), 'decentral bank balance after unstaking');

            //Check that the customer is indeed staking right now
            result = await decentralBank.isStaking(customer);
            assert.equal(result, false, 'customer staking status is false');
        })
    })
});
