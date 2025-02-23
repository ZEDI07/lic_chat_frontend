
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CameraType } from 'expo-image-picker';
import { useContext, useRef, useState } from 'react';
import { Button, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { closeIcon, flashoffIcon, flashonIcon } from '../constant/icons';
import { AppContext } from '../context/app';
import { MessageContext } from '../context/message';

export default function CameraScreen() {
  const { Styles } = useContext(AppContext)
  const { setEnableShare, setAttach } = useContext(MessageContext)
  const [facing, setFacing] = useState(CameraType.front);
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef(null);
  const [flash, setFlash] = useState(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    setFlash(false)
  }

  const takePicture = async () => {
    const result = await camera.current.takePictureAsync();
    const filePath = result.uri.split("/");
    const fileName = filePath[filePath.length - 1];
    if (Platform.OS == "web") {
      fetch(result.uri).then((response) => {
        return response.blob()
      }).then((fileBlob) => {
        setAttach([{ ...result, uri: result.uri, mimeType: fileBlob.type, fileSize: fileBlob.size, blob: fileBlob }])
      });
    } else {
      setAttach([{ ...result, "mimeType": "image/jpeg", "type": "image", name: fileName }]);
    }
    setEnableShare(null)
  };
  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={camera} style={styles.camera} ImageType="jpg" facing={facing} flash={flash ? "on" : "off"} >
        <View style={styles.cameraContainer}>

          <Pressable onPress={() => setEnableShare(null)} style={styles.backbutton}>
            <View style={Styles.icon24}>{closeIcon(Styles.iconwhite)}</View>
          </Pressable>

          <View style={styles.camerabuttons}>
            <View style={{ height: 50, width: 50 }}>
              {Platform.OS !== "web" && facing == CameraType.back ? <TouchableOpacity style={styles.camerabuttonsitem} onPress={() => setFlash(prev => !prev)}>
                <View style={Styles.icon30}>{flash ? flashonIcon(Styles.iconwhite) : flashoffIcon(Styles.iconwhite)}</View>
              </TouchableOpacity> : null}
            </View>
            <View>
              <Pressable onPress={takePicture} style={styles.capturebutton}>
                <View style={styles.capturebuttoncircle}></View>
              </Pressable>
            </View>
            <View style={{ height: 50, width: 50 }} >
              {Platform.OS !== "web" ? <TouchableOpacity style={{ ...styles.camerabuttonsitem }} onPress={toggleCameraFacing}>
                <View style={Styles.icon30}>{cameraswitchIcon(Styles.iconwhite)}</View>
              </TouchableOpacity> : null}
            </View>
          </View>
          {/* {
            facing == CameraType.back ? <TouchableOpacity style={styles.button} onPress={() => setFlast(prev => !prev)}>
              <Text style={styles.text}>Flash</Text>
            </TouchableOpacity> : null
          } */}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  backbutton: {
    backgroundColor: "#0000005c",
    width: 40,
    height: 40,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 10,
    top: 10,
  },
  camerabuttons: {
    position: "absolute",
    left: 0,
    bottom: 0,
    paddingHorizontal: 40,
    paddingVertical: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 30,
  },
  camerabuttonsitem: {
    backgroundColor: "#0000005c",
    width: 50,
    height: 50,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  capturebutton: {
    borderColor: "#ffffffcf",
    borderRadius: 100,
    borderWidth: 2,
    padding: 10,
    height: 80,
    width: 80
  },
  capturebuttoncircle: {
    backgroundColor: "#ffffffcf",
    borderRadius: 100,
    height: "100%",
    width: "100%"
  }
});