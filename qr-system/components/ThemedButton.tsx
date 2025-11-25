import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  TextStyle,
  ViewStyle,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "accent";
  size?: "small" | "medium" | "large";
  textStyle?: TextStyle;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  textStyle,
  style,
  ...props
}) => {
  const primaryColor = useThemeColor("primary");
  const secondaryColor = useThemeColor("secondary");
  const accentColor = useThemeColor("accent");
  const textColor = useThemeColor("text");
  const mutedColor = useThemeColor("muted");

  const getBackgroundColor = () => {
    switch (variant) {
      case "secondary":
        return secondaryColor;
      case "accent":
        return accentColor;
      default:
        return primaryColor;
    }
  };

  const getTextColor = () => {
    return "#FFFFFF"; // White text for all button variants
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
  };

  const buttonTextStyle: TextStyle = {
    color: getTextColor(),
  };

  return (
    <TouchableOpacity
      className={`${getPadding()} rounded-2xl items-center shadow-lg`}
      style={[styles.button, buttonStyle, style]}
      {...props}
    >
      <Text
        className={`font-bold ${getTextSize()}`}
        style={[styles.buttonText, buttonTextStyle, textStyle]}
      >
        {title}
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