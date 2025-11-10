import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface LoadingButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "accent";
  size?: "small" | "medium" | "large";
  textStyle?: TextStyle;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  loading = false,
  loadingText,
  variant = "primary",
  size = "medium",
  textStyle,
  style,
  disabled,
  ...props
}) => {
  const primaryColor = useThemeColor("primary");
  const secondaryColor = useThemeColor("secondary");
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  const getBackgroundColor = () => {
    if (loading) return mutedColor;
    
    switch (variant) {
      case "secondary":
        return secondaryColor;
      case "accent":
        return accentColor;
      default:
        return primaryColor;
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return "py-3 px-4";
      case "large":
        return "py-6 px-8";
      default:
        return "py-5 px-6";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return "text-sm";
      case "large":
        return "text-xl";
      default:
        return "text-lg";
    }
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    shadowColor: getBackgroundColor(),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    opacity: loading ? 0.8 : 1,
  };

  const buttonTextStyle: TextStyle = {
    color: "#FFFFFF",
  };

  return (
    <TouchableOpacity
      className={`${getPadding()} rounded-2xl items-center shadow-lg flex-row justify-center`}
      style={[styles.button, buttonStyle, style]}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          color="#FFFFFF"
          size="small"
          style={{ marginRight: 8 }}
        />
      )}
      <Text
        className={`font-bold ${getTextSize()}`}
        style={[styles.buttonText, buttonTextStyle, textStyle]}
      >
        {loading ? (loadingText || "") : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
  },
  buttonText: {
    textAlign: "center",
  },
});