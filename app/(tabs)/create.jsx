import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useAuthStore } from "../../store/authStore";
import { API_BASE_URL } from "../../constants/api"; // Adjust the import based on your project structure

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(2);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();
 
  const handleImagePick = async () => {
    try{
      if(Platform.OS !== "web"){
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(status !== "granted"){
          Alert.alert("Permission to access camera roll is required!");
          return;
        }
        // console.log(status);
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduced quality for smaller size
        base64: true, // Get base64 string of the image
      })
      if(!result.canceled){
        setImage(result.assets[0].uri); // Set the image URI for preview
        if(result.assets[0].base64){
          setImageBase64(result.assets[0].base64); // Store base64 string
        }else{
          //otherwise convert the image to base64
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64
          });
          setImageBase64(base64); // Set the base64 string
        }
      }
    }catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error picking image", "Please try again.");
    }
  };

  const handleSubmit = async () => {
    if(!title || !caption || !imageBase64 || !rating){ 
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    try{
      setIsLoading(true);
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;
      const response = await fetch(`${API_BASE_URL}/books`, {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    }catch (error) {
      console.error("Error submitting data:", error);
      Alert.alert("Error", "There was an issue submitting your recommendation. Please try again.");
    }
  };

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendations</Text>
            <Text style={styles.subtitle}>
              Share your favourite reads with others
            </Text>
          </View>

          <View style={styles.form}>
            {/* Title Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter book title"
                />
              </View>
            </View>

            {/* rating Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Rating</Text>
              {renderRatingPicker()}
            </View>

            {/* Image Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={handleImagePick}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>
                      Tap to select an image
                    </Text>
                  </View>
                ) }
              </TouchableOpacity>
            </View>

            {/* Caption Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
                <TextInput
                  style={styles.textArea}
                  placeholderTextColor={COLORS.placeholderText}
                  placeholder="Write your thoughts about the book"
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color={COLORS.white}
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Share</Text>
                  </>
                )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
