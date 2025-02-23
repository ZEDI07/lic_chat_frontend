import * as Location from "expo-location";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, PermissionsAndroid, Platform, Pressable, Text, View } from "react-native";
import MapView, { Marker } from "../../library/Map";
import { CONTENT_TYPE, MESSAGE_STATUS } from "../../constant";
import { AppContext } from "../../context/app";
import { AuthContext } from '../../context/auth';
import { MessageContext } from "../../context/message";
import { backIcon, sendIcon } from "../../constant/icons";

export default ({ coordinates, onClose, zoomEnabled = true, scrollEnabled = false }) => {
  const { USER_ID } = useContext(AuthContext)
  const { chat, setEnableShare, send } = useContext(MessageContext);
  const { Styles, translation } = useContext(AppContext);
  const [region, setRegion] = useState(null);
  const [fetching, setFetching] = useState(!coordinates);
  const [markerCoordinate, setMarkerCoordinate] = useState(null);

  const getLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission denied");
          return;
        }
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      const position = await Location.getCurrentPositionAsync();
      console.log("CURRENT LOCATION", position)
      const { latitude, longitude } = position.coords;
      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(initialRegion);
      setMarkerCoordinate({ latitude, longitude });
      setFetching(false);
    } catch (err) {
      console.log("error while getting location", err)
    }
  }

  const shareLocation = async () => {
    try {
      const refId = `${USER_ID}_${String(Date.now())}`
      const data = {
        refId: refId,
        type: CONTENT_TYPE.location,
        to: chat._id,
        receiverType: chat.chatType,
        location: {
          live: false,
          coordinates: [markerCoordinate.longitude, markerCoordinate.latitude]
        }
      }
      send({
        chat: chat._id, message: {
          _id: refId,
          forward: false,
          edited: false,
          deleted: false,
          fromMe: true,
          createdAt: new Date(),
          status: MESSAGE_STATUS.pending,
          starred: false,
          reactions: [],
          contentType: CONTENT_TYPE.location,
          ...data
        }, formData: data
      });
      setEnableShare(null);
    } catch (error) {
      console.log("error while sharing location", error)
    }
  }

  const handleMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoordinate({ latitude, longitude });
  };

  useEffect(() => {
    if (!coordinates)
      getLocation();
    else {
      const [longitude, latitude] = coordinates;
      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(initialRegion);
      setMarkerCoordinate({ latitude, longitude });
    }
  }, [])

  return <View style={{ ...Styles.mapView}}>
    {onClose ? <Pressable onPress={onClose} style={Styles.backbuttonT}>
      <View style={Styles.icon24}>{backIcon(Styles.iconwhite)}</View>
    </Pressable> : null}

    {!coordinates ? <View style={{...Styles.modalheader}}>
      <Pressable onPress={onClose} style={Styles.modalheaderOptionicon}>
        <View style={{ ...Styles.icon, ...Styles.icon24 }}>{backIcon(Styles.icondefault)}</View>
      </Pressable>
      <View style={Styles.chatBubbleHeaderInfo}>
        <View style={Styles.modalheaderinfo}>
          <Text style={{...Styles.modalheadertitle, textAlign:"left"}}>
            Share Location
          </Text>
        </View>
      </View>
    </View> : null}
    
    <MapView
      style={{ ...Styles.mapArea }}
      region={region}
      showsUserLocation={!coordinates}
      scrollEnabled={scrollEnabled}
      zoomEnabled={zoomEnabled}
      pitchEnabled={false}
      rotateEnabled={false}
    >
      {
        !fetching ?
          <Marker
            coordinate={markerCoordinate}
            title="Drag me!"
            draggable={!coordinates}
            onDragEnd={handleMarkerDragEnd}
          /> : null
      }
    </MapView>
    {!coordinates ?
      <View style={Styles.mapviewFooter}>
        {!fetching ? <Pressable onPress={shareLocation} title="Share Location" style={{...Styles.centermodalBtn, ...Styles.btnPrimary, marginTop:0}}>
          <Text style={{ ...Styles.fontwhite, ...Styles.textcenter, ...Styles.fontsizenormal}}>Share Location</Text>
        </Pressable> : <View style={{ ...Styles.centermodalBtn, ...Styles.btnPrimary, marginTop:0}} title="Share Location" >
          <ActivityIndicator size="small" color="#fff" />
        </View>}
      </View> : null}
  </View>
}
