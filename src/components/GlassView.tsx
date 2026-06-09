import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { GlassStyles } from '../constants/theme';

interface GlassViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gradientColors?: string[];
  noPadding?: boolean;
}

export const GlassView: React.FC<GlassViewProps> = ({ 
  children, 
  style,
  gradientColors,
  noPadding = false
}) => {
  const { theme, borderRadius } = useApp();
  const glassStyle = GlassStyles[theme];

  // Default transparent glass gradient colors if not provided
  const defaultGradient = theme === 'dark' 
    ? ['rgba(255, 255, 255, 0.07)', 'rgba(255, 255, 255, 0.02)']
    : ['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.4)'];

  const colors = gradientColors || defaultGradient;

  return (
    <View style={[styles.outerContainer, glassStyle, { borderRadius }, style]}>
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={[styles.content, noPadding && { padding: 0 }]}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
  },
  content: {
    padding: 16,
    width: '100%',
  }
});
export default GlassView;
