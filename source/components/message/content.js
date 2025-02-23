import { ResizeMode, Video } from "expo-av";
import { useContext, useState } from "react";
import { ActivityIndicator, Image, Linking, Modal, Platform, Pressable, Text, View } from "react-native";
import { Path, Svg } from "react-native-svg";
import { useSelector } from "react-redux";
import { CallStatusIcon } from "../../components/call/callStatusIcon";
import { CALL_STATUS, CALL_TYPE, CHAT_TYPE, CONTENT_TYPE, GENERAL_SETTING_KEY, SCREEN } from "../../constant";
import { callIcon, contactIcon, fileIcon, missedcallInIcon, playIcon, documentIcon } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { AuthContext } from "../../context/auth";
import { MessageContext } from "../../context/message";
import { formatDuration } from "../../utils/helper";
import MessageContentType from "../messageContentType";
import ViewMap from "./mapView";
import TrackPlayer from "./trackPlayer";

export const CallStatus = ({ message }) => {
  const { translation } = useContext(AppContext);
  const { USER_ID } = useContext(AuthContext);
  if (message.startedAt && message.endAt)
    return formatDuration({ startTime: message.startedAt, endTime: message.endAt });
  if ((!message.startedAt || (message.receiverType == CHAT_TYPE.group && message.startedAt)) && !message.endAt)
    return translation.inProgress;
  if (!message.startedAt && message.endAt) {
    if (message.sender == USER_ID)
      return translation.noAnswer;
    else return translation.missedCall;
  }
  return "Ongoing"
}

