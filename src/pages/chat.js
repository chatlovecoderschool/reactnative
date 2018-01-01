import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  KeyboardAvoidingView
} from "react-native";
import {
  GiftedChat,
  Actions,
  Bubble,
  SystemMessage
} from "react-native-gifted-chat";
import TopBar from "../components/topBar";
import SendBird from 'sendbird';
var sb = null;
var myUserId;
var ImagePicker = require("react-native-image-picker");
var ipOptions = {
  title: "Select Image File To Send",
  mediaType: "photo",
  noData: true
};
const ChatView = Platform.select({
  ios: () => KeyboardAvoidingView,
  android: () => View
})();

class Chat extends Component {
  constructor(props) {
    super(props);
    sb = SendBird.getInstance();
    console.log("sb", sb)
    myUserId = sb.currentUser.userId;
    console.log("userId", myUserId)
    this.state = {
      channel: props.navigation.state.params.channel,
      messages: [],
      loadEarlier: true,
      typingText: null,
      isLoadingEarlier: false,
      hasRendered: false,
      messageQuery: props.navigation.state.params.channel.createPreviousMessageListQuery(),
      lastMessage: null,
    };

    this._isMounted = false;
    this.onSend = this.onSend.bind(this);
    this.onReceive = this.onReceive.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderSystemMessage = this.renderSystemMessage.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.onLoadEarlier = this.onLoadEarlier.bind(this);
    this._isAlright = null;
  }

  componentWillMount() {
    this._isMounted = true;
    this.setState(() => {
      return {
        messages: []
        // require('./data/messages.js'),
      };
    });
  }

  componentDidMount() {
    var _SELF = this
    if (!_SELF.state.hasRendered) {
      _SELF.state.hasRendered = true;
      _SELF.getChannelMessage(false);
      if (_SELF.state.channel.channelType == "group") {
        _SELF.state.channel.markAsRead();
      }

      // channel handler
      var ChannelHandler = new sb.ChannelHandler();
      ChannelHandler.onMessageReceived = function(channel, message) {
        console.log("onMessageReceived")
        if (channel.url == _SELF.state.channel.url) {
          console.log("onMessageReceived: ", message)
          var newMessage;
          if (message._sender != null){
            var _id;
            if (message._sender.userId == myUserId){
              _id = 1
            } else {
              _id = message.messageId
            }
            newMessage = {
              _id: message.messageId,
              text: message.message,
              createdAt: message.createdAt,
              user: {
                _id: _id,
                name: message._sender.nickname,
                avatar: message._sender.profileUrl
              },
            }
          } else {
            newMessage = {
              _id: message.messageId,
              text: message.message,
              createdAt: message.createdAt,
              system: true
            }
          }
          console.log("new message: ", newMessage);
          _SELF.setState(previousState => {
            return{
              messages: GiftedChat.append(previousState.messages, newMessage)
            };
          });
          _SELF.state.lastMessage = message;
          if (_SELF.state.channel.channelType == "group") {
            _SELF.state.channel.markAsRead();
          }
      };
    }
    sb.addChannelHandler("ChatView", ChannelHandler);

    var ConnectionHandler = new sb.ConnectionHandler();
    ConnectionHandler.onReconnectSucceeded = function() {
      _SELF._getChannelMessage(true);
      _SELF.state.channel.refresh();
    };
    sb.addConnectionHandler("ChatView", ConnectionHandler);
    console.log("after didmount: ChannelHandler: ", ChannelHandler);
    console.log("after didmount: sendBird: ", sb);
  }
  }

  componentWillUnmount() {
    sb.removeChannelHandler("ChatView");
    sb.removeConnectionHandler("ChatView");
    this._isMounted = false;
  }

  onLoadEarlier() {
    this.setState(previousState => {
      return {
        isLoadingEarlier: true
      };
    });

    setTimeout(() => {
      if (this._isMounted === true) {
        this.setState(previousState => {
          return {
            messages: [],
            loadEarlier: false,
            isLoadingEarlier: false
          };
        });
      }
    }, 1000); // simulating network
  }

  onSend(messages = []) {
    var _SELF = this;
    _SELF.state.channel.sendUserMessage(messages[0].text, '', function(message, error) {
      if (error) {
        console.log(error);
        return;
      }
      _SELF.state.lastMessage = message;
      // _SELF.setState({text: '', disabled: true});
      _SELF.setState(previousState => {
        console.log("previousState", previousState)
        console.log("messages", messages)
        return {
          messages: GiftedChat.append(previousState.messages, messages)
        };
      });
    });
  }

