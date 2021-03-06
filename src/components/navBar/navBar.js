import React, { Component } from 'react';
import './navBar.css';
import * as firebase from 'firebase';
import UserSettingsDialog from './userSettingsDialog';
import { Link } from 'react-router-dom';
// importing Moment.js
import moment from 'moment';
// importing react-live-clock. For documentation: https://www.npmjs.com/package/react-live-clock
import Clock from 'react-live-clock';
// importing Font Awesome
import 'font-awesome/css/font-awesome.min.css';
// importing material-ui components
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import FontIcon from 'material-ui/FontIcon';
import Dialog from 'material-ui/Dialog';


class NavBar extends Component {

  constructor() {
    super();
    this.state = {
      // dialog states
      userDialogState: false,
      // User states
      currentUserState: '',
      // Moment related
      today: moment().format('LTS')
    }
  }
    
  componentWillMount() {

    let userRef = firebase.database().ref().child('agents').child(this.props.user.uid).child('currentState');
    userRef.on('value', snap => {
      this.setState({
        currentUserState: snap.val()
      })
    })
  }

  handleUserSettingsOpen = () => {
    this.setState({userDialogState: true});
  };

  handleUserSettingsClose = () => {
    this.setState({userDialogState: false});
  };

  updateUserStatus = (status) => {
    firebase.database().ref().child('agents').child(this.props.user.uid).child('currentState').set(status);
    console.log(status);
  }

  render() {

    const styles = {
      titleStyle: {
        color: this.props.styles.success
      },
      logo: {
        position: 'relative',
        top: 7,
        marginRight: 15
      },
      titleText: {},
      userAvatar: {
        position: 'relative',
        top: 3,
        height: 30,
        width: 30
      },
      userIconMenu: {
        textAlign: 'center'
      },
      userAvatarInside: {
        height: 60,
        width: 60,
        margin: 'auto'
      },
      githubIcon: {
        margin: '0px 20px 0px 10px'
      },
      githubLink: {
        color: 'inherit'
      }
    }
    

    // Pull user's avatarURL
    let avatarUrl;
    let avatarRef = firebase.database().ref().child('agents').child(this.props.user.uid).child('avatarUrl');
    avatarRef.on('value', snap => {
      avatarUrl = snap.val()
    })
    let userAvatarChildren = <Avatar style={styles.userAvatarInside} src={avatarUrl} />
    // Find user's current state
    let currentUserState;
    let currentStateRef = firebase.database().ref().child('agents').child(this.props.user.uid).child('currentState');
    currentStateRef.on('value', snap => {
      currentUserState = snap.val()
    })
    let agentStates = [];
    let statesRef = firebase.database().ref().child('states');
    statesRef.on('value', snap => {
      for(let i in snap.val()) {
        let state = snap.val()[i]
        if(!state.viewOnTasks) {
          agentStates.push(
            <MenuItem key={i} ref="currentUserState" value={state.name} primaryText={state.name}
              disabled={true ? state.name === currentUserState : false}
              onClick={() => this.updateUserStatus(state.name)}/>
          )
        }
      }
    })

    return (
      <div className="navBar">
        <AppBar
          titleStyle={styles.titleStyle}
          title={<Link to={'/'} className="link" style={styles.titleStyle}>
                    <i className={this.props.mq ? "fa fa-tachometer fa-2x" : "fa fa-tachometer"}  aria-hidden="true" style={this.props.mq ? styles.logo : null}></i>
                    {this.props.mq ? <span style={styles.titleText}>Demo Dashboard</span> : null}
                  </Link>
                }
          zDepth={3}
          showMenuIconButton={false}
          iconElementRight={
            <div>
              {/* <Clock format={'HH:mm:ss'} ticking={true} /> */}
              {/* <Link to={'/home'} className="link"><IconButton iconClassName="material-icons" tooltip="Home">home</IconButton></Link> */}
              <Link to={'/about'} className="link"><IconButton iconClassName="material-icons" tooltip="About this project" touch={true}>assistant_photo</IconButton></Link>
              <Link to={'/'} className="link"><IconButton iconClassName="material-icons" tooltip="Home" touch={true}>home</IconButton></Link>
              <Link to={'/admin'} className="link"><IconButton iconClassName="material-icons" tooltip="Settings" touch={true}>settings</IconButton></Link>
              <a href="https://github.com/bsmanor/Demo-Dashboard" target="_blank" className="link" style={styles.githubLink}><i style={styles.githubIcon} className="fa fa-github fa-2x" aria-hidden="true"></i></a>
              <IconMenu
                anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                touchTapCloseDelay={100}
                iconButtonElement={<Avatar style={styles.userAvatar} src={avatarUrl} />}
              >
                <MenuItem style={styles.userIconMenu} primaryText={this.props.user.email} children={userAvatarChildren} disabled={true} />
                <Divider />
                <MenuItem primaryText="Set a status" rightIcon={<ArrowDropRight />}
                  menuItems={agentStates}
              />
                <MenuItem primaryText="Settings" onClick={this.handleUserSettingsOpen} />
                <Divider />
                <MenuItem primaryText="Sign out" onClick={this.props.logUserOut} />
              </IconMenu>

            </div>
          }
        />

        <Dialog
          modal={false}
          open={this.state.userDialogState}
          onRequestClose={this.handleUserSettingsClose}
        >
          <UserSettingsDialog close={this.handleUserSettingsClose} openSnack={this.props.openSnack} user={this.props.user} styles={this.props.styles} />

        </Dialog>
      </div>
    );
  }
}

export default NavBar;
