import React from 'react';

class Airdrop extends React.Component {
    //Airdrop must have a timer that counts down 
    //initalize the countdown after the customer have at least
    //50 tokens staked. Need a timer, startTimer, state. 

    constructor (props) {
        super(props);
        this.state = {
            time:{},
            seconds: 3,
        };
        this.timer = 0;
        // this.startTimer = this.startTime.bind(this);
        this.countDown = this.countDown.bind(this);
    }

    countDown() {
        // countdown one second at at time
        let seconds = this.state.seconds - 1;
        this.setState({
            time: this.secondsToTime(seconds),
            seconds: seconds,
        });
        //stop counting when we reach zero
        if (seconds == 0) {
            clearInterval(this.timer);
            //Current problem: only the bank account can sign the transaction...
            this.props.decentralBank.methods.issueTokens().send({from:this.props.account}).on('transactionHash', (hash) => {
                window.alert('AIRDROP COMPLETED');
            });
        }
    }

    startTimer() {
        if(this.timer == 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    //Function in order to calculate hours, minutes and seconds from an amount of seconds.
    secondsToTime(secs) {
        let hours, minutes, seconds;
        hours = Math.floor(secs / (60 * 60));

        let devisor_for_minutes = secs % (60 * 60);
        minutes = Math.floor(devisor_for_minutes / 60);

        seconds = Math.ceil(devisor_for_minutes % 60);
        
        let obj = {
            'h': hours,
            'm': minutes,
            's': seconds,
        }
        return obj;
    }

    componentDidMount() {
        let timeLeftVar = this.secondsToTime(this.state.seconds);
        this.setState({time: timeLeftVar});
    }

    airdropReleaseTokens() {
        let stakingB = this.props.stakingBalance;
        if(stakingB >= 50000000000000000000) {
            this.startTimer();
        }
    }

    render() {
        return (
            <div style={{color:'black'}}>
                {this.airdropReleaseTokens()}
                {this.state.time.m}:{this.state.time.s}
            </div>
        )
    }
}

export default Airdrop;