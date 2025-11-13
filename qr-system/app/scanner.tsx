import { Button, View, Text, StyleSheet } from 'react-native'
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function scanner() {

  const [permission, requestPermission] = useCameraPermissions()

  if (!permission) {
    return (
      <View></View>
    )
  }

    if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 justify-center items-center bg-white'>
      <CameraView className='flex-1' facing='front'/>
      <Text>This is scanner</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});