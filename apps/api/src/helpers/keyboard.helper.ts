export class KeyboardHelper {
	private static EN_LAYOUT = [
		'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\',
		'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'',
		'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',
	];

	private static RU_LAYOUT = [
		'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', '\\',
		'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э',
		'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.',
	];

	private static TRANS_RU_TO_EN = [
		['а', 'a'],
		['б', 'b'],
		['в', 'v'],
		['г', 'g'],
		['д', 'd'],
		['е', 'e'],
		['ё', 'e'],
		['ж', 'zh'],
		['з', 'z'],
		['и', 'i'],
		['й', 'y'],
		['к', 'k'],
		['л', 'l'],
		['м', 'm'],
		['н', 'n'],
		['о', 'o'],
		['п', 'p'],
		['р', 'r'],
		['с', 's'],
		['т', 't'],
		['у', 'u'],
		['ф', 'f'],
		['х', 'kh'],
		['ц', 'ts'],
		['ч', 'ch'],
		['ш', 'sh'],
		['щ', 'shch'],
		['ъ', ''],
		['ы', 'y'],
		['ь', ''],
		['э', 'e'],
		['ю', 'iu'],
		['я', 'ia'],
	];

	private static TRANS_EN_TO_RU = [
		['a', 'а'],
		['b', 'б'],
		['c', 'ц'],
		['d', 'д'],
		['e', 'е'],
		['f', 'ф'],
		['g', 'г'],
		['h', 'х'],
		['i', 'и'],
		['j', 'ж'],
		['k', 'к'],
		['l', 'л'],
		['m', 'м'],
		['n', 'н'],
		['o', 'о'],
		['p', 'п'],
		['q', 'к'],
		['r', 'р'],
		['s', 'с'],
		['t', 'т'],
		['u', 'у'],
		['v', 'в'],
		['w', 'в'],
		['x', 'кс'],
		['y', 'й'],
		['z', 'з'],
	];

	static layoutFromRuToEn = (text: string): string => {
		return text.split('').map((item) => {
			const index = KeyboardHelper.RU_LAYOUT.indexOf(item);
			return index !== -1 ? KeyboardHelper.EN_LAYOUT[index] : item;
		}).join('');
	}

	static layoutFromEnToRu = (text: string): string => {
		return text.split('').map((item) => {
			const index = KeyboardHelper.EN_LAYOUT.indexOf(item);
			return index !== -1 ? KeyboardHelper.RU_LAYOUT[index] : item;
		}).join('');
	}

	static transFromRuToEn = (text: string): string => {
		return text.split('').reduce((acc, item) => {
			const found = KeyboardHelper.TRANS_RU_TO_EN.find((i) => i[0] === item);
			if (found) { acc.push(found[1]) }
			return acc;
		}, []).join('');
	}

	static transFromEnToRu = (text: string): string => {
		return text.split('').reduce((acc, item) => {
			const found = KeyboardHelper.TRANS_EN_TO_RU.find((i) => i[0] === item);
			if (found) { acc.push(found[1]) }
			return acc;
		}, []).join('');
	}

}
