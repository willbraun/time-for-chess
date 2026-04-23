import { Text as RNText, type TextProps } from 'react-native'

const tailwindWeightMap: Record<string, string> = {
	'font-thin': 'PlusJakartaSans_100Thin',
	'font-extralight': 'PlusJakartaSans_200ExtraLight',
	'font-light': 'PlusJakartaSans_300Light',
	'font-normal': 'PlusJakartaSans_400Regular',
	'font-medium': 'PlusJakartaSans_500Medium',
	'font-semibold': 'PlusJakartaSans_600SemiBold',
	'font-bold': 'PlusJakartaSans_700Bold',
	'font-extrabold': 'PlusJakartaSans_800ExtraBold',
	'font-black': 'PlusJakartaSans_900Black',
}

function getFontFamily(className?: string): string {
	const match = className?.split(' ').find(c => c in tailwindWeightMap)
	return match ? tailwindWeightMap[match] : 'PlusJakartaSans_400Regular'
}

interface AppTextProps extends Omit<TextProps, 'style'> {
	style?: Omit<TextProps['style'], 'fontFamily' | 'fontWeight'>
}

export function Text({ className, style, ...props }: AppTextProps) {
	return <RNText className={className} style={[{ fontFamily: getFontFamily(className) }, style]} {...props} />
}
