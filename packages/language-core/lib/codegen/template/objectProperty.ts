import { camelize } from '@vue/shared';
import type { Code, VueCodeInformation } from '../../types';
import { combineLastMapping, identifierRegex } from '../utils';
import { generateCamelized } from '../utils/camelized';
import { generateStringLiteralKey } from '../utils/stringLiteralKey';
import { wrapWith } from '../utils/wrapWith';
import type { TemplateCodegenContext } from './context';
import type { TemplateCodegenOptions } from './index';
import { generateInterpolation } from './interpolation';

export function* generateObjectProperty(
	options: TemplateCodegenOptions,
	ctx: TemplateCodegenContext,
	code: string,
	offset: number,
	features: VueCodeInformation,
	astHolder?: any,
	shouldCamelize = false,
	shouldBeConstant = false,
): Generator<Code> {
	if (code.startsWith('[') && code.endsWith(']') && astHolder) {
		if (shouldBeConstant) {
			yield* generateInterpolation(
				options,
				ctx,
				'template',
				features,
				code.slice(1, -1),
				offset + 1,
				astHolder,
				`[__VLS_tryAsConstant(`,
				`)]`,
			);
		}
		else {
			yield* generateInterpolation(
				options,
				ctx,
				'template',
				features,
				code,
				offset,
				astHolder,
			);
		}
	}
	else if (shouldCamelize) {
		if (identifierRegex.test(camelize(code))) {
			yield* generateCamelized(code, 'template', offset, features);
		}
		else {
			yield* wrapWith(
				offset,
				offset + code.length,
				features,
				`'`,
				...generateCamelized(code, 'template', offset, combineLastMapping),
				`'`,
			);
		}
	}
	else {
		if (identifierRegex.test(code)) {
			yield [code, 'template', offset, features];
		}
		else {
			yield* generateStringLiteralKey(code, offset, features);
		}
	}
}
