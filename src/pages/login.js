import mapDispatchToProps from '../actions.js'
import {connect} from 'react-redux'
import React from 'react'
import Button from '../components/button'
import SendBird from 'sendbird'

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native'

import { checkAuthForm } from '../utils/utils'

const LoginView = Platform.select({
  ios: () => KeyboardAvoidingView,
  android: () => View
})()

var sb = null

export default class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      userId: '',
      username: '',
      connectLabel: 'CONNECT',
      errorMessage: ''
    }
    this._onPressConnect = this._onPressConnect.bind(this)
  }

  _onPressConnect () {
    Keyboard.dismiss()

    var validate = checkAuthForm(this.state.userId, this.state.username)
    if (validate.error !== null) {
      this.setState({
        userId: '',
        username: '',
        errorMessage: validate.errorMessage
      })
    }

    sb = SendBird.getInstance()

    var _SELF = this
    sb.connect(_SELF.state.userId, function (user, error) {
      if (error) {
        _SELF.setState({
          userId: '',
          username: '',
          errorMessage: 'Login Error'
        })
        console.log(error)
        return
      }

      if (Platform.OS === 'ios') {
        if (sb.getPendingAPNSToken()) {
          sb.registerAPNSPushTokenForCurrentUser(sb.getPendingAPNSToken(), function (result, error) {
            console.log('APNS TOKEN REGISTER AFTER LOGIN')
            console.log(result)
          })
        }
      } else {
        if (sb.getPendingGCMToken()) {
          sb.registerGCMPushTokenForCurrentUser(sb.getPendingGCMToken(), function (result, error) {
            console.log('GCM TOKEN REGISTER AFTER LOGIN')
            console.log(result)
          })
        }
      }

      sb.updateCurrentUserInfo(_SELF.state.username, '', function (response, error) {
        // Open Home screen
        _SELF.props.navigation.navigate('home')
        _SELF.setState({
          userId: '',
          username: '',
          errorMessage: '',
          connectLabel: 'CONNECT'
        })
      })
    })
  }

  _buttonStyle () {
    return {
      backgroundColor: '#e67e22',
      underlayColor: '#e67e22',
      borderColor: '#e67e22',
      disabledColor: '#ababab',
      textColor: '#ffffff'
    }
  }

  render () {
    return (
      <LoginView behavior='padding' style={styles.container} >
        <View style={styles.loginContainer}>
          <TextInput
            style={styles.input}
            value={this.state.userId}
            onChangeText={(text) => this.setState({userId: text})}
            onSubmitEditing={Keyboard.dismiss}
            placeholder={'Enter User ID'}
            maxLength={12}
            multiline={false}
          />
          <TextInput
            style={[styles.input, {marginTop: 10}]}
            value={this.state.username}
            onChangeText={(text) => this.setState({username: text})}
            onSubmitEditing={Keyboard.dismiss}
            placeholder={'Enter User Nickname'}
            maxLength={12}
            multiline={false}
          />

          <Button
            text={this.state.connectLabel}
            style={this._buttonStyle()}
            onPress={this._onPressConnect}
          />

          <Text style={styles.errorLabel}>{this.state.errorMessage}</Text>
        </View>
      </LoginView>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loginContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  input: {
    width: 250,
    color: '#555555',
    padding: 10,
    height: 50,
    borderColor: '#6E5BAA',
    borderWidth: 1,
    borderRadius: 4,
    alignSelf: 'center',
    backgroundColor: '#ffffff'
  },
  errorLabel: {
    color: '#ff0200',
    fontSize: 13,
    marginTop: 10,
    width: 250
  }
})
