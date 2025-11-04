import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { useThemeColor } from '@/hooks/useThemeColor'

export default function leaderboard() {
  const backgroundColor = useThemeColor('background')
  const textColor = useThemeColor('text')
  return (
    <SafeAreaView style={{backgroundColor}} className='flex-1 justify-center items-center'>
      <Text style={{color: textColor}}>To be updated!</Text>
    </SafeAreaView>
    
  )
}