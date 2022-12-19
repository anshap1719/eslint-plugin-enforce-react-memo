import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint';
import enforceReactMemo from '../../rules/enforceReactMemo';

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('enforce-react-memo', enforceReactMemo, {
    valid: [
        {
            code: `
                const component = () => {
                    return <div>Something</div>;
                };

                export default component;
            `,
        },
    ],
    invalid: [],
});
