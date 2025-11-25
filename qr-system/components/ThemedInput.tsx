import React from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  TextStyle,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTheme } from "@/context/ThemeContext";

interface ThemedInputProps extends TextInputProps {
  hasValue?: boolean;
  error?: boolean;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({
  hasValue = false,
  error = false,
  style,
  ...props
}) => {
  const textColor = useThemeColor("text");
  const borderColor = useThemeColor("border");
  const accentColor = useThemeColor("accent");
  const errorColor = useThemeColor("error");
  const mutedColor = useThemeColor("muted");
  const { themeMode } = useTheme();

  const inputStyle: TextStyle = {
    backgroundColor: themeMode === "dark" ? "#2A2A2A" : "#F8F8F8",
    borderColor: error ? errorColor : hasValue ? accentColor : borderColor,
    color: textColor,
    borderWidth: hasValue ? 2 : 1,
  };

  return (
    <TextInput
      className="px-5 py-4 rounded-2xl border pr-12"
      style={[styles.input, inputStyle, style]}
      placeholderTextColor={mutedColor}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 16,
    fontSize: 16,
  },
});