import React from 'react'
import NavBar from './Navbar';
import Web3 from 'web3'
import Tether from '../truffle_abis/Tether.json'
import Reward from '../truffle_abis/RWD.json'
import DecentralizedBank from '../truffle_abis/DecentralBank.json'
import Main from './Main.js'
import ParticleSetting from "./ParticleSetting.js"

class App extends React.Component {

    async UNSAFE_componentWillMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert('No ethereum browser detected, check out metamask');
        }
    }

    async loadBlockchainData() {
        const web3 = window.web3;
        const account = await web3.eth.getAccounts();
        this.setState({account: account[0]});
        const networkId = await web3.eth.net.getId();
        console.log(this.state.account);

        //Load up tether contract from the json files
        const tetherData = Tether.networks[networkId];
        if(tetherData) {
            const tether = new web3.eth.Contract(Tether.abi, tetherData.address);
            this.setState({tether: tether});
            let tetherBalance = await tether.methods.balanceOf(this.state.account).call();
            this.setState({tetherBalance: tetherBalance.toString()});
            console.log(tetherBalance/(1e18), 'eth on the account');
        }
        else {
            window.alert('Error! Tether contract has not be detected - missing network data!');
        }
        console.log("Loaded the tether contract")

        //Load up reward contract from the json files
        const rewardData = Reward.networks[networkId];
        if(rewardData) {
            const reward = new web3.eth.Contract(Reward.abi, rewardData.address);
            this.setState({rwd: reward});
            let rewardBalance = await reward.methods.balanceOf(this.state.account).call();
            this.setState({rewardBalance: rewardBalance.toString()});
            console.log(rewardBalance/(1e18), 'eth on the account');
        }
        else {
            window.alert('Error! Reward contract has not be detected - missing network data!');
        }
        console.log("Loaded the reward contract")

        //Load up decentralized contract from the json files
        const bankData = DecentralizedBank.networks[networkId];
        if(bankData) {
            const bank = new web3.eth.Contract(DecentralizedBank.abi, bankData.address);
            this.setState({decentralBank: bank});
            let stakingBalance = await bank.methods.stakingBalance(this.state.account).call();
            this.setState({stakingBalance: stakingBalance.toString()});
            console.log(stakingBalance/(1e18), 'eth on the account');
        } 
        else {
            window.alert('Error! Decentralized bank contract has not be detected - missing network data!');
        }
        this.setState({loading: false});
        console.log("Loaded the bank contract")
    }

    //staking function 
    stakeTokens = (amount) => {
        this.setState({loading: true});
        this.state.tether.methods.approve(this.state.decentralBank._address, amount).send({from:this.state.account}).on('transactionHash', (hash) => {
            this.state.decentralBank.methods.depositTokens(amount).send({from:this.state.account}).on('transactionHash', (hash) => {
                this.setState({loading: false});
            });
        });
    }

    //unstaking function 
    unstakeTokens = (amount) => {
        this.setState({loading: true});
        this.state.decentralBank.methods.unstakeToken().send({from:this.state.account}).on('transactionHash', (hash) => {
            this.setState({loading: false});
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            account: '0x0',
            tether: {}, 
            rwd: {},
            decentralBank: {},
            tetherBalance: '0',
            rewardBalance: '0', 
            stakingBalance: '0',
            loading: true,
        }
    }

    //React code goes in here
    render() {
        let content
        {this.state.loading ? 
            content = <p id='loader' className='text-center' style={{margin:'30px', color:'white'}}>LOADING PLEASE...</p> : 
            content = <Main 
                account={this.state.account}
                tetherBalance={this.state.tetherBalance}
                rewardBalance={this.state.rewardBalance}
                stakingBalance={this.state.stakingBalance} 
                stakeTokens={this.stakeTokens}
                unstakeTokens={this.unstakeTokens}
                decentralBank={this.state.decentralBank}
                />}
        return (
            <div className='App' style={{position:'relative'}}>
                <div style={{position:'absolute'}}>
                    <ParticleSetting/>
                </div>
                <NavBar account={this.state.account} />
                <div className='container-fluid mt-5'>
                    <div className='row'>
                        <main role='main' className='col-lg-12 ml-auto mr-auto' style={{maxWidth:'600px', minHeight:'100vm'}}>
                            <div>
                                {content}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
}

export default App;