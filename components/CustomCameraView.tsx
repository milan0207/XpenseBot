import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef,useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { auth } from "../firebase/firebaseConfig";
import { uploadImage } from "../lib/uploadImage";
import { listenForResults } from "../lib/firestore";
import ResultListenerComponent from "../lib/firestore";
import * as ImagePicker from "expo-image-picker";

export default function CustomCameraView({
  onClose,
  onPictureTaken,
  onTextExtracted,
  onPictureSubmitted,
}: {
  onClose: () => void;
  onPictureTaken?: (uri: string) => void;
  onTextExtracted?: (text: string) => void;
  onPictureSubmitted?: (storagePath: string) => void;
}) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const unsubscribeRef = useRef<() => void>();
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current(); // Cleanup listener when component unmounts
      }
    };
  }, []);

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleImageCapture = async (photoUri: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      // Upload image and get storage path
      const storagePath = await uploadImage(photoUri, userId);

      // Pass storage path back to parent
      if (onPictureSubmitted) {
        await onPictureSubmitted(storagePath);
      }
    } catch (error) {
      console.error("Error handling image:", error);
    }
    onClose();
  };
  const handlePickFromGallery = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    alert('A galéria eléréséhez engedélyre van szükség!');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled && result.assets) {
    const uri = result.assets[0].uri;
    setCapturedImage(uri);
    if (onPictureTaken) {
      onPictureTaken(uri);
    }
  }
}

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => !current);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: true,
        });
        if (photo && photo.uri) {
          setCapturedImage(photo.uri);
          if (onPictureTaken) {
            await onPictureTaken(photo.uri);
          }
        }
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  if (capturedImage) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        <View style={styles.previewButtons}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => setCapturedImage(null)}
          >
            <MaterialIcons name="cancel" size={30} color="white" />
            <Text style={styles.previewButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => handleImageCapture(capturedImage)}
          >
            <MaterialIcons name="check-circle" size={30} color="white" />
            <Text style={styles.previewButtonText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash ? "on" : "off"}
      >
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={onClose}>
            <MaterialIcons name="close" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <MaterialIcons
              name={flash ? "flash-on" : "flash-off"}
              size={30}
              color="white"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <MaterialIcons name="flip-camera-ios" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handlePickFromGallery}
          >
            <MaterialIcons name="photo-library" size={30} color="white" />
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  galleryButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 15,
    borderRadius: 50,
  },
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 50,
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: -100,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 15,
    borderRadius: 50,
  },
  captureButton: {
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 50,
    padding: 5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  placeholder: {
    width: 60,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  previewImage: {
    flex: 1,
    resizeMode: "contain",
  },
  previewButtons: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  previewButton: {
    alignItems: "center",
  },
  previewButtonText: {
    color: "white",
    marginTop: 5,
    fontSize: 16,
  },
});
