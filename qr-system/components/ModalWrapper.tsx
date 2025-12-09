import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTheme } from "@/context/ThemeContext";

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  style?: ViewStyle;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  children,
  onClose,
  showCloseButton = true,
  style,
}) => {
  const backgroundColor = useThemeColor("background");
  const secondaryColor = useThemeColor("secondary");
  const { themeMode } = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  };

  const keyboardAvoidingViewStyle: ViewStyle = {
    flex: 1,
    backgroundColor: backgroundColor,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 15,
  };

  return (
    <View style={[containerStyle, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={keyboardAvoidingViewStyle}
      >
        {showCloseButton && onClose && (
          <SafeAreaView className="flex-row justify-end px-4 pt-4">
            <TouchableOpacity
              onPress={onClose}
              className="w-12 h-12 rounded-[14px] items-center justify-center"
              style={{ backgroundColor: secondaryColor + "20" }}
            >
              <Text
                style={{ color: secondaryColor }}
                className="text-xl font-semibold"
              >
                ✕
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        )}
        <View className="flex-1 px-6 justify-between">
          {children}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
});