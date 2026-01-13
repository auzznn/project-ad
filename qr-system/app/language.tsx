import { Text, View, TouchableOpacity } from "react-native";
import React, { Component } from "react";
import { router } from "expo-router";
import { useLanguage } from "../context/LanguageContext";
import { useThemeColor } from "../hooks/useThemeColor";
import { useTranslation } from "../hooks/useTranslation";
import { ModalWrapper } from "../components/ModalWrapper";

export class language extends Component {
  render() {
    return <LanguageScreen />;
  }
}

const LanguageScreen = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const background = useThemeColor('background');
  const text = useThemeColor('text');
  const primary = useThemeColor('primary');
  const border = useThemeColor('border');
  const card = useThemeColor('card');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ms', name: 'Bahasa Melayu' },
  ];

  return (
    <ModalWrapper onClose={() => router.back()}>
      <View className="flex-1 px-4">
        <Text style={{ color: text }} className="text-2xl font-bold mb-2">{t('language')}</Text>
        <Text style={{ color: text }} className="text-gray-500 mb-6">{t('selectLanguage')}</Text>
        
        <View className="space-y-3">
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              style={{
                backgroundColor: card,
                borderColor: language === lang.code ? primary : border,
              }}
              className="p-4 rounded-lg border-2"
            >
              <Text style={{ color: language === lang.code ? primary : text }} className={`text-lg font-medium`}>
                {lang.name}
              </Text>
              {language === lang.code && (
                <Text style={{ color: primary }} className="text-sm mt-1">{t('currentSelection')}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ModalWrapper>
  );
};

export default language;