  getChannelMessage(refresh) {
    var _SELF = this;
    if(refresh){
      _SELF.state.messageQuery = _SELF.props.navigation.state.params.channel.createPreviousMessageListQuery();
      _SELF.state.messages = [];
    }
    if (!_SELF.state.messageQuery.hasMore) {
      return;
    }
    _SELF.state.messageQuery.load(20, false, function(response, error){
      if (error) {
        console.log('Get Message List Fail.', error);
        return;
      }
      console.log("responseGetMessageChannel", response)
      var _messages = [];
      for (var i = 0 ; i < response.length ; i++) {
        if (response[i]._sender != null){
          var _id;
          if (response[i]._sender.userId == myUserId){
            _id = 1
          } else {
            _id = response[i]._sender.userId
          }
          var _curr = {
            _id: response[i].messageId,
            text: response[i].message,
            createdAt: response[i].createdAt,
            user: {
              _id: _id,
              name: response[i]._sender.nickname,
              avatar: response[i]._sender.profileUrl
            },
          }
        } else {
          var _curr = {
            _id: response[i].messageId,
            text: response[i].message,
            createdAt: response[i].createdAt,
            system: true
          }
        }
        _messages.push(_curr);
        console.log("state", _SELF.state)
        console.log("_curr", _curr)
        _SELF.state.lastMessage = _curr;
      }
      console.log("new message", _messages);
      var _newMessageList = _SELF.state.messages.concat(_messages.reverse());
      _SELF.setState({
        messages: _newMessageList,
      });
    });
  }

  onReceive(text) {
    this.setState(previousState => {
      return {
        messages: GiftedChat.append(previousState.messages, {
          _id: Math.round(Math.random() * 1000000),
          text: text,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: 'https://vignette.wikia.nocookie.net/vsbattles/images/e/e4/Kid_goku_picture.png',
          }
        })
      };
    });
  }

  renderCustomActions(props) {
    return null;
    // return (
    //   <Text
    //     style={styles.photoButton}
    //     onPress={() => {
    //       var _SELF = this;

    //       if (Platform.OS === "android") {
    //         sb.disableStateChange();
    //       }
    //       ImagePicker.showImagePicker(ipOptions, response => {
    //         if (Platform.OS === "android") {
    //           sb.enableStateChange();
    //         }
    //         if (response.didCancel) {
    //           console.log("User cancelled image picker");
    //         } else if (response.error) {
    //           console.log("ImagePicker Error: ", response.error);
    //         } else if (response.customButton) {
    //           console.log("User tapped custom button: ", response.customButton);
    //         } else {
    //           let source = { uri: response.uri };

    //           if (response.name) {
    //             source["name"] = response.fileName;
    //           } else {
    //             paths = response.uri.split("/");
    //             source["name"] = paths[paths.length - 1];
    //           }

    //           if (response.type) {
    //             source["type"] = response.type;
    //           }

    //           const CHECK_IMAGE_URI_INTERVAL =
    //             Platform.OS === "android" ? 300 : 100;

    //           // This is needed to ensure that a file exists
    //           setTimeout(() => {
    //             // Use getSize as a proxy for when the image exists
    //             Image.getSize(response.uri, () => {
    //               _SELF.state.channel.sendFileMessage(source, function(
    //                 message,
    //                 error
    //               ) {
    //                 if (error) {
    //                   console.log(error);
    //                   return;
    //                 }

    //                 var _messages = [];
    //                 _messages.push(message);
    //                 if (
    //                   _SELF.state.lastMessage &&
    //                   message.createdAt - _SELF.state.lastMessage.createdAt >
    //                     1000 * 60 * 60
    //                 ) {
    //                   _messages.push({
    //                     isDate: true,
    //                     createdAt: message.createdAt
    //                   });
    //                 }

    //                 var _newMessageList = _messages.concat(
    //                   _SELF.state.messages
    //                 );
    //                 _SELF.setState({
    //                   messages: _newMessageList,
    //                   dataSource: _SELF.state.dataSource.cloneWithRows(
    //                     _newMessageList
    //                   )
    //                 });
    //                 _SELF.state.lastMessage = message;
    //               });
    //             });
    //           }, CHECK_IMAGE_URI_INTERVAL);
    //         }
    //       });
    //     }}
    //   >
    //     Add
    //   </Text>
    // );
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#f0f0f0"
          }
        }}
      />
    );
  }

  renderSystemMessage(props) {
    return (
      <SystemMessage
        {...props}
        containerStyle={{
          marginBottom: 15
        }}
        textStyle={{
          fontSize: 14
        }}
      />
    );
  }

  renderCustomView(props) {
    return null;
  }

  renderFooter(props) {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>{this.state.typingText}</Text>
        </View>
      );
    }
    return null;
  }

  render() {
    return (
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend}
          loadEarlier={this.state.loadEarlier}
          onLoadEarlier={this.onLoadEarlier}
          isLoadingEarlier={this.state.isLoadingEarlier}
          user={{
            _id: 1 // sent messages should have same user._id
          }}
          renderActions={this.renderCustomActions}
          renderBubble={this.renderBubble}
          renderSystemMessage={this.renderSystemMessage}
          renderCustomView={this.renderCustomView}
          renderFooter={this.renderFooter}
        />
    );
  }
}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10
  },
  footerText: {
    fontSize: 14,
    color: "#aaa"
  }
});

export default Chat;
