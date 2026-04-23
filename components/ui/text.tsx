import { Text as RNText, type TextProps } from 'react-native'

const tailwindWeightMap: Record<string, string> = {
	'font-thin': 'Outfit_100Thin',
	'font-extralight': 'Outfit_200ExtraLight',
	'font-light': 'Outfit_300Light',
	'font-normal': 'Outfit_400Regular',
	'font-medium': 'Outfit_500Medium',
	'font-semibold': 'Outfit_600SemiBold',
	'font-bold': 'Outfit_700Bold',
	'font-extrabold': 'Outfit_800ExtraBold',
	'font-black': 'Outfit_900Black',
}

function getFontFamily(className?: string): string {
	const match = className?.split(' ').find(c => c in tailwindWeightMap)
	return match ? tailwindWeightMap[match] : 'Outfit_400Regular'
}

interface AppTextProps extends Omit<TextProps, 'style'> {
	style?: Omit<TextProps['style'], 'fontFamily' | 'fontWeight'>
}

export function Text({ className, style, ...props }: AppTextProps) {
	return <RNText className={className} style={[{ fontFamily: getFontFamily(className) }, style]} {...props} />
}