export const Content = ({ message, chat, color }) => {
  const { setShowImage, translation, handleOpenNavigate, Styles, generalSettings, handleCall, handleCallJoin, setConfimationDialog, setContactView } = useContext(AppContext);
  const { USER_ID, user: USER, setGroupJoinDialog } = useContext(AuthContext);
  const messageContext = useContext(MessageContext)
  const [expanded, setExpanded] = useState(message?.text?.length > 350 ? false : true);
  const user = useSelector(state => state.groups[chat?._id]?.membersObj?.[message.sender])
  const toggleExpanded = () => setExpanded((prev) => !prev);
  const [mapFullView, setMapFullView] = useState(false)

  const handleGroupLink = () => {
    const urlArray = message.link.url.split("/");
    const token = urlArray[urlArray.length - 1];
    setGroupJoinDialog(token);
  };

  let text = message?.text;
  if (message.mentions && message.mentions.length) {
    text = message.text.split(" ").map((word, index) => {
      const mention = message.mentions.find(
        (mention) => `@${mention._id}` === word
      );
      if (mention) {
        return (
          <Text
            onPress={() =>
              USER_ID != mention._id &&
              handleOpenNavigate(mention._id, SCREEN.profile)
            }
            key={index}
            style={{ ...Styles.fontlink }}
          >
            {" "}
            @{mention.name}
          </Text>
        );
      } else {
        return <Text key={index}> {word}</Text>;
      }
    });
  }
  switch (message.contentType) {
    case CONTENT_TYPE.text:
      return (
        <>
          {message.link ? (
            <Pressable
              onPress={() => {
                if (
                  message.link.url.includes(
                    generalSettings?.[GENERAL_SETTING_KEY.domain] + "/group-join/"
                  )
                ) {
                  handleGroupLink();
                } else Linking.openURL(message.link.url);
              }}
              style={{ ...Styles.messageitemattachmentlink }}
            >
              {message.link.image ||
                message.link.description ||
                message.link.description ? (
                <>
                  <View style={Styles.messageitemattachmentlinkimg}>
                    <Image
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                      source={{ uri: message.link.image }}
                    />
                  </View>
                  <View style={{ ...Styles.messageitemattachmentlinkinfo }}>
                    <Text
                      style={{ ...Styles.fontBold, ...Styles.fontdefault }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {message.link.title}
                    </Text>
                    <Text
                      style={{
                        ...Styles.fontsizesmall,
                        ...Styles.fontdefault,
                        ...Styles.mtop2,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {message.link.description}
                    </Text>
                    <Text
                      style={{
                        ...Styles.fontsizesmall,
                        ...Styles.fontlight,
                        ...Styles.mtop2,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {message.link.url}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={{ ...Styles.messageitemattachmentlinkinfo }}>
                  <Text
                    style={{
                      ...Styles.messageitembodytext,
                      color: color,
                      ...Styles.fontlink,
                    }}
                  >
                    {message.link.url}
                  </Text>
                </View>
              )}
            </Pressable>
          ) : expanded ? (
            <Text style={{ ...Styles.messageitembodytext, color: color }}>
              {text}
            </Text>
          ) : (
            <>
              <Text
                numberOfLines={10}
                ellipsizeMode={"tail"}
                style={{ ...Styles.messageitembodytext, color: color }}
              >
                {text}
              </Text>
              <Pressable onPress={toggleExpanded}>
                <Text
                  style={{
                    ...Styles.messageitembodytextmore,
                    ...Styles.fontsizesmall,
                  }}
                >{`${translation.viewMore}...`}</Text>
              </Pressable>
            </>
          )}
        </>
      );
    case CONTENT_TYPE.image:
      return (
        <>
          <Pressable onPress={() => setShowImage({ ...message, chat, messages: messageContext?.messages.filter(message => [CONTENT_TYPE.image, CONTENT_TYPE.video].includes(message.contentType)).reverse() })}>
            <Image
              style={{ ...Styles.messageitemattachmentphoto }}
              source={{ uri: message.media }}
              alt="No image"
            />
          </Pressable>
          {message.text ? (
            <Text
              style={{
                ...Styles.messageitembodytext,
                ...Styles.mtop5,
                color: color,
              }}
            >
              {message.text}
            </Text>
          ) : null}
        </>
      );
    case CONTENT_TYPE.video:
      return (
        <>
          <Pressable onPress={() => setShowImage({ ...message, chat, messages: messageContext?.messages.filter(message => [CONTENT_TYPE.image, CONTENT_TYPE.video].includes(message.contentType)).reverse() })}>
            <View style={Styles.messageitemattachmentvideo}>
              <Video
                style={{ ...Styles.messageitemattachmentvideoitem }}
                videoStyle={{
                  ...Styles.messageitemattachmentvideoplayer,
                  ...Styles.bgdark,
                }}
                source={{ uri: message.media }}
                useNativeControls={false}
                resizeMode={ResizeMode.COVER}
                isLooping={false}
                usePoster
              />
              {message.media ? (
                <View
                  style={{
                    ...Styles.mediacontaineritemvideoplay,
                    ...Styles.itemCenter,
                  }}
                >
                  {playIcon({ fill: "#fff", height: 30, width: 30 })}
                </View>
              ) : (
                <View
                  style={{
                    ...Styles.mediacontaineritemvideoplay,
                    ...Styles.itemCenter,
                  }}
                >
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>
          </Pressable>
          {/* <Video
            style={{ ...Styles.messageitemattachmentvideoitem }}
            videoStyle={{ ...Styles.messageitemattachmentvideoplayer }}
            source={{ uri: message.media }}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping
            // onPlaybackStatusUpdate={status => setStatus(() => status)}
          /> */}
          {message.text ? (
            <Text style={{ color: color }}>{message.text}</Text>
          ) : null}
        </>
      );
    case CONTENT_TYPE.application:
      return (
        <Pressable onPress={() => Linking.openURL(message.media)}>
          <View style={{ ...Styles.messageitemattachment, ...Styles.fdrow }}>
            <View
              style={{
                ...Styles.messageitemattachmentimg,
                ...Styles.itemCenter,
              }}
            >
              <View style={{ ...Styles.messageitemattachmenticon }}>
                {documentIcon(Styles.iconwhite)}
              </View>
            </View>
            <View style={{ ...Styles.messageitemattachmentinfo }}>
              <Text
                style={{ ...Styles.fontBold, color: color }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {message.mediaDetails.originalname}
              </Text>
              <Text
                style={{
                  ...Styles.fontsizesmall,
                  ...Styles.fontlight,
                  ...Styles.mtop2,
                }}
              >
                {Math.floor(message.mediaDetails.mediaSize / 1024)} Kb
                &#x2022; {message?.mediaDetails?.mimetype?.split("/")[1]}{" "}
              </Text>
            </View>
          </View>
          {message.text ? (
            <Text style={{ color: color, ...Styles.mtop5 }}>
              {message.text}
            </Text>
          ) : null}
        </Pressable>
      );
    case CONTENT_TYPE.location:
      return !mapFullView ? <Pressable onPress={() => Platform.OS == "web" ? Linking.openURL(`https://maps.google.com/maps?q=${message.location.coordinates[1]},${message.location.coordinates[0]}`) : setMapFullView(true)} style={{ ...Styles.messagemapitemattachment }}>
        <View style={{ ...Styles.messagemapitemattachmentimg }}>
          <ViewMap coordinates={message.location.coordinates} zoomEnabled={false} />
        </View>
        {message.title || message.subtitle ? < View style={{ ...Styles.messagemapitemattachmentinfo }}>
          {message.title ? <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ ...Styles.fontBold, color: color }}
          >
            {message.title}
          </Text> : null}
          {message.subtitle ? <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ ...Styles.fontsizesmall, color: color }}
          >
            {message.subtitle}
          </Text> : null}
        </View> : null}
      </Pressable> :
        <Modal
          animationType="fade"
          transparent={true}
          visible={mapFullView}
          onRequestClose={() => setMapFullView(false)}
          statusBarTranslucent>
          <View style={{ ...Styles.modalContainer, marginTop: 20 }}>
            <ViewMap onClose={() => setMapFullView(false)} coordinates={message.location.coordinates} />
          </View>
        </Modal>
    case CONTENT_TYPE.contact:
      return (
        <View style={Styles.messageitemattachmentcontact}>
          <Pressable onPress={() => setContactView(message.contact)} style={{ ...Styles.messageitemattachment }}>
            <View style={{ ...Styles.messageitemattachmentimg, ...Styles.itemCenter, backgroundColor: "#8fad62" }}>
              <View style={{ ...Styles.messageitemattachmenticon }}>
                {contactIcon(Styles.iconwhite)}
              </View>
            </View>
            <View style={{ ...Styles.messageitemattachmentinfo }}>
              <Text style={{ ...Styles.fontBold, color: color }}>
                {`${message.contact[0].name} ${message.contact.length > 1 ? ` & ${message.contact.length - 1} others` : ""}`}
              </Text>
            </View>
          </Pressable>
          {/* <Pressable
            onPress={() => setContactView(message.contact)}
            style={{
              ...Styles.messageitemattachmentfooter,
              borderColor: color,
            }}
          >
            <Text
              style={{
                ...Styles.textcenter,
                ...Styles.fontsizesmall,
                color: color,
              }}
            >
              {translation.viewAll}
            </Text>
          </Pressable> */}
        </View>
      );
    case CONTENT_TYPE.deleted:
      return (
        <View
          style={{ ...Styles.messageitembodytext, ...Styles.messagedeleted }}
        >
          <Svg
            viewBox="0 0 24 24"
            style={{
              ...Styles.messagedeletedicon,
              ...Styles.iconlight,
              ...Styles.icon16,
              marginTop: 3,
            }}
          >
            <Path d="M0 0h24v24H0V0z" fill="none"></Path>
            <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"></Path>
          </Svg>
          <Text style={{ ...Styles.fontlight, fontStyle: "italic" }}>
            {message.deletedBy == USER_ID ? translation.youMessageDeleted : translation.messageDeleted}
          </Text>
        </View>
      );
    case CONTENT_TYPE.audio:
      return (
        <>
          <View style={{ ...Styles.audiorecordedtrackwrap, width: 150 }}>
            <Image
              style={{ ...Styles.audiotrackimg }}
              source={{ uri: message.sender == USER_ID ? USER.avatar : chat.chatType == CHAT_TYPE.user ? chat.avatar : user.avatar }}
            />
            <TrackPlayer trackUri={message.media} playerOnly={true} />
          </View>
        </>
      );
    case CONTENT_TYPE.audioCall:
      return <>
        <Pressable
          onPress={() =>
            message.status == CALL_STATUS.ended ?
              setConfimationDialog({
                heading: `Voice call ${chat.name}`,
                callback: handleCall,
                chat: { callType: CALL_TYPE.audio, chat: chat },
              }) :
              setConfimationDialog({
                heading: `Join Voice call ${chat.name}`,
                callback: handleCallJoin,
                chat: { chat: chat._id, channel: message._id, receiverType: chat.chatType },
              })}

          style={{ ...Styles.messagecallattachment }}>
          <View style={{ ...Styles.messagecallattachmentimg, ...Styles.itemCenter }}>
            <View style={{ ...Styles.icon, ...Styles.icon24 }}>
              {
                (message.sender !== USER_ID && (!message.startedAt && message.endAt)) ?
                  missedcallInIcon(Styles.icondanger) :
                  <CallStatusIcon callMode={message.call.callMode} message={message} />
              }
            </View>
          </View>
          <View style={{ ...Styles.messagecallattachmentinfo }}>
            <Text style={{ ...Styles.fontBold, color: color }} numberOfLines={1} ellipsizeMode="tail">{translation.voiceCall}</Text>
            <Text style={{ ...Styles.fontsizesmall, ...Styles.fontlight, ...Styles.mtop2 }}>
              <CallStatus message={message} />
            </Text>
          </View>
        </Pressable>
        {message.status !== CALL_STATUS.ended ?
          <Pressable onPress={() =>
            setConfimationDialog({
              heading: `Join Voice call ${chat.name}`,
              callback: handleCallJoin,
              chat: { chat: chat._id, channel: message._id, receiverType: chat.chatType },
            })}
            style={{ ...Styles.joincallbtn, ...Styles.btn, ...Styles.btnSuccess, ...Styles.mtop5, paddingVertical: 8, }}>
            <View style={{ ...Styles.icon16 }}>{callIcon(Styles.iconwhite)}</View>
            <Text style={{ ...Styles.btnSuccessTxt, ...Styles.textcenter }}>Join Call</Text>
          </Pressable>
          : null}
      </>
    case CONTENT_TYPE.videoCall:
      return <>
        <Pressable
          onPress={() => message.status == CALL_STATUS.ended ?
            setConfimationDialog({
              heading: `Video call ${chat.name}`,
              // message: translation.unblockDescription,
              callback: handleCall,
              chat: { callType: CALL_TYPE.video, chat: chat },
            }) :
            setConfimationDialog({
              heading: `Join Video call ${chat.name}`,
              // message: translation.unblockDescription,
              callback: handleCallJoin,
              chat: { chat: chat._id, channel: message._id, receiverType: chat.chatType },
            })
          }
          style={{ ...Styles.messagecallattachment }}>
          <View style={{ ...Styles.messagecallattachmentimg, ...Styles.itemCenter }}>
            <View style={{ ...Styles.icon, ...Styles.icon24 }}>
              {
                (message.sender !== USER_ID && (!message.startedAt && message.endAt)) ?
                  missedcallInIcon(Styles.icondanger) :
                  <CallStatusIcon callMode={message.call.callMode} message={message} />
              }
            </View>
          </View>
          <View style={{ ...Styles.messagecallattachmentinfo }}>
            <Text style={{ ...Styles.fontBold, color: color }} numberOfLines={1} ellipsizeMode="tail">{translation.videoCall}</Text>
            <Text style={{ ...Styles.fontsizesmall, ...Styles.fontlight, ...Styles.mtop2 }}>
              <CallStatus message={message} />
            </Text>
          </View>
        </Pressable>
        {message.status !== CALL_STATUS.ended ?
          <Pressable onPress={() =>
            setConfimationDialog({
              heading: `Join Video call ${chat.name}`,
              // message: translation.unblockDescription,
              callback: handleCallJoin,
              chat: { chat: chat._id, channel: message._id, receiverType: chat.chatType },
            })}
            style={{ ...Styles.joincallbtn, ...Styles.btn, ...Styles.btnSuccess, ...Styles.mtop5, paddingVertical: 8, }}>
            <View style={{ ...Styles.icon16 }}>{callIcon(Styles.iconwhite)}</View>
            <Text style={{ ...Styles.btnSuccessTxt, ...Styles.textcenter }}>Join Call</Text>
          </Pressable>
          : null}
      </>
    default:
      return (
        <View style={Styles.messageitembodytext}>
          <Text style={{ fontStyle: "italic" }}>
            Content Type is {message.contentType}
          </Text>
        </View>
      );
  }

};

const MessageContent = ({ message, color, chat }) => {
  const { translation, Styles } = useContext(AppContext);
  const { USER_ID } = useContext(AuthContext);
  const messageContext = useContext(MessageContext);
  const user = useSelector(state => state.groups[chat?._id]?.membersObj?.[message.sender])

  const { reply } = message;

  return (
    <>
      {reply && !message.deleted ? (
        <Pressable
          onPress={() =>
            !reply.delete &&
            !reply.message_deleted &&
            messageContext?.handleFlatlistScroll(reply._id)
          }
          style={Styles.messageReply}
        >
          <View style={{ ...Styles.messageReplyitem }}>
            <View style={Styles.messageReplyiteminfo}>
              <Text style={{ ...Styles.messageReplyitemname, color: color }}>
                {reply.sender == USER_ID ? translation.you : chat.chatType == CHAT_TYPE.user ? chat.name : user.name}
              </Text>
              <View style={Styles.messageReplyitemfooter}>
                <MessageContentType message={reply} />
              </View>
            </View>
            {reply.media ? (
              <View
                style={{
                  ...Styles.messageReplyitemimg,
                  ...{ height: 50, width: 50, borderRadius: 5 },
                }}
              >
                <Image
                  style={{ height: 50, width: 50, borderRadius: 5 }}
                  source={{ uri: reply.media }}
                />
              </View>
            ) : null}
          </View>
        </Pressable>
      ) : null}
      <Content message={message} chat={chat} color={color} />
    </>
  );
};

export default MessageContent;
