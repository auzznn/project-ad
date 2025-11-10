import React from "react";
import {
  View,
  Text,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedInput } from "./ThemedInput";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  showIndicator?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  containerStyle,
  showIndicator = true,
  value,
  ...props
}) => {
  const textColor = useThemeColor("text");
  const errorColor = useThemeColor("error");
  const accentColor = useThemeColor("accent");
  const hasValue = Boolean(value && value.toString().length > 0);

  return (
    <View className="mb-6" style={containerStyle}>
      <Text
        className="text-base font-semibold mb-3"
        style={{ color: textColor }}
      >
        {label}
      </Text>
      <View className="relative">
        <ThemedInput
          value={value}
          hasValue={hasValue}
          error={!!error}
          {...props}
        />
        {showIndicator && hasValue && (
          <View
            className="absolute right-4 top-1/2 -mt-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        )}
      </View>
      {error && (
        <Text
          className="text-sm mt-2 ml-1"
          style={{ color: errorColor }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
});