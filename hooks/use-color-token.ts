import { useNativeVariable } from 'react-native-css/native'

/**
 * Resolves a CSS custom property (e.g. '--primary') to its current string
 * color value on native. Use this wherever a JS color string is required,
 * such as icon `color` props or Animated.View `backgroundColor`.
 */
export function useColorToken(name: string): string {
	return useNativeVariable(name) as string
}
