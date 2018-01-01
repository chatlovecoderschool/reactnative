import React from 'react'
import {
  StackNavigator,
  TabNavigator
} from 'react-navigation'
import {
  Image
} from 'react-native'
import Login from './pages/login'
import OpenChannel from './pages/openChannel'
import GroupChannel from './pages/groupChannel'
import CreateChannel from './pages/createChannel'
import Chat from './pages/chat'
import InviteUser from './pages/inviteUser'

const openChannelIconSelected = require('./img/community_selected.png')
const openChannelIconUnselected = require('./img/community_unselected.png')
const groupChannelIconSelected = require('./img/group_selected.png')
const groupChannelIconUnselected = require('./img/group_unselected.png')

const root = StackNavigator({
  login: {
    screen: Login,
    navigationOptions: {
      header: null
    }
  },
  chat: {
    screen: Chat
  },
  InviteUser: {
    screen: InviteUser,
    navigationOptions: {
      header: null
    }
  },
  CreateChannel: {
    screen: CreateChannel,
    navigationOptions: {
      header: null
    }
  },
  home: {
    screen: TabNavigator({
      'Open Channel': {
        screen: OpenChannel,
        navigationOptions: {
          header: null,
          tabBarIcon: ({ tintColor, focused }) => (
            <Image style={{ width: 32, height: 32 }} source={focused ? openChannelIconSelected : openChannelIconUnselected}/>
          )
        }
      },
      'Group Channel': {
        screen: GroupChannel,
        navigationOptions: {
          header: null,
          tabBarIcon: ({ tintColor, focused }) => (
            <Image style={{ width: 32, height: 32 }} source={focused ? groupChannelIconSelected : groupChannelIconUnselected}/>
          )
        }
      }
    }, {
      tabBarOptions: {
        activeTintColor: '#e67e22'
      }
    })
  }
})

export default root
