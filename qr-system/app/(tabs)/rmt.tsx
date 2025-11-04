import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useThemeColor } from '@/hooks/useThemeColor'

export default function rmt() {
  const backgroundColor = useThemeColor('background')
  const textColor = useThemeColor('text')
  
  return (
    <SafeAreaView style={{backgroundColor}} className='flex-1 items-center justify-center'>
      <Text style={{color: textColor}}>To be updated!</Text>
    </SafeAreaView>
  )
}