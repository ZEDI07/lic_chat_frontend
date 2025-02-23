import { ResizeMode, Video } from "expo-av";
import moment from "moment";
import { Fragment, memo, useContext, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import PagerView from "react-native-pager-view";
import { CONTENT_TYPE } from "../constant";
import { closeIcon } from "../constant/icons";
import { AppContext } from "../context/app";
import { AuthContext } from "../context/auth";
import { ImageZoom } from '../library/Native_ZoomView/src/index';


const ViewImage = ({ uri }) => {
  const { Styles } = useContext(AppContext);
  const [scale, setScale] = useState(1)

  return <ImageZoom
    uri={uri}
    minScale={1}
    maxScale={5}
    doubleTapScale={2}
    minPanPointers={1}
    isDoubleTapEnabled
    maxPanPointers={1}
    handlePinch={(value) => { setScale(value.scale) }}
    isPanEnabled={scale > 1}
    onDoubleTap={(event) => {
      if (event == "ZOOM_IN") setScale(2)
      else setScale(1)
    }}
    style={Styles.mediaModelimg}
    resizeMode="center"
  />
}

export default memo(() => {
  const { showImage, setShowImage, translation, Styles } = useContext(AppContext);
  const onClose = () => setShowImage(null);
  const { USER_ID } = useContext(AuthContext);
  const [media, setMedia] = useState(showImage?.messages || [showImage]);
  const index = media.findIndex(ele => ele._id == showImage._id);

  return (
    <Modal
      animationType="fade"
      visible={showImage ? true : false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView>
        <View style={{ ...Styles.modalContainer }}>
          <View style={Styles.modalmain}>
            <PagerView style={Styles.mediaModel} initialPage={index}>
              {
                Object.values(media).map(showImage =>
                  <Fragment key={`show_image_${showImage._id}`}>
                    <View style={Styles.mediaModelheader}>
                      <Pressable
                        onPress={onClose}
                        style={Styles.mediaModelheaderOption}
                      >
                        <View
                          style={{
                            ...Styles.mediaModelheaderOptionicon,
                            ...Styles.icon24,
                          }}
                        >
                          {closeIcon(Styles.iconwhite)}
                        </View>
                      </Pressable>
                      {showImage.sender ||
                        (showImage.receiver && showImage.createdAt) ? (
                        <View style={Styles.mediaModelheaderInfo}>
                          <Text
                            style={{ ...Styles.mediaModelheadertitle }}
                            numberOfLines={1}
                          >
                            {showImage.sender == USER_ID
                              ? translation.you
                              : showImage.chat?.name}
                          </Text>
                          <Text
                            style={{ ...Styles.mediaModelheaderstatus }}
                            numberOfLines={1}
                          >
                            {moment(showImage.createdAt).format("MMM D, YYYY")}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={Styles.mediaModelcontainer}>
                      <View style={{ ...Styles.appmediaModelMediaitem }}>
                        {showImage.contentType == CONTENT_TYPE.video ? (
                          <Video
                            style={Styles.appmediaModelvideo}
                            videoStyle={{
                              ...Styles.appmediaModelvideoplayer, ...Styles.bgdark
                            }}
                            source={{ uri: showImage.media }}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping={false}
                            shouldPlay={false}
                          />
                        ) : (
                          <ViewImage uri={showImage.media} />
                        )}
                      </View>
                    </View>
                  </Fragment>
                )
              }
            </PagerView>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal >
  );
  return null;
})

