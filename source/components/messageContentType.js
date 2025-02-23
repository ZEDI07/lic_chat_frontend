
import { useContext } from "react";
import { Text, View } from "react-native";
import { CONTENT_TYPE } from "../constant";
import { audioIcon, callincomingIcon, calloutgoingIcon, cameraIcon, deletedmsgIcon, documentIcon, videoIcon, videocallincomingIcon, videocalloutgoingIcon } from "../constant/icons";
import { AppContext } from "../context/app";
import { AuthContext } from "../context/auth";

const MessageContentType = ({ message }) => {
  const { translation, Styles } = useContext(AppContext);
  const { USER_ID } = useContext(AuthContext)
  switch (message.contentType) {
    case CONTENT_TYPE.image:
      return (
        <View style={Styles.chatListIteminfoBtmLeft}>
          <View style={{ ...Styles.icon, ...Styles.icon16 }}>{cameraIcon(Styles.iconlight)}</View>
          <Text style={Styles.chatListIteminfoMsg}>
            {message.text || translation.photo}
          </Text>
        </View>
      );
    case CONTENT_TYPE.text:
      let text = message?.text;
      if (message.mentions && message.mentions.length) {
        message.mentions.forEach(
          (mention) =>
            (text = text.replace(`@${mention._id}`, `@${mention.name}`))
        );
      }
      if(message.deleted){
        return (
          <View style={Styles.chatListIteminfoBtmLeft}>
            <View style={{ ...Styles.icon, ...Styles.icon16 }}>
              {deletedmsgIcon(Styles.iconlight)}
            </View>
            <Text style={Styles.chatListIteminfoMsg}>
              {translation.messageDeleted}
            </Text>
          </View>
        );
      } else {
        return (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={Styles.chatListIteminfoMsg}
          >
            {text}
          </Text>
        );
      }   
    case CONTENT_TYPE.application:
      return (
        <View style={Styles.chatListIteminfoBtmLeft}>
          <View style={{ ...Styles.icon, ...Styles.icon16 }}>{documentIcon(Styles.iconlight)}</View>
          <Text style={Styles.chatListIteminfoMsg}>
            {message.text || translation.document}
          </Text>
        </View>
      );
    case CONTENT_TYPE.audio:
      return (
        <View style={Styles.chatListIteminfoBtmLeft}>
          <View style={{ ...Styles.icon, ...Styles.icon16 }}>{audioIcon(Styles.iconlight)}</View>
          <Text style={Styles.chatListIteminfoMsg}>
            {message.text || translation.audio}
          </Text>
        </View>
      );
    case CONTENT_TYPE.video:
      return (
        <View style={Styles.chatListIteminfoBtmLeft}>
          <View style={{ ...Styles.icon, ...Styles.icon16 }}>
            {videoIcon(Styles.iconlight)}
          </View>
          <Text style={Styles.chatListIteminfoMsg}>
            {message.text || translation.video}
          </Text>
        </View>
      );
    case CONTENT_TYPE.deleted:
      return (
        <View style={Styles.chatListIteminfoBtmLeft}>
          <View style={{ ...Styles.icon, ...Styles.icon16 }}>
            {deletedmsgIcon(Styles.iconlight)}
          </View>
          <Text style={Styles.chatListIteminfoMsg}>
            {translation.messageDeleted}
          </Text>
        </View>
      );
    case CONTENT_TYPE.hidden:
      return <View style={Styles.chatListIteminfoMsg}></View>;
    case CONTENT_TYPE.audioCall:
      return <View style={Styles.chatListIteminfoBtmLeft}>
        <View style={{ ...Styles.icon, ...Styles.icon12 }}>{message.sender == USER_ID ? calloutgoingIcon(Styles.iconlight) : callincomingIcon(Styles.iconlight)}</View>
        <Text style={Styles.chatListIteminfoMsg}>
          {translation.voiceCall}
        </Text>
      </View>
    case CONTENT_TYPE.videoCall:
      return <View style={Styles.chatListIteminfoBtmLeft}>
        <View style={{ ...Styles.icon, ...Styles.icon12 }}>{message.sender == USER_ID ? videocalloutgoingIcon(Styles.iconlight) : videocallincomingIcon(Styles.iconlight)}</View>
        <Text style={Styles.chatListIteminfoMsg}>
          {translation.videoCall}
        </Text>
      </View>
    default:
      return (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={Styles.chatListIteminfoMsg}
        >
          {message.contentType}
        </Text>
      );
  }
};

export default MessageContentType;
