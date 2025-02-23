import { Audio } from "expo-av";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { pauseIcon, playIcon } from "../../constant/icons";
import { AppContext } from "../../context/app";

const Recording = ({ enableRecording, setRecording }) => {
  const onRecord = useRef();
  const { Styles } = useContext(AppContext)
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [duration, setDuration] = useState(0);
  const [recordingStarted, setRecordingStarted] = useState(false);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      onRecord.current = recording
      setRecordingStarted(true)
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    await onRecord.current.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = onRecord.current.getURI();
    setRecording({ uri: uri, duration: onRecord.current._finalDurationMillis });
  }

  async function toggleRecording() {
    if (!recordingStarted) {
      await onRecord.current.startAsync();
    } else await onRecord.current.pauseAsync();
    setRecordingStarted((prev) => !prev);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      recordingStarted && setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [recordingStarted]);

  async function getPermission() {
    try {
      if (permissionResponse && permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      startRecording();
    } catch (error) {
      console.log("error while recording", error)
    }
  }

  useEffect(() => {
    // Simply get recording permission upon first render
    // Call function to get permission
    startRecording();
    // Cleanup upon first render
    return () => stopRecording();
  }, []);

  return useMemo(
    () => (
      <View style={Styles.audiorecordwrap}>
        <Pressable
          onPress={() => toggleRecording()}
          style={{ ...Styles.composermainoption, ...Styles.itemCenter }}
        >
          <View style={Styles.icon24}>
            {recordingStarted ? pauseIcon({ ...Styles.icondefault }) : playIcon(Styles.icondefault)}
          </View>
        </Pressable>
        <View style={{ ...Styles.audiorecordmain, gap: 5 }}>
          <View style={Styles.audiorecorddot}></View>
          <Text style={Styles.fontdefault}>
            {String(Math.floor(duration / 60)).padStart(2, "0")}:
            {String(duration % 60).padStart(2, "0")}
          </Text>
        </View>
      </View>
    ),
    [enableRecording, duration, recordingStarted]
  );
};

export default Recording;